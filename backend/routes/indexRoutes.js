const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { title: "Aspire" }); // Render the Pug template
});

module.exports = router;