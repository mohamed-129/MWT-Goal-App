const Goal = require("../models/goal");
const User = require("../models/user");
const { validationResult } = require("express-validator");

// Add a new goal
const addGoal = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login")
  }
  const errors = validationResult(req);
  const formData = req.body;

  // Log form data for debugging
  console.log("Add Goal - Form Data:", formData);

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
    console.log("New Goal Created:", newGoal)
    res.redirect("/api/goals"); // Redirect to the goals list after adding
  } catch (err) {
    console.error("Error adding goal:", err);
    res.status(500).render("error", { message: "Error adding goal" });
  }
};

// Fetch goals for the authenticated user
const getGoals = async (req, res) => {
  if (!req.user) {
    return res.redirect("login")
  }
  try {
    console.log("Logged in user", req.user)
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
    res.redirect("/api/goals"); // Redirect to the goals list
  } catch (err) {
    console.error("Error sharing goal:", err);
    res.status(500).render("error", { message: "Error sharing goal" });
  }
};

// Fetch shared goals for the authenticated user
const renderShareGoalPage = async (req, res) => {
  try {
    const { goalId } = req.params;

    // Fetch the goal by ID
    const goal = await Goal.findById(goalId);

    // Verify if the goal exists and belongs to the authenticated user
    if (!goal || goal.user.toString() !== req.user.id) {
      return res.status(404).render("error", {
        message: "Goal not found or unauthorized",
        error: { status: 404 },
      });
    }

    // Fetch friends (replace this with your actual friends-fetching logic)
    const friends = await User.find({ _id: { $ne: req.user.id } });

    // Render the page with goal and friends
    res.render("share_goal", { goal, friends });
  } catch (err) {
    console.error("Error rendering share goal page:", err);
    res.status(500).render("error", {
      message: "Error rendering share goal page",
      error: err,
    });
  }
};

const renderDeleteGoalPage = async (req, res) => {
  try {
    const { goalId } = req.params;
    const goal = await Goal.findById(goalId);

    if (!goal || goal.user.toString() !== req.user.id) {
      return res.status(404).render("error", {
        message: "Goal not found or unauthorized",
        error: { status: 404 },
      });
    }

    res.render("delete_goal", { goal });
  } catch (err) {
    console.error("Error rendering delete goal page:", err);
    res.status(500).render("error", {
      message: "Error rendering delete goal page",
      error: err,
    });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await Goal.findById(goalId);

    if (!goal || goal.user.toString() !== req.user.id) {
      return res.status(404).render("error", {
        message: "Goal not found or unauthorized",
        error: { status: 404 },
      });
    }

    await Goal.findByIdAndDelete(goalId);
    res.redirect("/api/goals");
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).render("error", {
      message: "Error deleting goal",
      error: err,
    });
  }
};

module.exports = {
  addGoal,
  getGoals,
  shareGoal,
  renderShareGoalPage,
  deleteGoal,
  renderDeleteGoalPage,
};
