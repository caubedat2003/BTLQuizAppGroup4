const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL);

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("MongoDB Connection Successful");
});

connection.on("error", (err) => {
  console.log("MongoDB Connection Failed");
});

module.exports = connection;