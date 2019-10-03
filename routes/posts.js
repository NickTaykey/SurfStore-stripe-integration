const express = require("express");
const router = express.Router();

// ROUTES
const {
  postIndex,
  postNew,
  postCreate,
  postShow,
  postEdit,
  postUpdate,
  postDestroy
} = require("../controllers/posts");

// MIDDLEWARES
const { asyncErrorHandler } = require("../middleware");

/* INDEX GET /posts */
router.get("/", asyncErrorHandler(postIndex));

// NEW GET /posts/new
router.get("/new", postNew);

// SHOW GET /posts/:id
router.get("/:id", asyncErrorHandler(postShow));

// CREATE POST /posts
router.post("/", asyncErrorHandler(postCreate));

// EDIT GET /posts/:id/edit
router.get("/:id/edit", asyncErrorHandler(postEdit));

// UPDATE PUT /posts/:id
router.put("/:id", asyncErrorHandler(postUpdate));

// DESTROY DELETE /posts/:id
router.delete("/:id", asyncErrorHandler(postDestroy));

module.exports = router;
