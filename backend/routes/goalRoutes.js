const express = require("express");
const router = express.Router();
const authMiddleware = require("../authMiddleware");

const {
  addGoal,
  getGoals,
  shareGoal,
  getSharedGoals,
} = require("../controllers/goal");
const { check } = require("express-validator");

// Import Goals Mongoose Schema
let Goal = require("../models/goal");
const user = require("../models/user");

router.use(authMiddleware);

// Middleware for validating form parameters
const validateGoal = [
  check("title", "Title is required").notEmpty(),
  check("description", "Description is required").notEmpty(),
  check("deadline", "Deadline is required").notEmpty(),
];

// Attach goal routes to router

// Goals route
router.route("/").get(async (req, res) => {
  try {
    // Fetch goals for the authenticated user
    const goals = await Goal.find({ user: req.user.id });

    // Pass goals and the username to the template
    res.render("view_goals", {
      title: "Goals", // Title for the page
      goals: goals, // Goals retrieved from the database
      user: req.user.username, // Username from the decoded JWT token
    });
    console.log(user);
  } catch (err) {
    console.log("Error fetching goals:", err);
    res.status(500).send("Error fetching goals");
  }
});

// Add goals route
router
  .route("/add")
  .get((req, res) => {
    res.render("add_goal"); // render the add goal form
  })
  .post(validateGoal, addGoal); // Call the validateGoal and addGoal from controllers

// Goals route
router.route("/").get((req, res) => {
  // Query MongoDB for goals
  Goal.find({}) // Return goals belonging to user
    .then((goals) => {
      console.log("Fetched Goals:", goals);
      // Pass goals to view_goals
      res.render("view_goals", {
        title: "Goals",
        goals: goals,
        user: "Your_Name",
      });
    })
    .catch((err) => {
      console.log("Error fetching goals:", err);
      res.status(500).send("Error fetching goals");
    });
});

// Add goals route
router
  .route("/add")
  .get((req, res) => {
    res.render("add_goal"); // render the add goal form
  })
  .post(validateGoal, addGoal); // Call the validateGoal and addGoal from controllers

router.post("/share", shareGoal);
router.get("/shared", getSharedGoals);

module.exports = router;
