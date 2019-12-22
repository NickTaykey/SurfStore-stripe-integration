const mongoose = require("mongoose");
const Review = require("./review");

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
  coordinates: Array,
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

// prima di rimuover un post rimuovi tutte le reviews ad esso associate
PostSchema.pre("remove", async function() {
  await Review.remove({
    _id: { $in: this.reviews }
  });
});

module.exports = mongoose.model("Post", PostSchema);
