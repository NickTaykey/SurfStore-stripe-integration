const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  /* L'EMAIL DEVE ESSERE OBBLIGATORIA DA INSERIRE E UNICA PER OGNI UTENTE (se cerchiamo di registrare un
  utente con un email già usata mongoose ci da un errore) */
  email: { type: String, required: true, unique: true },
  image: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
