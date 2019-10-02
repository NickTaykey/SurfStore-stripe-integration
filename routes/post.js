const express = require("express");
const router = express.Router();

// ROUTES
const {
  getPosts,
  newPost,
  createPost,
  showPost
} = require("../controllers/posts");

// MIDDLEWARES
const { errorHandler } = require("../middleware");

/* INDEX GET /posts */
router.get("/", errorHandler(getPosts));

// NEW GET /posts/new
router.get("/new", newPost);

// SHOW GET /posts/:id
router.get("/:id", errorHandler(showPost));

// CREATE POST /posts
router.post("/", errorHandler(createPost));

// EDIT GET /posts/:id/edit
router.get("/:id/edit", (req, res, next) => {
  res.send("Post EDIT");
});

// UPDATE PUT /posts/:id
router.put("/:id", (req, res, next) => {
  res.send("Post UPDATE");
});

// DESTROY DELETE /posts/:id
router.delete("/:id", (req, res, next) => {
  res.send("Post DESTROY");
});

module.exports = router;
