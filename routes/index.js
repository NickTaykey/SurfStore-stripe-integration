// PACKAGES
const express = require("express");
const router = express.Router();

// CONTROLLERS
const { postRegister } = require("../controllers");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "Surf Shop - Home" });
});

// GET register /register
router.get("/register", (req, res, next) => {
  res.send("GET register");
});
// POST register /register
router.post("/register", postRegister);
// GET login /login
router.get("/login", (req, res, next) => {
  res.send("GET login");
});
// POST login /login
router.post("/login", (req, res, next) => {
  res.send("POST login");
});
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
