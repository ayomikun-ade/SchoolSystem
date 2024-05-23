const mongoose = require("mongoose");
require("dotenv").config();

const connect = mongoose.connect(process.env.DB_URI);

//check connection
connect
  .then(() => {
    console.log("Database Connected Successfully...");
  })
  .catch(() => {
    console.log("Database couldn't connect");
  });

//Schema creation
const loginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

//collection
const collection = new mongoose.model("User", loginSchema);
module.exports = collection;
