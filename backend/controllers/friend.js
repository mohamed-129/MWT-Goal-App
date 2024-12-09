const Friend = require("../models/friend");
const User = require("../models/user");
const mongoose = require("mongoose");

// Send a Friend Request
const sendFriendReq = async (req, res) => {
  try {
    const { friendId, username } = req.body;
    let userToAdd;

    if (friendId) {
      // If the user selected from a dropdown
      userToAdd = await User.findById(friendId);
    } else if (username) {
      // If the user entered a username manually
      userToAdd = await User.findOne({ username: username.trim() });
    }

    if (!userToAdd) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if a friend request or friendship already exists
    const existingReq = await Friend.findOne({
      $or: [
        { user: req.user.id, friend: userToAdd._id },
        { user: userToAdd._id, friend: req.user.id },
      ],
    });

    if (existingReq) {
      return res.status(400).json({
        message: "Friend request or friendship already exists",
      });
    }

    // Create a new friend request
    await Friend.create({
      user: req.user.id,
      friend: userToAdd._id,
      status: "pending",
    });

    res.redirect("/api/friends"); // Redirect to the friends list
  } catch (err) {
    console.error("Error sending friend request:", err);
    res.status(500).json({
      error: "Error sending friend request",
    });
  }
};

// Accept a Friend Request
const acceptFriendReq = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid Friend Request ID" });
    }

    const friendReq = await Friend.findById(requestId);

    if (!friendReq || friendReq.friend.toString() !== req.user.id) {
      return res.status(404).json({
        message: "Friend request not found or unauthorized",
      });
    }

    // Accept the friend request
    friendReq.status = "accepted";
    await friendReq.save();

    // Create mutual friendship
    await Friend.create([
      { user: req.user.id, friend: friendReq.user, status: "accepted" },
      { user: friendReq.user, friend: req.user.id, status: "accepted" },
    ]);

    res.redirect("/api/friends"); // Redirect to the friends list
  } catch (err) {
    console.error("Error accepting friend request:", err);
    res.status(500).json({ error: "Error accepting friend request" });
  }
};

// Get Friends List
const getFriends = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).send("User not authenticated");
    }

    // Fetch all friend relationships involving the current user
    const friendships = await Friend.find({
      $or: [{ user: req.user.id }, { friend: req.user.id }],
    })
      .populate("user", "username email")
      .populate("friend", "username email");

    // Separate accepted and pending requests
    const acceptedFriends = friendships.filter(
      (friend) => friend.status === "accepted"
    );

    const pendingFriends = friendships.filter(
      (friend) =>
        friend.status === "pending" &&
        friend.friend &&
        friend.friend.toString() === req.user.id
    );

    // Log to debug
    console.log("Accepted Friends:", acceptedFriends);
    console.log("Pending Friends:", pendingFriends);

    // Render the friends list page
    res.render("friends_list", { acceptedFriends, pendingFriends });
  } catch (err) {
    console.error("Error fetching friends list:", err);
    res.status(500).send("Error fetching friends list");
  }
};

// Remove a Friend
const removeFriends = async (req, res) => {
  try {
    const { friendId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ message: "Invalid Friend ID" });
    }

    // Find and delete the friendship in either direction
    const result = await Friend.findOneAndDelete({
      $or: [
        { user: req.user.id, friend: friendId },
        { user: friendId, friend: req.user.id },
      ],
      status: "accepted",
    });

    if (!result) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    res.redirect("/api/friends"); // Redirect to the friends list
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({ error: "Error removing friend" });
  }
};

// Render the "Add Friend" form
const renderAddFriendForm = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } });
    res.render("add_friend", { users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Error fetching users");
  }
};

// Render the "Delete Friend" form
const renderDeleteFriendForm = async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [{ user: req.user.id }, { friend: req.user.id }],
      status: "accepted",
    })
      .populate("user", "username email")
      .populate("friend", "username email");

    res.render("delete_friend", { friends });
  } catch (err) {
    console.error("Error fetching friends list:", err);
    res.status(500).send("Error fetching friends list");
  }
};

// Render the "Confirm Remove Friend" form
const renderConfirmRemoveFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    res.render("confirm_remove", { friend });
  } catch (err) {
    console.error("Error fetching friend:", err);
    res.status(500).json({ error: "Error fetching friend" });
  }
};

module.exports = {
  sendFriendReq,
  acceptFriendReq,
  getFriends,
  removeFriends,
  renderAddFriendForm,
  renderDeleteFriendForm,
  renderConfirmRemoveFriend,
};
