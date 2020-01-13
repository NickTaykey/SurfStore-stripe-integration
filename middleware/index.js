const Review = require("../models/review");
const User = require("../models/user");
const Post = require("../models/post");
// GENERAL PURPOSE MIDDLEWARES
module.exports = {
  /*
    MIDDLEWARE PER GESTIRE GLI ERRORI NEI CONTROLLERS, ESEGUE IL CODICE DEL CONTROLLER E SE CI SONO DEGLI
    ERRORI ESEGUE NEXT IL MIDDLEWARE PER LA GESTIONE DEGLI ERRORI BUILT-IN IN EXPRESS, ALTRIMENTI NON FA
    NIENTE
  */
  /* 
    middleware che prende come parametro il controller di cui deve gestire gli errori e, ritorna una funzione
    che esegue il controller, modella il suo flusso di esecuzione in una promessa (in cui pending è associato
    quando il codice è ancora in esecuzione, fulfilled quando l'esecuzione è stata completata con successo, e
    rejected quando non è potuta essere stata completata a causa di degli errori o di delle promesse fallite e
    non gestite) su questa promessa applichiamo un catch che scatterà in caso di rejection ed eseguirà il middleware
    per la gestione degli errori, non mettiamo nessun then in quanto se la promessa è completata con successo non
    vogliamo fare niente, in questo caso il codice è stato completato con successo e tutto è andato bene.
  */
  asyncErrorHandler(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
  },
  // controlla se l'utente loggato ha creato la review in questione
  async checkReviewAuthor(req, res, next) {
    let review = await Review.findById(req.params.review_id);
    if (review.author.equals(req.user._id)) return next();
    req.session.error = "You are not authorized to update that review";
    res.redirect(`/posts/${req.params.id}/`);
  },
  // controlla se l'utente è loggato
  isLoggedIn(req, res, next) {
    // se l'utente è loggato esegue next
    if (req.isAuthenticated()) return next();
    // se nn è loggato redirige a login con un errore e l'url originale nella sessione
    req.session.error = "You have to be logged in to do that!";
    req.session.previousUrl = req.originalUrl;
    res.redirect("/login");
  },
  // controlla se l'utente autenticato è l'autore di un post
  async isAuthor(req, res, next) {
    let post = await Post.findById(req.params.id);
    // se l'utente è l'autore del post
    if (post.author.equals(req.user._id)) {
      // conserviamo il post nelle variabili dei template in modo da poter accederci direttamente senza
      // interagire con il DB
      res.locals.post = post;
      return next();
    }
    req.session.error = "Access denied";
    res.redirect("back");
  }
};
