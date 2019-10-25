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
  api_secret: process.env.CLOUDINARY_SECRET
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
    /* 
      FA L'UPLOAD DELLE IMMAGINI CHE L'UTENTE HA CARICATO, IL CUI UPLOAD E' STATO GESTITO DA MULTER E SONO IN
      UPLODAS (possiamo accedere ai file uploadati usando req.files) SU CLOUDINARY.


      CREIAMO UNA NUOVA PROPRIETA' NEL OGGETTO REQ.BODY.POST QUESTA SI CHIAMERA' IMAGES E SARA' UN ARRAY
      CONTENENTE GLI OGGETTI RAPPRESENTANTI LE IMG UPLOADATE NEL CLOUD, CHE POI SALVEREMO NEL DB PER POI ACCEDERCI
    */
    req.body.post.images = [];
    /* ITERIAMO SU TUTTI GLI OGGETTI FILE PRESENTI NEL ARRAY REQ.FILES */
    for (const image of req.files) {
      /* UPLOADIAMO OGNI IMMAGINE NEL CLOUD USANDO L'API DI CLOUDINARY PASSANDO AL METODO IL PATH DEL IMMAGINE  */
      let img = await cloudinary.v2.uploader.upload(image.path);
      /* UNA VOLTA COMPLETATO L'UPLOAD AGGIUNGIAMO L'IMMAGINE AL ARRAY SOTTO FORMA DI UN OGGETTO CON 2 PROPRIETA'
         L'URL A CUI E' ACCESSIBILE SU CLOUDINARY E IL SUO ID SU CLOUDINARY (il primo per poter visualizare l'immagine
         nelle views e il secondo per poi potere interagire con l'immagine in questione nel cloud per poterla eliminare
         o manipolarla) SIA L'URL CHE L'ID DEL IMMAGINE SONO NEL OGGETTO CHE CLOUDINARY CI RITORNA QUANDO ABBIAMO
         COMPLETATO L'UPLOAD
      */
      req.body.post.images.push({
        url: img.secure_url,
        public_id: img.public_id
      });
    }
    /* 
       CREIAMO IL POST, ABBIAMO MEMORIZZATO LE IMMAGINI UPLOADATE DIRETTAMENTE IN UN ARRAY IN REQ.BODY.POST
       PERCHE' IL QUESTO MODO C'E' LE ABBIAMO DIRETTAMENTE NEL OGGETTO CHE VOGLIAMO SALVARE NEL DB, E NON DOBBIAMO
       CREARE UN NUOVO ARRAY E ASSOCIARLO AL REQ.BODY.POST MA UNA VOLTA CHE ABBIAMO UPLOADATO LE IMGS E POPOLATO L'ARRAY
       DOBBIAMO PASSARE SOLO REQ.BODY.POST AL METODO PER SALVARLO NEL DB.
     */
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
    // selezioniamo il post per id
    let post = await Post.findById(req.params.id);
    // controlliamo se abbiamo delle immagini da cancellare
    if (req.body.deleteImages && req.body.deleteImages.length) {
      // per comodità assegnamo l'array delle immagini da eliminiare ad una variabile
      const deleteImages = req.body.deleteImages;
      // iteriamo sulle immagini da eliminare (usiamo il for of perchè stiamo usando ES6 e anche perchè ci
      // permette di usare await direttamente al interno del ciclo senza dovere usare funzioni async)
      for (const public_id of deleteImages) {
        // cancelliamo l'immagine dal cloudinary
        await cloudinary.v2.uploader.destroy(public_id);
        // cancelliamo l'immagine dal array  DB
        for (const image of post.images) {
          // troviamo l'oggetto nel array che la rappresenta e che vogliamo eliminare
          if (image.public_id === public_id) {
            // troviamo l'indice del elemento da eliminare nel array
            let index = post.images.indexOf(image);
            // lo eliminiamo usando il suo indice
            post.images.splice(index, 1);
          }
        }
      }
    }
    // controlliamo se dobbiamo uploadare nuove immagini
    // (se la lughezza del array è 0 dato che 0 è considerato
    // come false allora il codice del if non verrà eseguito)
    if (req.files.length) {
      // iteriamo sull'array delle immagini da uploadare
      for (const image of req.files) {
        //uploadiamo l'immagine
        let img = await cloudinary.v2.uploader.upload(image.path);
        // aggiungiamo l'immagine al array in DB
        post.images.push({
          url: img.secure_url,
          public_id: img.public_id
        });
      }
    }
    // aggiorniamo le altre proprietà del post
    post.title = req.body.post.title;
    post.price = req.body.post.price;
    post.description = req.body.post.description;
    post.location = req.body.post.location;
    // salviamo le modifiche
    post.save();
    // reindirizziamo l'utente alla show page
    res.redirect(`/posts/${post.id}`);
  },
  // DESTROY POST
  async postDestroy(req, res, next) {
    let post = await Post.findByIdAndRemove(req.params.id);
    for (const image of post.images) {
      await cloudinary.v2.uploader.destroy(image.public_id);
    }
    res.redirect("/posts");
  }
};
