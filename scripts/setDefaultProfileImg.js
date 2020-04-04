const User = require("../models/user");
const mongoose = require("mongoose");

// CONNECT TO THE DATABASE
mongoose.connect("mongodb://localhost:27017/surf-store-ajax", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

User.findById(
    "5e877b1edce6f710c4832e91", 
    function(e, p){
        if(!e){
          p.image = {};
          p.save((e, p)=>console.log("user successfully updated!"))
        };
    }
);
