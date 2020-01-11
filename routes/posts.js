const express = require("express");
/* 
per uploadare i file usando i form con i campi file, e memorizzarli nel server in una specifica directory
avendo poi un modo per accederci e interagirci
*/
const multer = require("multer");
const router = express.Router();

// file di configurazione di multer-storage-cloudinary
const { storage } = require("../cloudinary");
// multer config
/* 
configuriamo cloudinary in modo che usi come motore per lo storage dei file multer-storage-cloudinary
in questo modo i file non vengono più memorizzati in locale in uploads/ ma direttamente nel cloud su
cloudinary
*/
const upload = multer({ storage });

// ROUTES
const {
  postIndex,
  postNew,
  postCreate,
  postShow,
  postEdit,
  postUpdate,
  postDestroy
} = require("../controllers/posts");

// MIDDLEWARES
const { asyncErrorHandler, isLoggedIn } = require("../middleware");

/* INDEX GET /posts */
router.get("/", asyncErrorHandler(postIndex));

// NEW GET /posts/new
router.get("/new", isLoggedIn, postNew);

// SHOW GET /posts/:id
router.get("/:id", asyncErrorHandler(postShow));

// CREATE POST /posts

/* 
    multer è un package che ci mette a disposizione una serie di middleware per gestire l'upload delle immmagini
    o dei file nelle nostre routes, in questo caso vogliamo uploadare più immagini dal form da uno stesso campo
    quindi utilizziamo un middleware che ci permette di uploadare multiple immagini da un campo del form,
    questo è upload.array() e prende come parametri il nome del campo file del form con cui sono stati selezionati
    i file da uploadare e il numero massimo di file che possiamo uploadare (STIAMO USANDO L'OGGETTO upload CHE 
    AVEVAMO CREATO QUANDO AVEVAMO CONFIGURATO MULTER PER ACCEDERE AI METODI DEL UPLOAD), QUESTO MIDDLEWARE GESTISCE L'UPLOAD
    DEI FILE E CI METTE A DISPOSIZIONE NEL CODICE DEL CONTROLLER UNA PROPRIETA' DI REQ CHE E' req.files CHE E' UN
    ARRAY CHE CONTIENE TANTI OGGETTI QUANTI FILE SONO STATI UPLOADATI ED OGNI OGGETTO RAPPRESENTA UN FILE, E HA VARIE
    PROPRIETA' CON INFO SUL FILE, PER ESEMPIO, IL PATH IL NOME, ECC
    (PRIMA VIENE ESEGUITO QUESTO MIDDLEWARE E I FILE VENGONO CARICATI NELLA CARTELLA UPLOADS E SOLO DOPO IL CONTROLLER
    VIENE ESEGUITO E POSSIAMO ACCEDERE AL ARRAY DI FILE DA ESSO USANDO req.files)
*/
router.post(
  "/",
  isLoggedIn,
  upload.array("images", 4),
  asyncErrorHandler(postCreate)
);

// EDIT GET /posts/:id/edit
router.get("/:id/edit", isLoggedIn, asyncErrorHandler(postEdit));

// UPDATE PUT /posts/:id
// middleware upload.array per gestire l'upload di file multipli da un solo campo in un form
router.put(
  "/:id",
  isLoggedIn,
  upload.array("images", 4),
  asyncErrorHandler(postUpdate)
);

// DESTROY DELETE /posts/:id
router.delete("/:id", isLoggedIn, asyncErrorHandler(postDestroy));

module.exports = router;
