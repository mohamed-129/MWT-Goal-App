const express = require("express");
const {
  sendFriendReq,
  acceptFriendReq,
  getFriends,
  removeFriends,
} = require("../controllers/friend");
const Friend = require("../models/friend");
const User = require("../models/user");
const authMiddleware = require("../authMiddleware");
var router = express.Router();

router.use(authMiddleware);

//routes
router.post("/request", sendFriendReq); //send friend req
router.put("/accept/:requestId", acceptFriendReq); //accept friend request
router.get("/", getFriends);
// friends list
router.delete("/:friendId", removeFriends); //remove friends

// Route to render the "Add Friend" form
router.get("/add", (req, res) => {
  // Assuming you have a list of users to choose from (excluding the logged-in user)
  User.find({ _id: { $ne: req.user.id } })
    .then((users) => {
      res.render("add_friend", { users }); // Render the form with available users
    })
    .catch((err) => {
      res.status(500).send("Error fetching users");
    });
});

// Route to render the "Delete Friend" form
router.get("/delete", (req, res) => {
  // Fetch the user's current friends to delete
  Friend.find({
    $or: [{ user: req.user.id }, { friend: req.user.id }],
    status: "accepted",
  })
    .populate("user", "username email")
    .populate("friend", "username email")
    .then((friends) => {
      res.render("delete_friend", { friends }); // Render the form with friends to delete
    })
    .catch((err) => {
      res.status(500).send("Error fetching friends list");
    });
});

// Route for confirming friend removal
router.get("/confirm_remove/:friendId", async (req, res) => {
  try {
    const { friendId } = req.params;

    // Find the friend by their ID
    const friend = await User.findById(friendId); // Adjust this if you need to get the friend's data from the Friend model

    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    // Pass the friend object to the view
    res.render("confirm_remove", { friend });
  } catch (err) {
    console.error("Error fetching friend:", err);
    res.status(500).json({ error: "Error fetching friend" });
  }
});

module.exports = router;
