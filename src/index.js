//modules
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const collection = require("./config");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

//convert data to json
app.use(express.json());

//session middleware
app.use(
  session({
    secret: "random-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

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
  const name = req.session.username;
  //   checks if user is logged in before giving access to dashboard
  if (name) {
    res.render("dashboard", { name }); //renders user name to dashboard
  } else {
    res.redirect("/login");
  }

  //   res.render("dashboard", { name: name }); //renders user name to dashboard
});

//register user
app.post("/signup", async (req, res) => {
  let { username, password } = req.body;
  //check if user exists
  const existingUser = await collection.findOne({ username });
  if (existingUser) {
    res.send("User already exists. Please choose a different username.");
  } else {
    //hashing
    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(password, saltRounds);
    password = hashedPass;
    await collection.create({ name: username, password });
    req.session.username = username;
    res.redirect("/login");
  }
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) {
      res.send("User cannot be found. Please put in a registered username");
    }
    // Compare the hashed password from the database with the plaintext password
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      check.password
    );
    if (!isPasswordMatch) {
      res.send("Wrong Password. Try again");
    } else {
      req.session.username = req.body.username;
      res.redirect("/dashboard");
    }
  } catch (err) {
    // res.send("Wrong Details");
    console.log(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
