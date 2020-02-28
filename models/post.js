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
  price: Number,
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

/* 
SETTIAMO UN INDICE SUL CAMPO GEOMETRY DI POSTSCHEMA

un indice è un modo che mongoDB ci mette a disposizione per poter eseguire query complesse in modo più 
efficente (sono utili quando abbiamo un dataset grande e vogliamo selezionare solo gli oggetti che 
soddisfano una certa query, che di solito è complessa), con gli indici definiamo per ogni oggetto 
del DB una struttura dati che contiene un campo (o più) del oggetto in questione (quando dichiariamo 
l'indice settiamo anche quelli che sono i campi che l'indice rappresenta), in questo modo quando abbiamo
una query da fare (ed abbiamo dichiarato gli indici in modo appropriato) possiamo usarli per filtrare
gli oggetti da selezionare, in modo molto semplice e veloce (perché fare il controllo di una condizione
su un oggetto impiega più tempo rispetto a farlo su un indice), possiamo quindi ridurre il dataset di 
elementi che potrebbero soddisfare la condizione in modo da poi, fare i controlli classici su questi per 
selezionare  i  risultatti in un dataset meno ampio, IMPIEGANDO PIU' TEMPO PER OTTENERE I RISULTATI DALLA 
QUERY. 

2DSPHERE

ASSOCIAMO AL CAMPO GEOMETRY (che conterrà anche le coordinate della località in cui il post si trova) L'INDICE
"2dsphere", questo ci permetterà di implementare un filtro che permette al utente di specificare una località
di riferimento (di cui troveremo le coordinate) ed una distanza, in modo da visualizzare tutti i post attorno
a quel punto di riferimento, la cui distanza massima è quella che l'utente a specificato, per implementare 
questo filtro useremo l'indice "2dsphere" e i metodi di mongoDB per trovare tutti i post che si trovano ad una
distanza minore o uguale a quella che ha specificato l'utente rispetto al punto di riferimento. 

*/

PostSchema.index({ geometry: "2dsphere" });

module.exports = mongoose.model("Post", PostSchema);
