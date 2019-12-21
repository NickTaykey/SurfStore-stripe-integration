const Post = require("../models/post"),
  Review = require("../models/review");
module.exports = {
  // REVIEW CREATE
  async reviewCreate(req, res, next) {
    let post = await Post.findById(req.params.id);
    req.body.review.author = req.user._id;
    let review = await Review.create(req.body.review);
    post.reviews.push(review);
    post.save();
    req.session.success = "Review successfully created!";
    res.redirect(`/posts/${post.id}`);
  },
  // UPDATE REVIEW
  async reviewUpdate(req, res, next) {
    await Review.findByIdAndUpdate(req.params.review_id, req.body.review);
    req.session.success = "review successfully updated!";
    res.redirect("back");
  },
  // DESTROY REVIEW
  async reviewDestroy(req, res, next) {}
};
