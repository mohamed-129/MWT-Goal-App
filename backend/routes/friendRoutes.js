const express = require("express");
const {
  sendFriendReq,
  acceptFriendReq,
  getFriends,
  removeFriends,
  renderAddFriendForm,
  renderDeleteFriendForm,
  renderConfirmRemoveFriend,
} = require("../controllers/friend");
const authMiddleware = require("../authMiddleware");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/** ----------- Friend Management Routes ----------- **/

// Send a friend request
router.post("/request", sendFriendReq);

// Accept a friend request
router.put("/accept/:requestId", acceptFriendReq);

// Get the list of friends
router.get("/", getFriends);

// Remove a friend
router.delete("/:friendId", removeFriends);

/** ----------- Friend Form Rendering Routes ----------- **/

// Render the "Add Friend" form
router.get("/add", renderAddFriendForm);

// Render the "Delete Friend" form
router.get("/delete", renderDeleteFriendForm);

// Render the "Confirm Remove Friend" form
router.get("/confirm_remove/:friendId", renderConfirmRemoveFriend);

module.exports = router;
