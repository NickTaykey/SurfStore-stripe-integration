const express = require("express");
/* 
per uploadare i file usando i form con i campi file, e memorizzarli nel server in una specifica directory
avendo poi un modo per accederci e interagirci
*/
const multer = require("multer");
const router = express.Router();

// multer config
/* 
confiuriamo multer creando un nuovo oggetto multer, passandogli delle opzioni tra {}
in particolare, l'unica opzione che ci interessa è dest cioè la directory dove vogliamo 
che i file vengano uploadati, la settiamo uguale a "uploads/"
*/
const upload = multer({ dest: "uploads/" });

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
const { asyncErrorHandler } = require("../middleware");

/* INDEX GET /posts */
router.get("/", asyncErrorHandler(postIndex));

// NEW GET /posts/new
router.get("/new", postNew);

// SHOW GET /posts/:id
router.get("/:id", asyncErrorHandler(postShow));

// CREATE POST /posts

/* 
    multer è un package che ci mette a disposizione una serie di middleware per gestire l'upload delle immmagini
    o dei file nelle nostre routes, in questo caso vogliamo uploadare più immagini dal form da uno stesso campo
    quindi utilizziamo un middleware che ci permette di uploadare multiple immagini da un campo del form,
    questo è upload.array() e prende come parametri il nome del campo file del form con cui sono stati selezionati
    i file da uploadare e il numero massimo di file che possiamo uploadare (STIAMO USANDO L'OGGETTO upload CHE 
    AVEVAMO CREATO QUANDO AVEVAMO CONFIGURATO MULTER PER ACCEDERE AI METODI DEL UPLOAD)  
*/
router.post("/", upload.array("images", 4), asyncErrorHandler(postCreate));

// EDIT GET /posts/:id/edit
router.get("/:id/edit", asyncErrorHandler(postEdit));

// UPDATE PUT /posts/:id
router.put("/:id", asyncErrorHandler(postUpdate));

// DESTROY DELETE /posts/:id
router.delete("/:id", asyncErrorHandler(postDestroy));

module.exports = router;
