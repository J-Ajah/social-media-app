const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// get a post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    return res
      .status(404)
      .json(
        "Error fetching post. Please ensure the right Id has been provided"
      );
  }
});

// create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);

  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update a post
router.put("/:id", async (req, res) => {
  console.log("Routes post is here");
  try {
    // fetches the current users Id
    const post = await Post.findById(req.params.id);

    // Checks the users post id and the request body userId is thesame
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("The post has been updated successfully.");
    } else {
      res.status(403).json("Sorry you can only update your post.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the user is authorized to perform the deletion of the post
    if (req.body.userId === post.userId) {
      try {
        await Post.findByIdAndDelete({ _id: req.params.id });
        res.status(200).json("Account has been deleted successfully");
      } catch (err) {
        return res.status(500).json(err);
      }
    }
  } catch (err) {
    return res.status(500).json("Sorry you cannot delete this post.");
  }
});

// Like and dislike post

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// get timeline posts of users
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);

    const userPosts = await Post.find({ userId: currentUser._id });
    console.log("============", userPosts);

    //  Fetches the posts of the users that is been followed
    const friendsPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendsPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

// get specific posts of a user

router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
