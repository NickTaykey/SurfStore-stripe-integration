const Post = require("../models/post"),
  Review = require("../models/review");
const moment = require("moment");
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
      return res.json({ error : "You can only post one review" });
    }
    req.body.review.author = req.user._id;
    let review = await Review.create(req.body.review);
    post.reviews.push(review);
    await post.save();
    if(req.xhr){
      return res.json(
        {
          review, 
          author: { 
            _id: req.user._id, 
            username: req.user.username,
            leftOn: moment(new Date(review._id.getTimestamp())).calendar()
          } 
        });
    }
  },
  // UPDATE REVIEW
  async reviewUpdate(req, res, next) {
    req.body.review.updated = true;
    let review = await Review.findByIdAndUpdate(req.params.review_id, req.body.review, { new: true });
    if(req.xhr) return res.json(review);
  },
  // DESTROY REVIEW
  async reviewDestroy(req, res, next) {
    // eliminare review dal post
    await Post.findByIdAndUpdate(req.params.id, {
      $pull: { reviews: req.params.review_id }
    });
    // eliminare review
    await Review.findByIdAndRemove(req.params.review_id);
    if(req.xhr) res.json({ status: 200 });
  }
};
