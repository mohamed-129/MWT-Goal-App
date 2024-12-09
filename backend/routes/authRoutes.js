const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  renderResetPasswordPage,
} = require("../controllers/auth"); // Import functions from auth.js

// Render Login Form (GET)
router.get("/login", (req, res) => {
  res.render("login", { title: "Login", errors: null });
});

// Login Route (POST)
router.post("/login", loginUser); // Use the loginUser function from auth.js

// Render Registration Form (GET)
router.get("/register", (req, res) => {
  res.render("register", { title: "Register", errors: null });
});

// Registration Route (POST)
router.post("/register", registerUser); // Use the registerUser function from auth.js

// Forgot Password Route (GET)
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { title: "Forgot Password", errors: null });
});

// Forgot Password Route (POST)
router.post("/forgot-password", forgotPassword); // Use the forgotPassword function from auth.js

// Render Reset Password Page (GET)
router.get("/reset-password/:token", renderResetPasswordPage); // Use renderResetPasswordPage

// Reset Password (POST)
router.post("/reset-password", resetPassword); // Use the resetPassword function from auth.js

module.exports = router;
