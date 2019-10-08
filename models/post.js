const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: String,
  price: String,
  description: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  location: String,
  lat: Number,
  lng: Number,
  /* 
  ARRAY DELLE IMMAGINI DEL POST, OGNI ELEMENTO E' UN OGGETTO CHE CONTERRA' 2 PROPRIETA' L'URL DEL IMMAGINE,
  PER POI ACCEDERCI NELLE VIEWS E L'ID PER POI POTERLA EVENTUALMENTE ELIMINARE O MANIMPOLARE NEL CLOUD, ENTRAMBI
  STRINGHE.     
  */
  images: [{ url: String, public_id: String }],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Post", PostSchema);
