const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  reviewCreate,
  reviewUpdate,
  reviewDestroy
} = require("../controllers/reviews");
const { asyncErrorHandler, checkReviewAuthor } = require("../middleware");

// CREATE POST /posts/:id/reviews
router.post("/", asyncErrorHandler(reviewCreate));

// UPDATE PUT /posts/:id/reviews/:review_id
router.put("/:review_id", checkReviewAuthor, asyncErrorHandler(reviewUpdate));

// DESTROY DELETE /posts/:id/reviews/:review_id
router.delete(
  "/:review_id",
  checkReviewAuthor,
  asyncErrorHandler(reviewDestroy)
);

module.exports = router;
