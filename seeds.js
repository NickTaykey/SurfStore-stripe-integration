const faker = require("faker"),
  Post = require("./models/post");

module.exports = async () => {
  // eliminiamo tutti i post
  await Post.deleteMany({});
  // creiamo 40 nuovi post
  for (let i = 0; i < 40; i++) {
    const post = {
      title: faker.lorem.words(5),
      description: faker.lorem.paragraphs(10),
      author: "5dfe539e1d7c37040f815fb8"
    };
    await Post.create(post);
  }
  console.log("40 new posts created");
};
