const Friend = require("../models/friend");
const User = require("../models/user");

//send freind request
const sendFriendReq = async (req, res) => {
  try {
    const { friendId } = req.body;

    // Check if friend request already exists
    const existingReq = await Friend.findOne({
      user: req.user.id,
      friend: friendId,
    });

    if (existingReq) {
      return res.status(400).json({
        message: "Friend request already exists",
      });
    }

    // Create the friend request
    const friendReq = await Friend.create({
      user: req.user.id,
      friend: friendId,
      status: "pending",
    });

    res.status(201).json(friendReq);
  } catch (err) {
    res.status(500).json({
      error: err.message || "Error sending friend request",
    });
  }
};

//Accept Friend Request
const acceptFriendReq = async (req, res) => {
  try {
    const { requestId } = req.params;
    const friendReq = await Friend.findById(requestId);

    if (!friendReq || friendReq.friend.toString() !== req.user.id) {
      return req.status(404).json({
        message: "Friend request not found",
      });
    }

    friendReq.status = "accepted";
    await friendReq.save();

    res.joson({ message: "Friend Request accepeted" });
  } catch (err) {
    res.status(500).json({ err: "Error accepting friend request" });
  }
};

//Freinds List
const getFriends = async (req, res) => {
  try {
    const freinds = await Friend.find({
      $or: [{ user: req.user.id }, { freind: req.user.id }],
      status: "accepted",
    }).populate("user friend", "username email");

    res.json(friends);
  } catch (err) {
    res.status(500).json({ err: "Error fethcing friendds list" });
  }
};

//remove friend
const removeFriends = async (req, res) => {
  try {
    const { friendId } = req.params;

    await Friend.findOneAndDelete({
      $or: [
        { user: req.user.id, firend: friendId },
        { user: friendId, friend: req.user.id },
      ],
      status: "aacepted",
    });
    res.json({ message: "Friend removed successfully" });
  } catch (err) {
    res.status(500).json({ err: "Error removing friend" });
  }
};

module.exports = { sendFriendReq, acceptFriendReq, getFriends, removeFriends };
