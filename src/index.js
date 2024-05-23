//modules
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const flash = require("connect-flash");
const collection = require("./config");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

//convert data to json
app.use(express.json());

//session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

//indicating static files
app.use(express.static("public"));

//url encoding
app.use(express.urlencoded({ extended: true }));

//flash message middleware
app.use(flash());

//EJS
app.set("view engine", "ejs");

//render page
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login", { messages: req.flash() });
});

app.get("/signup", (req, res) => {
  res.render("signup", { messages: req.flash() });
});

app.get("/dashboard", (req, res) => {
  const username = req.session.username;
  //   checks if user is logged in before giving access to dashboard
  if (username) {
    res.render("dashboard", { username, messages: req.flash() }); //renders user name to dashboard
  } else {
    res.redirect("/login");
  }

  //   res.render("dashboard", { name: name }); //renders user name to dashboard
});

//register user
app.post("/signup", async (req, res) => {
  let { username, email, password } = req.body;
  //check if user exists
  const existingUser = await collection.findOne({ username });
  const existingEmail = await collection.findOne({ email });
  if (existingUser) {
    req.flash(
      "error",
      "User already exits. Please choose a different username."
    );
    res.redirect("/signup");
  } else if (existingEmail) {
    req.flash(
      "error",
      "Email already in use. Please choose a different email."
    );
    res.redirect("/signup");
  } else {
    //hashing
    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(password, saltRounds);
    password = hashedPass;
    await collection.create({ username, email, password });
    req.session.username = username;
    req.flash("success", "Sign up successful. Please login.");
    res.redirect("/login");
  }
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const check = await collection.findOne({ username });
    if (!check) {
      req.flash(
        "error",
        "User cannot be found. Put in a registered username or create an account."
      );
      res.redirect("/login");
    }

    // Compare the hashed password from the database with the plaintext password
    const isPasswordMatch = await bcrypt.compare(password, check.password);
    if (!isPasswordMatch) {
      req.flash("error", "Wrong password. Please try again.");
      res.redirect("/login");

      // res.send("Wrong Password. Try again");
    } else {
      req.session.username = username;
      req.flash("success", "Login Successful.");
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
