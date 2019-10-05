// PACKAGES
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const session = require("express-session");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const dotEnv = require("dotenv");

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
dotEnv.config();

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

// RUOTES
app.use("/", indexRouter);
app.use("/posts", postRouter);
app.use("/posts/:id/reviews", reviewRouter);

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
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
