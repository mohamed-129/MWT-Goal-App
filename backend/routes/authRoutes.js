const express = require("express");
var router = express.Router();
const { registerUser, loginUser } = require("../controllers/auth");

// Authentication routes
router.post("/register", registerUser); // Route for registration (POST)
router.post("/login", loginUser); // Route for login (POST)

// Render the register page (GET request)
router.get("/register", (req, res) => {
  res.render("register"); // Renders the register.pug template
});

// Render the login page (GET request)
router.get("/login", (req, res) => {
  res.render("login"); // Renders the login.pug template
});

module.exports = router;
