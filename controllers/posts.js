const Post = require("../models/post");

module.exports = {
  // POST INDEX
  async postIndex(req, res, next) {
    let posts = await Post.find();
    res.render("posts", { posts });
  },
  // POST NEW
  postNew(req, res, next) {
    res.render("posts/new");
  },
  // POST CREATE
  async postCreate(req, res, next) {
    let post = await Post.create(req.body.post);
    res.redirect(`/posts/${post.id}`);
  },
  // POST SHOW
  async postShow(req, res, next) {
    let post = await Post.findById(req.params.id);
    res.render("posts/show", { post });
  },
  // EDIT POST
  async postEdit(req, res, next) {
    let post = await Post.findById(req.params.id);
    res.render("posts/edit", { post });
  },
  async postUpdate(req, res, next) {
    let post = await Post.findByIdAndUpdate(req.params.id, req.body.post);
    res.redirect(`/posts/${post.id}`);
  }
};
