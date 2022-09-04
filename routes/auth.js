const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Register
router.post("/register", async (req, res) => {
  try {
    // generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user instance
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
    });

    // Save user and return a response
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.find({ email: req.body.email });
    console.log(user)
    if (!user) {
      return res.status(404).json("user not found");
    }
    // check if the password is incorrect and send a response to the user
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json("password incorrect");
    }

    // Returns the user if everything is okay
    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
