/* 
  INCLUDIAMO E CONFIGURIAMO IL PACKAGE PER GESTIRE LE VARIABILI DI AMBIENTE PERCHE' DATO CHE LE USEREMO
  IN MOLTI PUNTI DEL APP ALLORA VOGLIAMO AVERLE SUBITO PRIMA DI TUTTO IN MODO DA NON AVERE NESSUN TIPO DI
  PROBLEMA LEGATO AL FATTO CHE LE STIAMO USANDO DA QUALCHE PARTE PRIMA DI AVERLE IMPORTATE
 */
require("dotenv").config();

// PACKAGES
const createError = require("http-errors");
const express = require("express");
const engine = require("ejs-mate");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const session = require("express-session");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");

// MODELS
const User = require("./models/user");

// CONNECT TO THE DATABASE
mongoose.connect("mongodb://localhost:27017/surf-store", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

// TEST THE CONNECTION
// variabile che rappresenta la connessione con il DB
const db = mongoose.connection;
// se ci sono stati degli errori durate la connessione li stampa
db.on("error", console.error.bind(console, "connection error:"));
// se tutto è andato bene e la connessione è stata aperta con successo stampa il messaggio
// "successfully connected to the DB!"
db.once("open", () => console.log("successfully connected to the DB!"));

// ROUTES
const indexRouter = require("./routes/index");
const postRouter = require("./routes/posts");
const reviewRouter = require("./routes/reviews");

// GENERAL CONFIGS

// dichiariamo ad express che vogliamo usare ejs-mate su tutti i template ejs (x gestire i template)
app.engine("ejs", engine);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// express session config
app.use(
  session({
    secret: "hang five mate!",
    resave: false,
    saveUninitialized: true
  })
);

// passport config

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* TUTTI I MIDDLEWARE PRIMA DEL MONTAGGIO DELLE ROUTE VENGONO ESEGUITI PRIMA DEL CODICE DI OGNI ROUTE */
// setta titolo di default per ogni view E IMPLEMENTA FLASH MESSAGES
app.use((req, res, next) => {
  res.locals.title = "Surf Shop";
  // se ci sono messaggi di errore sulla sessione settiamo la variabile della view
  res.locals.error = req.session.error || "";
  // eliminiamo l'errore dalla sessione
  delete req.session.error;
  // se ci sono messaggi di successo sulla sessione settiamo la variabile della view
  res.locals.success = req.session.success || "";
  // eliminiamo l'errore dalla sessione
  delete req.session.success;
<<<<<<< HEAD

  // settiamo un utente sempre loggato
  req.user = {
    _id: "5dfe539e1d7c37040f815fb8",
    username: "nick"
  };
  res.locals.currentUser = req.user;

=======
>>>>>>> fe64d657b522208df1344e7d6f96392d9bd273d2
  next();
});

// RUOTES
app.use("/", indexRouter);
app.use("/posts", postRouter);
app.use("/posts/:id/reviews", reviewRouter);

/* TUTTI I MIDDLEWARE PRIMA DEL MONTAGGIO DELLE ROUTE VENGONO ESEGUITI DOPO DEL CODICE DI OGNI ROUTE */

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler

/* 
  MIDDLEWARE PER LA GESTIONE DEGLI ERRORI, che possiamo chiamare da ogni controller quando vogliamo gestire
  un errore.
  TROVA INFORMAZIONI SUL ERRORE (x esempio lo status code della richiesta il messaggio di errore, e se in
  ambiente di sviluppo anche il messaggio di errore vero proprio, quello che ci dice l'errore e la linea dove
  è avvenuto) e renderizza una view error.ejs con le informazioni del errore che verranno quindi visualizate
  nel browser
*/

app.use((err, req, res, next) => {
  /* // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error"); */
  // settiamo la sessione
  req.session.error = err.message;
  // stampiamo l'errore nei log
<<<<<<< HEAD
  if (err.message !== "Not Found") console.log(err);
=======
  console.log(err);
>>>>>>> fe64d657b522208df1344e7d6f96392d9bd273d2
  // reindirizziamo indietro
  res.redirect("back");
});

module.exports = app;
