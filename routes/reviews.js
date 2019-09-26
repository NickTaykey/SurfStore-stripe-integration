const express = require("express");
const router = express.Router({ mergeParams: true });

/* INDEX GET /posts/:id/reviews */
router.get("/", (req, res, next) => {
  res.send("Review INDEX");
});

// CREATE POST /posts/:id/reviews
router.post("/", (req, res, next) => {
  res.send("Review CREATE");
});

// EDIT GET /posts/:id/reviews/:review_id/edit
router.get("/:review_id/edit", (req, res, next) => {
  res.send("Review EDIT");
});

// UPDATE PUT /posts/:id/reviews/:review_id
router.put("/:review_id", (req, res, next) => {
  res.send("Review UPDATE");
});

// DESTROY DELETE /posts/:id/reviews/:review_id
router.delete("/:review_id", (req, res, next) => {
  res.send("Review DESTROY");
});

module.exports = router;
