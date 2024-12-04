const Goal = require("../models/goal");
const { validationResult } = require("express-validator")

const addGoal = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  const formData = req.body
  // Debugging
  console.log('Title:', formData.title)
  console.log('Description:', formData.description)
  console.log('Deadline:', formData.deadline)
    if (!errors.isEmpty()) {
      console.log(errors.errors)
      // Render the add goal page with error data
      return res.render("add_goal", {
        errors: errors.errors,
        goalTitle: formData.title,
        goalDescription: formData.description,
        goalDeadline: formData.deadline
      })
    }
  // Create goal if no errors
  try {
    const { title, description, deadline } = req.body;
    const newGoal = await Goal.create({ ...req.body, user: req.user.id });
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(500).json({ err: "Error adding goal" });
  }
};

const getGoals = async (req, res) => {
  try {
    const goals = await goal.find({ user: req.user.id });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ err: "Error fetching goals" });
  }
};

const shareGoal = async (req, res) => {
  try {
    const { goalId, friendId } = req.body;

    const goal = await goal.findById(goalId);

    if (!goal || goal.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Goal not found" });
    }

    //push friend to sharedWidth array
    if (!goal.sharedWith.includes(friendId)) {
      goal.sharedWith.push(friendId);
    }

    await goal.save();
    res.json({ message: "Goal shared" });
  } catch (err) {
    res.status(500).json({ err: "error sharing goal" });
  }
};

module.exports = { addGoal, getGoals, shareGoal };
