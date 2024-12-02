const express = require("express");
var router = express.Router();
const { registerUser, loginUser } = require("../controllers/auth");

//authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
