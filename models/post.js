const mongoose = require("mongoose");
const Review = require("./review");
// package che semplifica la paginazione dei post
const mongoosePaginate = require("mongoose-paginate");

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
  },
  avgRating: { type: Number, default: 0 },
  propreties: {
    description: String
  },
  geometry: {
    coordinates: {
      type: [Number],
      required: true
    },
    type: {
      type: String,
      emun: ["Point"],
      required: true
    }
  }
});

// prima di rimuover un post rimuovi tutte le reviews ad esso associate
PostSchema.pre("remove", async function() {
  await Review.remove({
    _id: { $in: this.reviews }
  });
});

PostSchema.plugin(mongoosePaginate);

// metodo del modello per calcolare il numero medio di stelle
PostSchema.methods.calcAvgRating = function() {
  let totalRating = 0,
    floorRating;
  if (this.reviews.length) {
    this.reviews.forEach(r => {
      totalRating += r.rating;
    });
    // due medie, una decimale (un numero con 2 cifre in totale), una intera (solo la parte intera del numero)
    this.avgRating = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.save();
    floorRating = Math.floor(this.avgRating);
  } else {
    floorRating = totalRating;
  }
  return floorRating;
};

module.exports = mongoose.model("Post", PostSchema);
