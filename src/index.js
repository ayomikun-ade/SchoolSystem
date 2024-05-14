//modules
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const collection = require("./config");

require("dotenv").config();

const app = express();
const port = process.env || 4000;

//convert data to json
app.use(express.json());

//indicating static files
app.use(express.static("public"));

////url encoding
app.use(express.urlencoded({ extended: true }));

//EJS
app.set("view engine", "ejs");

//render page
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

//register user
app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password,
  };
  //check if user exists
  const existingUser = await collection.findOne({ name: data.name });
  if (existingUser) {
    res.send("User already exists. Please choose a different username.");
  } else {
    //hashing
    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPass;
    const userData = await collection.insertMany(data);
    res.redirect("dashboard");
  }
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) {
      res.send("User cannot found. Please put in a registered username");
    }
    // Compare the hashed password from the database with the plaintext password
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      check.password
    );
    if (!isPasswordMatch) {
      res.send("Wrong Password");
    } else {
      res.render("dashboard");
    }
  } catch {
    res.send("Wrong Details");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
