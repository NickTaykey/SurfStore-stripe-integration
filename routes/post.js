const express = require("express");
const router = express.Router();

/* INDEX GET /posts */
router.get("/", (req, res) => {
  res.send("INDEX");
});

// NEW /posts/new
router.get("/new", (req, res) => {
  res.send("NEW");
});

// SHOW GET /posts/:id
router.get("/:id", (req, res) => {
  res.send("SHOW");
});

// CREATE POST /posts
router.post("/", (req, res) => {
  res.send("CREATE");
});

// EDIT GET /posts/:id/edit
router.get("/:id/edit", (req, res) => {
  res.send("EDIT");
});

// UPDATE PUT /posts/:id
router.put("/:id", (req, res) => {
  res.send("UPDATE");
});

// DESTROY DELETE /posts/:id
router.delete("/:id", (req, res) => {
  res.send("DESTROY");
});

module.exports = router;
