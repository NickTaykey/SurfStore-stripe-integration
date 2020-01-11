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
  getLogout
} = require("../controllers");

// MIDDLEWARE
const { asyncErrorHandler } = require("../middleware");

/* GET home/landing page. */
router.get("/", asyncErrorHandler(getLandingPage));

// GET register /register
router.get("/register", getRegister);
// POST register /register

// la callback che passiamo è quella ritornata da asyncErrorHandler che esegue il codice e in caso di errori
// esegue il middleware di express
router.post("/register", asyncErrorHandler(postRegister));
// GET login /login
router.get("/login", getLogin);
// POST login /login
router.post("/login", postLogin);

// GET logout /logout
router.get("/logout", getLogout);

// GET profile /profile
router.get("/profile", (req, res, next) => {
  res.send("GET profile");
});
// PUT profile (update user profile) /profile/:user_id
router.put("/profile/:user_id", (req, res, next) => {
  res.send("PUT profile");
});
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
