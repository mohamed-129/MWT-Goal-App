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
    const userId = req.user.id;

    // Find the friend request by ID (friend requests are stored with status 'pending')
    const friendRequest = await Friend.findById(requestId);

    if (!friendRequest) {
      return res.status(404).send("Friend request not found");
    }

    // Ensure that the current user is the receiver of the request
    if (friendRequest.friend.toString() !== userId) {
      return res
        .status(403)
        .send("You are not authorized to accept this request");
    }

    // Update the status of the request to "accepted"
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Ensure mutual friendship: sender sees the receiver as a friend and vice versa
    const existingFriendshipSender = await Friend.findOne({
      user: friendRequest.user,
      friend: userId,
    });

    const existingFriendshipReceiver = await Friend.findOne({
      user: userId,
      friend: friendRequest.user,
    });

    // If mutual friendships don't exist, create them
    if (!existingFriendshipSender) {
      await Friend.create({
        user: friendRequest.user,
        friend: userId,
        status: "accepted",
      });
    }

    if (!existingFriendshipReceiver) {
      await Friend.create({
        user: userId,
        friend: friendRequest.user,
        status: "accepted",
      });
    }

    // Optionally, remove the friend request after it's accepted
    await Friend.findByIdAndDelete(requestId);

    res.redirect("/api/friends");
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).send("Server error");
  }
};

// Get Friends List
const getFriends = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).send("User not authenticated");
    }

    // Fetch all friendships involving the current user, both pending and accepted
    const friendships = await Friend.find({
      $or: [
        { user: req.user.id, status: "pending" },
        { friend: req.user.id, status: "pending" },
        { user: req.user.id, status: "accepted" },
        { friend: req.user.id, status: "accepted" },
      ],
    })
      .populate("user", "username email")
      .populate("friend", "username email");

    // Separate accepted friends
    const acceptedFriends = friendships
      .filter((friendship) => {
        return (
          (friendship.status === "accepted" &&
            friendship.user._id.toString() === req.user.id &&
            friendship.friend._id.toString() !== req.user.id) ||
          (friendship.status === "accepted" &&
            friendship.friend._id.toString() === req.user.id &&
            friendship.user._id.toString() !== req.user.id)
        );
      })
      .map((friendship) => {
        // Return the friend that is not the current user
        if (friendship.user._id.toString() === req.user.id) {
          return friendship.friend;
        } else {
          return friendship.user;
        }
      });

    // Remove duplicate friends by mapping to their _id and then back to the friend object
    const uniqueAcceptedFriends = Array.from(
      new Set(acceptedFriends.map((friend) => friend._id.toString()))
    ).map((id) =>
      acceptedFriends.find((friend) => friend._id.toString() === id)
    );

    // Separate pending received friend requests (where current user is the receiver)
    const pendingReceivedRequests = friendships.filter(
      (friend) =>
        friend.status === "pending" &&
        friend.friend._id.toString() === req.user.id
    );

    // Separate sent friend requests (where current user is the sender)
    const sentRequests = friendships.filter(
      (friend) =>
        friend.status === "pending" &&
        friend.user._id.toString() === req.user.id
    );

    // Render the friends list page with the necessary data
    res.render("friends_list", {
      acceptedFriends: uniqueAcceptedFriends,
      pendingReceivedRequests,
      sentRequests,
    });
  } catch (err) {
    console.error("Error fetching friends list:", err);
    res.status(500).send("Error fetching friends list");
  }
};

// Remove a Friend
const removeFriends = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    // Find the friendship between the current user and the friend
    const friendRelationship = await Friend.findOne({
      $or: [
        { user: userId, friend: friendId },
        { user: friendId, friend: userId },
      ],
      status: "accepted", // Ensure it's an accepted friendship
    });

    if (!friendRelationship) {
      return res.status(404).send("Friendship not found or not accepted");
    }

    // Remove the friendship
    await Friend.findOneAndDelete({
      _id: friendRelationship._id,
    });

    res.status(200).send("Friend removed successfully");
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).send("Server error");
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

// Render the "Confirm Remove Friend" form
const renderConfirmRemoveFriend = async (req, res) => {
  try {
    const { friendId } = req.params; // Get the friend's ID from the URL params
    const userId = req.user.id; // Get the current user's ID

    // Find the friendship with status "accepted" between the current user and the friend
    const friendship = await Friend.findOne({
      $or: [
        { user: userId, friend: friendId, status: "accepted" },
        { user: friendId, friend: userId, status: "accepted" },
      ],
    });

    if (!friendship) {
      return res.status(404).send("Friendship not found or not accepted");
    }

    // Find the friend's details to pass to the view
    const friend = await User.findById(friendId); // Find the friend by ID

    if (!friend) {
      return res.status(404).send("Friend not found");
    }

    // Render the confirmation page with the friend data
    res.render("confirm_remove", { friend });
  } catch (error) {
    console.error("Error showing confirmation page:", error);
    res.status(500).send("Server error");
  }
};

// DELETE: Decline or remove a pending friend request
const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Find the pending friend request by its ID
    const friendRequest = await Friend.findById(requestId);

    if (!friendRequest) {
      return res.status(404).send("Friend request not found");
    }

    // Ensure that the current user is either the sender or receiver of the request
    if (
      friendRequest.user.toString() !== userId &&
      friendRequest.friend.toString() !== userId
    ) {
      return res
        .status(403)
        .send("You are not authorized to decline this request");
    }

    // If the request is pending, delete it
    if (friendRequest.status === "pending") {
      await friendRequest.deleteOne();
      return res.redirect("/api/friends"); // Redirect to the friends page after deletion
    } else {
      return res.status(400).send("Only pending requests can be deleted");
    }
  } catch (error) {
    console.error("Error deleting friend request:", error);
    res.status(500).send("Server error");
  }
};

module.exports = {
  sendFriendReq,
  acceptFriendReq,
  getFriends,
  removeFriends,
  renderAddFriendForm,
  renderConfirmRemoveFriend,
  declineFriendRequest,
};
