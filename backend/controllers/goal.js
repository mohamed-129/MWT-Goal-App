const Goal = require("../models/goal");

const addGoal = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const goal = await Goal.create({ ...req.body, user: req.user.id });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ err: "Error adding goal" });
    console.log(req.user);
  }
};

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ err: "Error fetching goals" });
  }
};

const shareGoal = async (req, res) => {
  try {
    const { goalId, friendId } = req.body;

    const goal = await Goal.findById(goalId);

    if (!goal || goal.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Push the friend's ID to the sharedWith array if not already present
    if (!goal.sharedWith.includes(friendId)) {
      goal.sharedWith.push(friendId);
    }

    await goal.save();
    res.json({ message: "Goal shared" });
  } catch (err) {
    res.status(500).json({ err: "Error sharing goal" });
  }
};

const getSharedGoals = async (req, res) => {
  try {
    // Find all goals where the logged-in user's ID is in the sharedWith array
    const sharedGoals = await Goal.find({
      sharedWith: req.user.id, // Check if the user ID is in the sharedWith array
    });

    // If no shared goals are found, return an error message
    if (sharedGoals.length === 0) {
      return res.status(404).json({ message: "No shared goals found" });
    }

    // Return the shared goals to the user
    res.json(sharedGoals);
  } catch (err) {
    res.status(500).json({ err: "Error fetching shared goals" });
  }
};

module.exports = { addGoal, getGoals, shareGoal, getSharedGoals };
