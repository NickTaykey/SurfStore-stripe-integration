// PACKAGES
const express = require("express");
const router = express.Router();

// CONTROLLERS
const {
  getLandingPage,
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  getLogout,
  getProfile,
  updateProfile
} = require("../controllers");

// MIDDLEWARE
const {
  asyncErrorHandler,
  isLoggedIn,
  isValidPassword,
  setNewPassword
} = require("../middleware");

const multer = require("multer");
const { storage } = require("../cloudinary");

// configura multer in modo che usi cloudinary-storage per memorizzare le immagini direttamente nel cloud
const upload = multer({ storage });

/* GET home/landing page. */
router.get("/", asyncErrorHandler(getLandingPage));

// GET register /register
router.get("/register", getRegister);
// POST register /register

// la callback che passiamo è quella ritornata da asyncErrorHandler che esegue il codice e in caso di errori
// esegue il middleware di express
router.post(
  "/register",
  // questo middleware SEMPRE PRIMA DI USARE REQ.BODY PERCHE' lo popola al posto di body-parser
  upload.single("image"),
  asyncErrorHandler(postRegister)
);
// GET login /login
router.get("/login", getLogin);
// POST login /login
router.post("/login", asyncErrorHandler(postLogin));

// GET logout /logout
router.get("/logout", getLogout);

// GET profile /profile (usa isLogged in in modo da fare vedere il profilo relativo ad un utente solo se è loggato)
router.get("/profile", isLoggedIn, asyncErrorHandler(getProfile));
// PUT profile (update user profile) /profile
router.put(
  "/profile",
  isLoggedIn,
  // questo middleware SEMPRE PRIMA DI USARE REQ.BODY PERCHE' lo popola al posto di body-parser
  upload.single("image"),
  asyncErrorHandler(isValidPassword),
  asyncErrorHandler(setNewPassword),
  asyncErrorHandler(updateProfile)
);
// GET forgot (show forgot password form) /forgot
router.get("/forgot", (req, res, next) => {
  res.send("GET forgot");
});
// PUT forgot (process pwd reset request, send email set token ecc) /forgot
router.put("/forgot", (req, res, next) => {
  res.send("PUT forgot");
});
// GET reset (show form to reset the password url sent via email) /reset/:token
router.get("/reset/:token", (req, res, next) => {
  res.send("GET reset");
});
// PUT reset (set the new password) /reset/:token
router.put("/reset/:token", (req, res, next) => {
  res.send("PUT reset");
});

module.exports = router;
