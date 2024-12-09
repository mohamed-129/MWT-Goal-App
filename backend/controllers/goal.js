const Goal = require("../models/goal");
const { validationResult } = require("express-validator");

// Add a new goal
const addGoal = async (req, res) => {
  const errors = validationResult(req);
  const formData = req.body;

  // Log form data for debugging
  console.log("Form Data:", formData);

  if (!errors.isEmpty()) {
    console.log("Validation Errors:", errors.errors);
    // Render the add goal page with validation errors and form data
    return res.render("add_goal", {
      errors: errors.errors,
      goalTitle: formData.title || "",
      goalDescription: formData.description || "",
      goalDeadline: formData.deadline || "",
    });
  }

  try {
    // Create a new goal and associate it with the authenticated user
    const { title, description, deadline } = req.body;
    const newGoal = await Goal.create({
      title,
      description,
      deadline,
      user: req.user.id,
    });
    res.redirect("/api/goals"); // Redirect to the goals list after adding
  } catch (err) {
    console.error("Error adding goal:", err);
    res.status(500).render("error", { message: "Error adding goal" });
  }
};

// Fetch goals for the authenticated user
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }); // Fetch user's goals
    res.render("view_goals", {
      title: "Goals",
      goals,
      user: req.user.username,
    });
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).render("error", { message: "Error fetching goals" });
  }
};

// Share a goal with another user
const shareGoal = async (req, res) => {
  try {
    const { goalId, friendId } = req.body;

    const goal = await Goal.findById(goalId);

    // Check if the goal exists and belongs to the authenticated user
    if (!goal || goal.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Add friend's ID to the sharedWith array if not already present
    if (!goal.sharedWith.includes(friendId)) {
      goal.sharedWith.push(friendId);
    }

    await goal.save();
    res.redirect("/goals"); // Redirect to the goals list
  } catch (err) {
    console.error("Error sharing goal:", err);
    res.status(500).render("error", { message: "Error sharing goal" });
  }
};

// Fetch shared goals for the authenticated user
const getSharedGoals = async (req, res) => {
  try {
    const sharedGoals = await Goal.find({
      sharedWith: req.user.id, // Check if the user is in the sharedWith array
    });

    // Render the shared goals or send a message if no goals are found
    if (sharedGoals.length === 0) {
      return res.render("shared_goals", {
        title: "Shared Goals",
        message: "No shared goals found",
        sharedGoals: [],
      });
    }

    res.render("shared_goals", {
      title: "Shared Goals",
      sharedGoals,
    });
  } catch (err) {
    console.error("Error fetching shared goals:", err);
    res.status(500).render("error", { message: "Error fetching shared goals" });
  }
};

module.exports = { addGoal, getGoals, shareGoal, getSharedGoals };
