const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    res.status(201).json({ message: "User registered!" });
  } catch (err) {
    res.status(500).json({ err: "Error registering user" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h", // You can adjust this time if necessary
    });

    // Set the token as a cookie (for client-side access)
    res.cookie("authToken", token, {
      httpOnly: false, // Prevents JavaScript access to the cookie
      secure: process.env.NODE_ENV === "production", // Only for production over HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Redirect to home or another page after successful login
    res.redirect("/"); // This redirects to the home page. Change if needed
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ err: "Error logging in user" });
  }
};

module.exports = { registerUser, loginUser };
