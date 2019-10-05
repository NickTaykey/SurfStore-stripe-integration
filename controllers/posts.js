const Post = require("../models/post");
/* 
  per uploadare le immagini nel cloud in modo da potreci accedere e interagirci più facilmente
  e non sprecare spazio nel nostro server
*/
const cloudinary = require("cloudinary");

/* 
   CONFIGURIAMO CLOUDINARY USANDO IL METODO CONFIG A CUI PASSIAMO UN OGGETTO DI OPZIONI, CHE AVRA' 3
   PROPRIETA' CHE CI SERVONO PER AUTENTICARCI CON IL NOSTRO ACCOUNT E QUINDI USARE LE API PER ACCEDERE
   E INTRAGIRE CON LE IMMAGINI CHE ABBIAMO UPLOADATO E AGGIUNGERNE DI NUOVE
*/
cloudinary.config({
  /* 
    queste opzioni servono per accedere al nostro account cloudinary e quindi usare le API su di esso.
    sono:
      - cloud_name
      - api_key
      - client_secret

      TUTTI I LORO VALORI CI SONO DATI NEL PANNELLO DI CONTROLLO DEL NOSTRO ACCONT CLOUDINARY
  */
  cloud_name: "dmxuerbxv",
  api_key: "529692727915557",
  /*  
    IL CLIENT_SECRET E' L'UNICO DATO VERAMENTE SENSIBILE, PERCHÉ É COME SE FOSSE UNA PASSWORD E QUINDI QUALSIASI
    PERSONA SE LA CONOSCE PUO' ACCEDERE AL ACCOUNT E USARE L'API QUINDI E' MEGLIO NON FARLA VEDERE TROPPO E CONSERVARLA
    COME VARIABILE DI ABIENTE, PER NON FARLA VEDERE AD OCCHI INDISCRETI.
  */
  client_secret: process.env.CLOUDINARY_SECRET
});

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
  // UPDATE POST
  async postUpdate(req, res, next) {
    let post = await Post.findByIdAndUpdate(req.params.id, req.body.post);
    res.redirect(`/posts/${post.id}`);
  },
  // DESTROY POST
  async postDestroy(req, res, next) {
    await Post.findByIdAndRemove(req.params.id);
    res.redirect("/posts");
  }
};
