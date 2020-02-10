const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  /* L'EMAIL DEVE ESSERE OBBLIGATORIA DA INSERIRE E UNICA PER OGNI UTENTE (se cerchiamo di registrare un
  utente con un email già usata mongoose ci da un errore) */
  email: { type: String, required: true, unique: true },
  image: {
    secure_url: { type: String, default: "/images/default-profile.jpg" },
    public_id: String
  },
  // token (string casuale per resettare la password)
  resetToken: String,
  // data di scadenza del token dopo la quale non sarà più utilizzabile per cambiare la password
  resetTokenExpiration: Date
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
