const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Use environment variable for security

// Render Login Form (GET)
router.get("/login", (req, res) => {
  res.render("login", { title: "Login", errors: null });
});

// Login Route (POST)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).render("login", { title: "Login", errors: [{ msg: "User not found." }] });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).render("login", { title: "Login", errors: [{ msg: "Invalid credentials." }] });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    res.status(500).render("login", { title: "Login", errors: [{ msg: "Error logging in. Please try again." }] });
  }
});

// Render Registration Form (GET)
router.get("/register", (req, res) => {
  res.render("register", { title: "Register", errors: null });
});

// Registration Route (POST)
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).render("register", { title: "Register", errors: [{ msg: "Email already exists." }] });

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.redirect("/api/auth/login"); // Redirect to login page after successful registration
  } catch (error) {
    res.status(500).render("register", { title: "Register", errors: [{ msg: "Error registering user. Please try again." }] });
  }
});

// Forgot Password Page Route (GET)
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { title: "Forgot Password", errors: null, message: null });
});

// Forgot Password POST Route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.render("forgot-password", { title: "Forgot Password", errors: [{ msg: "Email not found." }], message: null });

    // Generate reset token and save to the user
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Log reset token (Replace this with email-sending logic in production)
    console.log(`Reset token for ${email}: ${resetToken}`);

    res.render("forgot-password", { title: "Forgot Password", errors: null, message: "Reset token sent to your email." });
  } catch (error) {
    res.render("forgot-password", { title: "Forgot Password", errors: [{ msg: "An error occurred. Please try again." }], message: null });
  }
});

// Render Reset Password Form (GET)
router.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } }); // Check if token is valid
    if (!user) return res.render("reset-password", { title: "Reset Password", errors: [{ msg: "Invalid or expired token." }], token: null });

    res.render("reset-password", { title: "Reset Password", errors: null, token });
  } catch (error) {
    res.render("reset-password", { title: "Reset Password", errors: [{ msg: "An error occurred." }], token: null });
  }
});

// Reset Password (POST)
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } }); // Check if token is valid
    if (!user) return res.render("reset-password", { title: "Reset Password", errors: [{ msg: "Invalid or expired token." }], token: null });

    // Hash the new password and save
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.redirect("/api/auth/login"); // Redirect to login page after password reset
  } catch (error) {
    res.render("reset-password", { title: "Reset Password", errors: [{ msg: "An error occurred. Please try again." }], token: null });
  }
});

module.exports = router;

