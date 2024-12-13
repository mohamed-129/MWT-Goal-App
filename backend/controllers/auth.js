const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).redirect("/api/auth/login");
  } catch (err) {
    console.error("Error during user registration:", err); 
    res.status(500).json({ err: "Error registering user. Please try again later." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect("/");
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ err: "Error logging in user. Please try again later." });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Here is your password reset token: ${resetToken}. It is valid for 1 hour.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Reset token sent to your email." });
  } catch (err) {
    res.status(500).json({ err: "Error processing forgot password request" });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.redirect("/api/auth/login");
  } catch (err) {
    res.status(500).json({ err: "Error resetting password. Please try again later." });
  }
};

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

    res.render("reset-password", { title: "Reset Password", errors: null, token });
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
