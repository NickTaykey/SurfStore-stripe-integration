const Post = require("../models/post"),
  Review = require("../models/review");
module.exports = {
  // REVIEW CREATE
  async reviewCreate(req, res, next) {
    // popoliamo le review in quanto dobbiamo accedere al id del autore
    let post = await Post.findById(req.params.id)
      .populate("reviews")
      .exec();
    // filtriamo l'array delle review e selezioniamo solo quelle che sono state create dal utente loggato
    let usersReview = post.reviews.filter(review =>
      review.author._id.equals(req.user._id)
    ).length;
    if (usersReview) {
      req.session.error = "You can only post one review";
      return res.redirect("back");
    }
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
  async reviewDestroy(req, res, next) {
    // eliminare review dal post
    await Post.findByIdAndUpdate(req.params.id, {
      $pull: { reviews: req.params.review_id }
    });
    // eliminare review
    await Review.findByIdAndRemove(req.params.review_id);
    req.session.success = "review successfully deleted!";
    res.redirect("back");
  }
};
