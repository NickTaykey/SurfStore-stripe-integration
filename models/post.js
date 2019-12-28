const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const mongoosePaginate = require("mongoose-paginate");

/*  
dato che vogliamo memorizzare delle località associate al post e queste saranno visulizzate poi su una
mappa e l'API di mapbox che usiamo per mostrare le località sulla mappa lavora con degli oggetti JSON
che rappresentano un luogo seguendo una specifica con cui quel luogo è modellato come oggetto (questa
è chiamata geoJSON) allora memorizziamo i dati relativi alla località del post secondo la specifica
geoJSON, quindi le coordinate andranno nel oggetto geometry (dato che queste identificano un punto)
allora type sarà = a Point, mentre le coordinate saranno memorizzate in un array chiamato coordinates
sotto forma di numeri, altre eventuali proprietà relative al luogo in questione saranno memorizzate
nel oggetto propreties, che contiene tutte le altre eventuali proprietà del luogo, nel nostro caso
description che conterrà una descrizione, stringa, del luogo
*/
const PostSchema = new Schema({
  title: String,
  price: String,
  description: String,
  images: [{ url: String, public_id: String }],
  location: String,
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  properties: {
    description: String
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  avgRating: { type: Number, default: 0 }
});

PostSchema.pre("remove", async function() {
  await Review.remove({
    _id: {
      $in: this.reviews
    }
  });
});

PostSchema.methods.calculateAvgRating = function() {
  let ratingsTotal = 0;
  if (this.reviews.length) {
    this.reviews.forEach(review => {
      ratingsTotal += review.rating;
    });
    this.avgRating = Math.round((ratingsTotal / this.reviews.length) * 10) / 10;
  } else {
    this.avgRating = ratingsTotal;
  }
  const floorRating = Math.floor(this.avgRating);
  this.save();
  return floorRating;
};

PostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Post", PostSchema);
