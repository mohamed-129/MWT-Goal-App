const express = require("express");
const router = express.Router();
const authMiddleware = require("../authMiddleware");
const { addGoal, getGoals, shareGoal } = require("../controllers/goal");
const { check } = require("express-validator")

// Import Goals Mongoose Schema
let Goal = require("../models/goal")

//router.use(authMiddleware);

// Middleware for validating form parameters
const validateGoal = [
    check('title', "Title is required").notEmpty(),
    check('description', "Description is required").notEmpty(),
    check('deadline', "Deadline is required").notEmpty(),
];

// Attach goal routes to router

// Goals route
router
    .route("/")
    .get((req, res) => {
        // Query MongoDB for goals
        Goal.find({ user: req.user.id}) // Return goals belonging to user
            .then((goals) => {
                console.log("Fetched Goals:", goals)
                // Pass goals to view_goals
                res.render("view_goals", {
                    title: "Goals",
                    goals: goals,
                })
            })
            .catch((err) => {
                console.log("Error fetching goals:", err);
                res.status(500).send("Error fetching goals");
            });
    })

// Add goals route
router
    .route("/add")
    .get((req, res) => {
        res.render("add_goal") // render the add goal form
    })    
    .post(validateGoal, addGoal); // Call the validateGoal and addGoal from controllers

router.post("/share", shareGoal);

module.exports = router
