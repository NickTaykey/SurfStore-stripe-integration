const Post = require("../models/post");
const { errorHandler } = require("../middleware");

module.exports = {
  async getPosts(req, res, next) {
    // SE NON PASSIAMO NESSUN PARAMETRO A FIND ESTRAE TUTTI GLI OGGETTI
    const posts = await Post.find();
    /*  SE PASSIAMO SOLO IL NOME DI UNA CARTELLA IN VIEWS A RENDER RENDERIZZA 
        IL FILE INDEX.EJS DI QUELLA CARTELLA 
    */
    res.render("posts", { posts });
  },
  // RENDERIZZA IL FORM PER CREARE UN NUOVO POST
  newPost(req, res, next) {
    res.render("posts/new");
  }
};
