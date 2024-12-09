const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Register User
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Redirect to the login page after successful registration
    res.status(201).redirect("/api/auth/login");
  } catch (err) {
    res.status(500).json({ err: "Error registering user" });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h", // You can adjust this time if necessary
    });

    // Set the token as a cookie (for client-side access)
    res.cookie("authToken", token, {
      httpOnly: false, // Make sure it's true to prevent JS access
      secure: process.env.NODE_ENV === "production", // Only for production over HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Redirect to home or another page after successful login
    res.redirect("/"); // Redirect to the home page or wherever needed
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ err: "Error logging in user" });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    console.log(`Reset token for ${email}: ${resetToken}`); // Replace with email-sending logic
    res.status(200).json({
      message: "Reset token sent to your email.",
    });
  } catch (err) {
    res.status(500).json({ err: "Error processing forgot password request" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ err: "Error resetting password" });
  }
};

// Reset Password Page (GET) - render reset form
const renderResetPasswordPage = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user)
      return res.render("reset-password", {
        title: "Reset Password",
        errors: [{ msg: "Invalid or expired token." }],
        token: null,
      });

    res.render("reset-password", {
      title: "Reset Password",
      errors: null,
      token,
    });
  } catch (err) {
    res.render("reset-password", {
      title: "Reset Password",
      errors: [{ msg: "An error occurred." }],
      token: null,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  renderResetPasswordPage,
};
