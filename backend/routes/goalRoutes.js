const express = require("express");
const router = express.Router();
const authMiddleware = require("../authMiddleware");
const { check } = require("express-validator");

// Import controllers
const {
  getGoals,
  renderAddGoalForm,
  addGoal,
  shareGoal,
  getSharedGoals,
} = require("../controllers/goal");

// Middleware for validating form parameters
const validateGoal = [
  check("title", "Title is required").notEmpty(),
  check("description", "Description is required").notEmpty(),
  check("deadline", "Deadline is required").notEmpty(),
];

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Routes
router.get("/", getGoals); // Fetch goals for authenticated user
router
  .route("/add")
  .get((req, res) => res.render("add_goal")) // Render the form
  .post(validateGoal, addGoal); // Add a new goal
router.post("/share", shareGoal); // Share a goal
router.get("/shared", getSharedGoals); // Fetch shared goals

module.exports = router;
