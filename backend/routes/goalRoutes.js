const express = require("express");
var router = express.Router();
const authMiddleware = require;
const { addGoal, getGoals, shareGoal } = require("../controllers/goal");

//goals routes
router.use(authMiddleware);
router.post("/", addGoal);
router.post("/", getGoals);
router.post("/share", shareGoal);

module.exports = router;
