const User = require("../models/user");
const Post = require("../models/post");
const util = require("util");
const { deleteProfileImage } = require("../middleware");
const { cloudinary } = require("../cloudinary");
const mapBoxToken = process.env.MAPBOX_TOKEN;
// per generare il token del pwd reset
const crypto = require("crypto");
// API di sendgrid per inviare email dal codice
const sgMail = require("@sendgrid/mail");
// ci autentichiamo con il nostro account al API di sendgrid in modo da poter mandare email dal codice
// con il nostro account
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  // SHOW REGISTER FORM only if the user is not logged in
  getRegister(req, res, next) {
    if (req.isAuthenticated()) return res.redirect("/posts");
    res.render("register", {
      title: "Register",
      username: "",
      email: ""
    });
  },
  // SINGUP CONTROLLER

  // NON USIAMO TRY E CATCH PER GESTIRE GLI ERRORI IN QUANTO USIAMO IL MIDDLEWARE errorHanler
  // DEFINITO IN middleware/index.js CHE ESEGUE IL CONTROLLER E IN CASO DI ERRORE ESEGUE IL MIDDLEWARE
  // DI EXPRESS PER LA GESTIONE DEGLI ERRORI (che visualizza l'errore nella view error.ejs)
  async postRegister(req, res, next) {
    /* testiamo il codice, SE CI SONO DEGLI ERRORI VUOL DIRE CHE: l'email inserita è già stata usata, 
       o lo username è già stato usato NN CI POSSONO ESSERE ALTRI ERRORI */
    try {
      // controlliamo se c'è un immagine
      // eval(require("locus"));

      if (req.file) {
        // se si associamo i dati del immagine su cloudinary nel oggetto del db
        const { public_id, secure_url } = req.file;
        req.body.image = { public_id, secure_url };
        // se non c'era niente lasciamo il db associare l'immagine di default (in questo caso niente public_id)
      }

      let user = await User.register(new User(req.body), req.body.password);
      // quando l'utente si iscrive viene loggato in automatico
      req.login(user, err => {
        // se nn ci sono stati errori nel login viene reindirizzato alla landing con un messaggio di benvenuto
        if (err) {
          // cancelliamo l'immagine profilo
          deleteProfileImage(req);
          return next(err);
        }
        req.session.success = `Welcome to the Surf Store app ${user.username}!`;
        res.redirect("/posts");
      });
    } catch (err) {
      const { email, username } = req.body;
      // cancelliamo l'immagine profilo
      deleteProfileImage(req);
      // NEL CASO DI UN ERRORE
      // prendiamo il messaggio
      let error = err.message;
      // se il messaggio di errore è quello di mongoose (relativo al fatto che L'EMAIL É GIÁ STATA USATA)
      // ALTRIMENTI E' L'ERRORE GENERATO DA PASSPORT PERCHÉ LO USERNAME E' GIÁ STATO USATO.
      if (error.includes("duplicate key") && error.includes("index: email_1")) {
        error = "A user with the given email is already registered";
      }
      // renderiziamo il form con il valore dei campi inseriti NON LA PASSWORD PER MOTIVI DI SICUREZZA
      res.render("register", {
        title: "Register",
        username,
        email,
        error
      });
    }
  },
  // SHOW LOGIN FORM
  getLogin(req, res, next) {
    if (req.isAuthenticated()) return res.redirect("/posts");
    // se è specificato un returnTo=true in query string settiamo il redirectUrl nella sessione a req.header.referer
    if (req.query.returnTo) req.session.previousUrl = req.headers.referer;
    res.render("login", { title: "Login", username: "" });
  },

  /* LOGIN CONTROLLER (lo abbiamo modificato perché vogliamo che l'url di redirect sia variabile in base
  al valore di req.session.previousUrl ) */
  async postLogin(req, res, next) {
    // troviamo username e password
    const { username, password } = req.body;
    // controlliamo se sono corretti usando passport.authenticate
    let { user, err } = await User.authenticate()(username, password);
    // se sono corretti (no errori + un utente ritornato)
    if (!err && user) {
      // loggiamo l'utente con req.login()
      req.login(user, err => {
        // nella callback SE NON CI SONO ERRORI facciamo il redirect
        if (err) return next(err);
        // troviamo l'url nella sessione (se non c'è lo settiamo a "/")
        const url = req.session.previousUrl || "/posts";
        // lo eliminiamo dalla sessione
        delete req.session.previousUrl;
        // settiamo il messaggio di benvenuto
        req.session.success = `Welcome back ${username}!`;
        // facciamo il redirect
        res.redirect(url);
      });
    } else if (err) return next(err);
    else {
      // user non trovato
      const error = "Invalid username or password";
      res.render("login", { title: "Login", error, username });
    }
  },
  /* USANDO User.authenticate()(username, password) stiamo controllando se c'è un utente che ha queste
  credenziali (se nn ci sono errori e c'è un utente allora le credenziali sono corrette)
  con req.login() stiamo loggando l'utente (creando una sessione http valida per quel login) */

  // LOGOUT CONTROLLER
  getLogout(req, res, next) {
    // facciamo il logout del utente
    req.logout();
    // reindirizziamo l'utente alla home page
    res.redirect("/posts");
  },

  async getLandingPage(req, res, next) {
    /* seleziona tutti i post (in modo da mostrare le loro località nella mappa)
    selezioniamo tutti i post dai più recenti ai meno recenti */
    let posts = await Post.find().sort("-_id").exec();
    // selezianiamo solo i 3 posts più recenti
    let recentPosts = posts.slice(0, 3);
    // renderizza la view context: post, mapBoxToken, title
    // il token di mapbox serve per visualizzare la mappa nella view
    res.render("index", { posts, recentPosts, mapBoxToken, title: "Surf Shop - Home" });
  },
  async getProfile(req, res, next) {
    // trova i primi 10 post del utente
    let posts = await Post.find()
      .where("author")
      .equals(req.user._id)
      .limit(10)
      .exec();
    res.render("profile", { posts, title: "Surf Store | my profile" });
  },
  // aggiorna tutte le proprietà del utente ESCLUSE LE PASSWORD (gestite dai middleware)
  async updateProfile(req, res, next) {
    const { user } = res.locals;
    const { username, email } = req.body;

    // controlliamo se a username e email sono stati passati dei valori nel form (se no non facciamo NIENTE)
    // forma di validazione di queste proprietà lato server IN QUESTO MODO EVITIAMO DI CAUSARE DANNI LEGATI AL
    // FATTO CHE L'UTENTE HA INSERITO VALORI INVALIDI O ASSETI PER LE CREDENZIALI, CON GLI ERRORI CORRELATI
    if (username) user.username = username;
    if (email) user.email = email;

    // controlliamo se c'è un immagine con cui uploadare quella attuale
    if (req.file) {
      // se c'è cancelliamo quella attuale (se l'immagine attuale non è quella di defualt ha un public_id E' SU CLOUDINARY)
      if (req.user.image.public_id) {
        await cloudinary.v2.uploader.destroy(req.user.image.public_id);
      }
      // associamo l'immagine nuova al oggetto del DB
      const { public_id, secure_url } = req.file;
      user.image = { public_id, secure_url };
    }
    await user.save();
    // rifacciamo il login perché nel caso in cui l'utente ha cambiato pwd o username la sessione non è più valida
    // usiamo il metodo promisify di util per creare una versione di un metodo req.login (CHE SUPPORTA SOLO LE CALLBACK E NON LE PROMESSE
    // ) PER OTTENERNE UNA VERSIONE CHE SUPPORTA LE PROMESSE E QUINDI ASYNC AWAITIN MODO DA TENERE IL CODICE COESO PER QUATO RIGUARDA
    // LE STRATEGIE PER LA GESTIONE DEL CODICE ASINCRONO, dato che dobbiamo associare il valore di this come req, in quanto il metodo viveva dentro
    // req e quindi si aspettava di averlo come valore di this
    const login = util.promisify(req.login.bind(req));
    await login(user);
    if(req.xhr) return res.json(user);
  },
  // renderizza forgor.ejs
  getForgot(req, res, next) {
    res.render("users/forgot");
  },
  // controlla se l'email è valida, setta token e data di scadenza ed invia la mail
  async putForgot(req, res, next) {
    const { email } = req.body;
    // trova l'utente con l'email messa nel form
    let user = await User.findOne({ email });
    // se l'utente non è presente nel DB, messaggio di errore, non possiamo procedere nel resettare la pwd di un utente che nn esiste
    if (!user) {
      req.session.error = `The user with the email: ${email} is not registered`;
      return res.redirect("/forgot-password");
    }
    // settiamo il token e la data di scadenza un ora dopo la creazione del token
    user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    // inivio del email
    // creiamo un oggetto che modella l'email
    const msg = {
      // destinatario
      to: email,
      /* 
      mittente (dato che inviamo usando sendgrid allora l'email nn viene inviata da un indrizzo email 
      vero e proprio, ma dal servizio di mailing di sendgrid quindi l'email, se venisse inviata di default
      non apparirebbe inviata da nessun indrizzo email, quindi per ragioni di sicurezza, di traciabilità e
      per evitare ambiguità SENDGRID CI OBBLIGA A SPECIFICARE L'INDRIZZO A CUI NOME SARA' INVIATA L'EMAIL)
      lo specifichiamo direttamete nel campo from possiamo anche aggiungere del testo dopo questo campo
      EVIDENZIAMO L'INDRIZZO TRA < > IN OGNI CASO L'UTENTE VEDRA' ANCHE CHE L'EMAIL E' STATA INVIATA USANDO 
      SENDGRID COME SERVIZIO PER RAGIONI DI SICUREZZA.
      */
      from: "The Surf-Store Team <authTeam@surfStore.local>",
      // oggetto email
      subject: "Request to reset your surf-store account password",
      /* 
      testo vero e proprio, qui usiamo la sintassi, template string litteral per aggiungere i valori delle
      variabili in modo più semplice, (USIAMO req.headers.host per accedere al nome del host del sito web
      "localhost:3000"), sanitiziamo la stringa usando replace e rimuovendo tutti i whitespaces che sono stati
      aggiunti a causa del fatto che siamo andati a capo per vedere meglio il contenuto della stringa dal codice
      (vengono renderizzati come contenuto della stringa quando usiamo la sintassi string literals) li rimpiazziamo
      con un "" .
      */
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
			Please click on the following link, or copy and paste it into your browser to complete the process:
			http://${req.headers.host}/reset/${user.resetPasswordToken}
			If you did not request this, please ignore this email and your password will remain unchanged.`.replace(
        /			/g,
        ""
      )
    };
    // inviamo l'email
    await sgMail.send(msg);
    // messaggio di successo e redirect
    req.session.success =
      "An email with further instruction has been sent to you";
    res.redirect("/forgot-password");
  },
  /* viene attivato da link mandato per email e controlla se il token è stato associato
   a qualche utente e se nn è scaduto, se passa in controlli renderizza reset.ejs */
  async getReset(req, res, next) {
    const { token } = req.params;
    res.render("users/reset", { token });
  },
  // DOPO AVER VALIDATO IL TOKEN resetta la password del utente
  async putReset(req, res, next) {
    const { user } = res.locals;
    const { newPassword, confirmPassword } = req.body;
    const { token } = req.params;
    if (newPassword === confirmPassword) {
      await user.setPassword(newPassword);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      const login = util.promisify(req.login.bind(req));
      await login(user);
      const msg = {
        to: user.email,
        from: "The Surf-Store Team <authTeam@surfStore.local>",
        subject: "Your password has been successfully reseted",
        text:
          "Your account password has been successfully reseted, if you did not do that, reply us at once"
      };
      await sgMail.send(msg);
      req.session.success = "Your password has been successfully reseted";
      res.redirect("/posts");
    } else {
      req.session.error = "Passwords do not match!";
      return res.redirect(`/reset/${token}`);
    }
  },
  // E-COMMERCE FEATURE CONTROLLERS
  async addItemToTheCart(req, res, next){
    // trovo utente
    let user = await User.findById(req.user._id);
    // trovo post, controllo se esiste
    let post = await Post.findById(req.params.id);
    if(post){
      // aggiungo post al carrello
      user.shoppingCart.push(post);
      // salvo modifiche
      await user.save();
      // ritorno JSON con il post da aggiungere al carrello
      res.json(post);
    } else {
      req.session.error = "Post not found";
      res.redirect("/posts");
    }
  },
  // rimuover un post dal carrello
  async deleteItemInTheCart(req, res, next){
     let user = await User.findById(req.user._id);
     let post = await Post.findById(req.params.id);
     if(post){
       const index = user.shoppingCart.indexOf(post._id);
       user.shoppingCart.splice(index, 1);
       await user.save();
       res.json(user);
     } else {
      req.session.error = "Post not existing!";
      res.redirect("/posts");
    }
  },
};
