const express = require("express");
var router = express.Router();
const {
  addGoal,
  getGoals,
  shareGoal,
  getSharedGoals,
} = require("../controllers/goal");
const authMiddleware = require("../authMiddleware");

router.use(authMiddleware);

//goals routes
router.use(authMiddleware);
router.post("/add", addGoal);
router.get("/", getGoals);
router.post("/share", shareGoal);
router.get("/shared", getSharedGoals);

module.exports = router;
