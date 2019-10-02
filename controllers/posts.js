const Post = require("../models/post");
const { errorHandler } = require("../middleware");

module.exports = {
  // POST INDEX
  async getPosts(req, res, next) {
    let posts = await Post.find();
    res.render("posts", { posts });
  },
  // POST NEW
  newPost(req, res, next) {
    res.render("posts/new");
  },
  // POST CREATE
  async createPost(req, res, next) {
    let post = await Post.create(req.body);
    res.redirect(`/posts/${post.id}`);
  }
};
