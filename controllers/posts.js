const Post = require("../models/post");
/* 
  per uploadare le immagini nel cloud in modo da potreci accedere e interagirci più facilmente
  e non sprecare spazio nel nostro server
*/
const { cloudinary } = require("../cloudinary");
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

// package per usare le API di mapbox per la geolocalizzazione
const mapbox = require("@mapbox/mapbox-sdk/services/geocoding");
// mapbox account config
const geoCodeClient = mapbox({ accessToken: process.env.MAPBOX_TOKEN });
const mapBoxToken = process.env.MAPBOX_TOKEN;
// STRIPE CONFIGURATION
const stripeSecret = process.env.STRIPE_SECRET;
const stripe = require("stripe")(stripeSecret);

module.exports = {
  // POST INDEX
  async postIndex(req, res, next) {
    /* 
    prima eseguiamo un middleware che si occupa di controllare se l'utente è arrivato a questa route inviado
    il form filterSearch o no, nel caso in cui sia arrivato inviando il form considera tutti i campi che l'utente
    ha compilato nel form ed assembla una query che coinvolge tutti questi campi, in modo che i post che verranno
    selezzionati dal DB saranno solo quelli che rispettano i criteri specificati dal utente, questa query sarà
    passata a questo controller attraverso res.locals, LA QUERY CHE FAREMO ESEGUIRE AL DB SARA' MEMORIZATA QUI IN OGNI
    CASO, SI NEL CASO IN CUI L'UTENTE ABBIA COMPILATO IL FORM CON DEI DATI E QUINDI LA QUERY SARA' STATA ASSEMBLATA
    SIA NEL CASO IN CUI L'UTENTE NON SIA ARRIVATO A QUESTA RUOTE INVIANDO IL FORM. IN QUESTO CASO res.locals.dbQuery
    sarà {}
    */

    // quindi destrutturiamo la query e la facciamo eseguire al DB
    const { dbQuery } = res.locals;
    // cancelliamo dbQuery perché non ci serve nelle views (potrebbe essere un oggetto grande che occupa spazio inutilmente)
    delete res.locals.dbQuery;
    let posts = await Post.paginate(dbQuery, {
      page: req.query.page || 1,
      limit: 10,
      sort: "-_id"
    });
    /* 
       ora controlliamo se l'utente aveva inviato il form e non ci sono risultati,
       IN QUESTO CASO VOGLIAMO SOLLEVARE UN ERRORE PERCHE' LA RICERCA DEL UTENTE 
       NON HA PRODOTTO RISULTATI dato che vogliamo conservare i campi del form li 
       mettiamo in res.locals.query, se l'oggetto è definito allora vuol dire che 
       il form è stato inviato.
     */
    if (res.locals.query && !posts.docs.length) {
      res.locals.error = "No results matching that query";
    }
    posts.page = Number(posts.page);
    posts.pages = Number(posts.pages);
    // console.log(dbQuery, res.locals.query);
    if(req.xhr){
      return res.json(posts);
    }
    res.render("posts", { posts, title: "Surf Store - Index", mapBoxToken });
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
    if(req.files && req.files.length){
      for (const img of req.files) {
        /*  
        ora non abbiamo più bisogno di uploadare ogni immagine manualmente usando l'API di cloudinary
        perché se ne è già occupato multer-storage-cloudinary e l'immagine è già stata uploadata e 
        req.files contiene l'oggetto che rappresenta il file immagine nel cloud di cloudiary
        */
        req.body.post.images.push({
          url: img.secure_url,
          public_id: img.public_id
        });
      }
    }
    /* UNA VOLTA UPLOADATE LE IMMAGINI TROVIAMO LE COORDINATE DEL LUOGO RELATIVO AL POST CON L'API DI MAPBOX */
    let response = await geoCodeClient
      .forwardGeocode({ query: req.body.post.location, limit: 1 })
      .send();
    // mettiamo le coordinate restituiteci dal api in un array in req.body.post in modo da salvarle nel DB passando
    // req.body.post a create
    req.body.post.geometry = response.body.features[0].geometry;
    req.body.post.author = req.user._id;
    let post = new Post(req.body.post);
    post.properties.description = `<strong><a href="/posts/${post._id}">${
      post.title
    }</a></strong><p>${post.location}</p><p>${post.description.substring(
      0,
      20
    )}...</p>`;
    await post.save();
    if(req.xhr) res.json(post);
    else res.redirect(`/posts`);
  },
  // POST SHOW
  async postShow(req, res, next) {
    let post = await Post.findById(req.params.id).populate({
      path: "reviews",
      options: {
        sort: { _id: -1 },
        populate: { path: "author", model: "User" },
      }
    }).exec();
    /* 
      per ora dato che i post sono stati generati automaticamente usando seed ed abbiamo già generato un
      avgRating allora associamo direttamente ad avgRating floorRating (in questo modo abbiamo già di
      default una valutazione media del post e possiamo subito testare i filtri relativi alle valutazioni) 
    */
    let isInCart;
    if(req.isAuthenticated()){
      isInCart = req.user.shoppingCart.find(function(i) {
        return i._id.equals(post._id);
      })
    }
    const floorRating = post.calculateAvgRating();
    res.render("posts/show", {
      post,
      floorRating,
      isInCart,
      title: `Surf Store - Show ${post.title}`
    });
  },
  // UPDATE POST
  async postUpdate(req, res, next) {
    // ritroviamo il post nelle variabili dei template
    const { post } = res.locals;
    // aggiorniamo le altre proprietà del post
    post.title = req.body.post.title;
    post.price = req.body.post.price;
    post.description = req.body.post.description;
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
      for (const img of req.files) {
        // non abbiamo più bisogno di uploadare l'immagine perché è gia stata uploadata su cloudinary
        // aggiungiamo l'immagine al array in DB
        post.images.push({
          url: img.secure_url,
          public_id: img.public_id
        });
      }
    }
    if (req.body.post.location !== post.location) {
      let response = await geoCodeClient
        .forwardGeocode({ query: req.body.post.location, limit: 1 })
        .send();
      post.location = req.body.post.location;
      post.geometry = response.body.features[0].geometry;
      post.properties.description = `<strong><a href="/posts/${post._id}">${
        post.title
      }</a></strong><p>${post.location}</p><p>${post.description.substring(
        0,
        20
      )}...</p>`;
    }
    post.updated=true;
    // salviamo le modifiche
    let postToDisplay = await post.save();
    // reindirizziamo l'utente alla show page
    if(req.xhr) return res.json(postToDisplay);
  },
  // DESTROY POST
  async postDestroy(req, res, next) {
    // ritroviamo il post tra le variabili dei templates
    const { post } = res.locals;
    // iteriamo su tutte le immagini che il post aveva e LE ELIMINIAMO DA CLOUDINARY
    for (const image of post.images) {
      await cloudinary.v2.uploader.destroy(image.public_id);
    }
    await post.remove();
    req.session.success = "post successfully removed!";
    // reindirizziamo l'utente alla show page
    res.redirect("/posts");
  }
};
