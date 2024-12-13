const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  renderResetPasswordPage,
} = require("../controllers/auth"); 


router.get("/login", (req, res) => {
  res.render("login", { title: "Login", errors: null });
});

router.post("/login", loginUser); 

router.get("/register", (req, res) => {
  res.render("register", { title: "Register", errors: null });
});

router.post("/register", registerUser); 


router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { title: "Forgot Password", errors: null });
});

router.post("/forgot-password", forgotPassword);

router.get("/reset-password/:token", renderResetPasswordPage); 

router.post("/reset-password", resetPassword); 


router.get("/not-logged-in", (req, res) => {
  res.render("not_logged_in", { title: "Not Logged In" });
});

module.exports = router;
