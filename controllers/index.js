const User = require("../models/user");

module.exports = {
  // SINGUP ROUTE CONTROLLER
  // NON USIAMO TRY E CATCH PER GESTIRE GLI ERRORI IN QUANTO USIAMO IL MIDDLEWARE errorHanler
  // DEFINITO IN middleware/index.js CHE ESEGUE IL CONTROLLER E IN CASO DI ERRORE ESEGUE IL MIDDLEWARE
  // DI EXPRESS PER LA GESTIONE DEGLI ERRORI (che visualizza l'errore nella view error.ejs)
  async postRegister(req, res, next) {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      image: req.body.image
    });
    await User.register(newUser, req.body.password);
    res.redirect("/");
  }
};
