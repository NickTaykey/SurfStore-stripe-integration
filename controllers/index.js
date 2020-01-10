const User = require("../models/user");
const Post = require("../models/post");
const passport = require("passport");
const mapBoxToken = process.env.MAPBOX_TOKEN;

module.exports = {
  // SHOW REGISTER FORM
  getRegister(req, res, next) {
    res.render("register", { title: "Register" });
  },
  // SINGUP CONTROLLER

  // NON USIAMO TRY E CATCH PER GESTIRE GLI ERRORI IN QUANTO USIAMO IL MIDDLEWARE errorHanler
  // DEFINITO IN middleware/index.js CHE ESEGUE IL CONTROLLER E IN CASO DI ERRORE ESEGUE IL MIDDLEWARE
  // DI EXPRESS PER LA GESTIONE DEGLI ERRORI (che visualizza l'errore nella view error.ejs)
  async postRegister(req, res, next) {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      image: req.body.image
    });
    let user = await User.register(newUser, req.body.password);
    // quando l'utente si iscrive viene loggato in automatico
    req.login(user, err => {
      // se nn ci sono stati errori nel login viene reindirizzato alla landing con un messaggio di benvenuto
      if (err) return next(err);
      req.session.success = `Welcome to the Surf Store app ${user.username}!`;
      res.redirect("/");
    });
  },
  // SHOW LOGIN FORM
  getLogin(req, res, next) {
    res.render("login", { title: "Login" });
  },

  // LOGIN CONTROLLER
  postLogin(req, res, next) {
    /* 
      possiamo USARE PASSPORT.AUTHENTICATE() PER FARE IL LOGIN DI UN UTENTE DA DENTRO IL CONTROLLER
      ma non ci basta richiamarlo, dato che è un METODO CHE RITORNA UNA FUNZIONE (che sarebbe un middleware
      che quando usiamo questo metodo passandolo direttamente alla route viene associato alla route in questione
      ed eseguito quando un utente va a quella route), ma DOBBIAMO ANCHE ESEGUIRE LA FUNZIONE CHE RITORNA IN MODO
      CHE FACCIA VERAMETE IL LOGIN quando andiamo a questa route cioè in modo che il suo codice venga veramente eseguito
      e INOLTRE DOVREMMO PASSARE TRA () ANCHE I PARAMETRI REQ, RES, NEXT (anche questi passati di default quando usiamo
      il metodo come middleware IN QUANTO HA BISOGNO DI ACCEDERE ALLA RICHIESTA E ALLA RISPOSTA PER FARE IL LOGIN),
      quindi dovremmo passare come VALORI A QUESTI PARAMETRI I REQ, RES, E NEXT CHE SONO STATI PASSATI AL CONTROLLER.
    */
    passport.authenticate("local", {
      // se l'utente si logga con successo vogliamo che venga reindirizzato alla home
      successRedirect: "/",
      // altrimenti lo reindirizziamo al form di login
      failureRedirect: "/login"
    })(req, res, next);
  },

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
