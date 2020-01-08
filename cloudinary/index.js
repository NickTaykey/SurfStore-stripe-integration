// per generare un nome random per il file del immagine da uploadare
const crypto = require("crypto");

const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dmxuerbxv",
  api_key: "529692727915557",
  api_secret: process.env.CLOUDINARY_SECRET
});

/* package che ci permette di uploadare direttamente l'immagine su cloudinary senza prima memorizzarla in locale */
const multerStorageCloudinary = require("multer-storage-cloudinary");
/* 
CONFIGURIAMO multer-cloudinary-storage passando come parametro un oggetto di configurazione di multer per
usare come package per gestire lo storage con multer-storage-cloudinary (per memorizzare le immagini 
direttamente su cloudinary)
*/
const storage = multerStorageCloudinary({
  /* PARAMETRI CHE multer-cloudinary-storage DEVE USARE PER INTERAGIRE CON IL NOSTRO CLOUD SU CLOUDIANRY */
  cloudinary, // oggetto che rappresenta il nostro account cloud e accesso al API di cloudinary
  folder: "surf-store/", // la cartella nella quale memorizza i file uploadati nel cloud su cloudinary
  allowedFormats: ["jpeg", "jpg", "png"], // i tipi di file che l'utente può uploadare
  // funzione che genera il nuovo nome del file (casuale e poi chiama la funzione per rinominare il file)
  filename(req, file, cb) {
    /* usa crypto per generare un nome casuale per il file
     genera 16 byte casuali */
    let buffer = crypto.randomBytes(16);
    /*  usa i bytes casuali generati per creare una stringa di 32 caratteri (usando hex come encoding ad ogni
        byte corrispondono due caratteri quindi in tutto 32 caratteri)
    */
    buffer = buffer.toString("hex");
    // aggiungi al nome del file SENZA ESTENSIONE la stringa di 32 caratteri random generata
    /*  ---------------------------
         senza estensione perché questa funzione deve solo generare il nome del file con cui poi andrà
         rinominato (senza l'estensione)  RINOMINARE IL FILE OCCUPANDOSI DI MANTENERE L'ESETENSIONE LA STESSA
         SI OCCUPERA' LA CALLBACK ALLA FINE DEL CODICE
        --------------------------- */
    let newName =
      file.originalname.replace(/\.jpg|\.jpeg|\.png/gi, "") + buffer;
    /*  chiama la callback che rinominerà il file passando undefined come errore ( NO ERRORI )
        e il nuovo nome come il nome con cui dovrà rinominare il file
     */
    cb(undefined, newName);
  }
});

module.exports = { storage, cloudinary };
