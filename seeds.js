const faker = require("faker");
const Post = require("./models/post");
const Review = require("./models/review");
// array che contiene tanti oggetti che rappresentano delle città vere con le loro info
const cities = require("./cities");

// crea 600 post casuali nel db
async function seedPosts() {
  // cancella tutti i post e le review dal DB
  await Post.deleteMany({});
  await Review.deleteMany({});

  // crea 600 posts
  for (const i of new Array(600)) {
    // genera un numero casuale da 1 a 1000 per selezionare una città casuale dal array
    const random1000 = Math.floor(Math.random() * 1000);

    // genera titolo e descrizione casuali (lorem)
    const title = faker.lorem.word();
    const description = faker.lorem.text();

    // assembla il post come oggetto
    const postData = {
      title,
      description,
      // setta la location con i valori della città casuale selezionata
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      // setta le coordinate geografiche della città
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].longitude, cities[random1000].latitude]
      },
      // setta l'autore del post
      author: "5e1cad7feae84c05da632f53"
    };
    // creiamo un oggetto post che rappresenta quello che abbiamo assemblato che vogliamo salvare nel DB
    let post = new Post(postData);
    // settiamo la descrizione della location PRIMA NON POTEVAMO FARLO PERCHE' CI SERVE L'ID DEL POST
    post.properties.description = `<strong><a href="/posts/${
      post._id
    }">${title}</a></strong><p>${post.location}</p><p>${description.substring(
      0,
      20
    )}...</p>`;
    // salviamo il post nel DB
    await post.save();
  }
  console.log("600 new posts created");
}

module.exports = seedPosts;
