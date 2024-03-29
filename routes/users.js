const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;

  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });

    const { isAdmin, __v, password, updatedAt, createdAt, ...others } =
      user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    // Finds the current user by the Id
    const user = await User.findById(req.params.userId);

    // Returns each friends following posts
    const friends = await Promise.all(
      user.followings.map((followerId) => {
        return User.findById(followerId);
      })
    );

    let friendsList = [];
    // Gets the Id, username and ProfilePicture from the friend.
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendsList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendsList);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update a user
router.put("/:id", async (req, res) => {
  // Checks if the id of the user matches the id of the route params
  if (req.body.userId === req.params.id || req.body?.isAdmin) {
    // If the user is trying to update his password
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }

    // update actual user
    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

      res.status(200).json("Account updated successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Sorry you can only update yor account!");
  }
});

// delete a user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body?.isAdmin) {
    try {
      await User.findByIdAndDelete({ _id: req.params.id });
      res.status(200).json("Account has been deleted successfully");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("Sorry you can only delete your account");
  }
});

// follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params?.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!user.followers.includes(req.body.userId)) {
        // updates the user followers array
        await user.updateOne({ $push: { followers: req.body.userId } });

        // updates the current users following array
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you are already following this user");
      }
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(403).json("Sorry you can't follow yourself");
  }
});

// unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });

        // updates the current list of followings
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("You have already unfollowed this user");
      }
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(403).json("Sorry you can't unfollow yourself");
  }
});

module.exports = router;
