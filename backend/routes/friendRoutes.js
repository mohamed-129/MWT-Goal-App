const express = require("express");
const {
  sendFriendReq,
  acceptFriendReq,
  getFriends,
  removeFriends,
} = require("../contorllers/friend");
const authMiddleware = require("../authMiddleware");
var router = express.Router();

router.use(authMiddleware);

//routes
router.post("/request", sendFriendReq); //send friend req
router.put("/accept/:requestId", acceptFriendReq); //accept friend request
router.get("/", getFriends); // friends list
router.delete("/:friendId", removeFriends); //remove friends

module.exports = router;
