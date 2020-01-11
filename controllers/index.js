const User = require("../models/user");
const Post = require("../models/post");
const passport = require("passport");
const mapBoxToken = process.env.MAPBOX_TOKEN;

module.exports = {
  // SHOW REGISTER FORM
  getRegister(req, res, next) {
    res.render("register", { title: "Register", username: "", email: "" });
  },
  // SINGUP CONTROLLER

  // NON USIAMO TRY E CATCH PER GESTIRE GLI ERRORI IN QUANTO USIAMO IL MIDDLEWARE errorHanler
  // DEFINITO IN middleware/index.js CHE ESEGUE IL CONTROLLER E IN CASO DI ERRORE ESEGUE IL MIDDLEWARE
  // DI EXPRESS PER LA GESTIONE DEGLI ERRORI (che visualizza l'errore nella view error.ejs)
  async postRegister(req, res, next) {
    /* testiamo il codice, SE CI SONO DEGLI ERRORI VUOL DIRE CHE: l'email inserita è già stata usata, 
       o lo username è già stato usato NN CI POSSONO ESSERE ALTRI ERRORI */
    try {
      let user = await User.register(new User(req.body), req.body.password);
      // quando l'utente si iscrive viene loggato in automatico
      req.login(user, err => {
        // se nn ci sono stati errori nel login viene reindirizzato alla landing con un messaggio di benvenuto
        if (err) return next(err);
        req.session.success = `Welcome to the Surf Store app ${user.username}!`;
        res.redirect("/");
      });
    } catch (err) {
      const { email, username } = req.body;
      // NEL CASO DI UN ERRORE
      // prendiamo il messaggio
      let error = err.message;
      // se il messaggio di errore è quello di mongoose (relativo al fatto che L'EMAIL É GIÁ STATA USATA)
      // ALTRIMENTI E' L'ERRORE GENERATO DA PASSPORT PERCHÉ LO USERNAME E' GIÁ STATO USATO.
      if (error.includes("duplicate key") && error.includes("index: email_1")) {
        error = "A user with the given email is already registered";
      }
      req.session.error = error;
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
    res.render("login", { title: "Login" });
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
        const url = req.session.previousUrl || "/";
        // lo eliminiamo dalla sessione
        delete req.session.previousUrl;
        // settiamo il messaggio di benvenuto
        req.session.success = `Welcome back ${username}!`;
        // facciamo il redirect
        res.redirect(url);
      });
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
    res.redirect("/");
  },

  async getLandingPage(req, res, next) {
    // seleziona tutti i post (in modo da mostrare le loro località nella mappa)
    let posts = await Post.find();
    // renderizza la view context: post, mapBoxToken, title
    // il token di mapbox serve per visualizzare la mappa nella view
    res.render("index", { posts, mapBoxToken, title: "Surf Shop - Home" });
  }
};
