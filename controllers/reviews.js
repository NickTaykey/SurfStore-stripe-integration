const Post = require("../models/post"),
  Review = require("../models/review");
module.exports = {
  // REVIEW CREATE
  async reviewCreate(req, res, next) {
    let post = await Post.findById(req.params.id);
    let review = await Review.create(req.body.review);
    post.reviews.push(review);
    post.save();
    req.session.success = "Review successfully created!";
    res.redirect(`/posts/${post.id}`);
  },
  // UPDATE REVIEW
  async reviewUpdate(req, res, next) {},
  // DESTROY REVIEW
  async reviewDestroy(req, res, next) {}
};
