const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const fs = require("fs")

const JSEncrypt = require("nodejs-jsencrypt").default;


// Register
router.post("/register", async (req, res) => {
  try {
    // generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // check if user already exist in the database and send a response
    const user = await User.find({ username: req.body.username });
    let msg;
    if (user.length === 0) {
      // Create a new user instance
      const newUser = new User({
        username: req.body.username,
        email: req.body.email.toLowerCase(),
        password: hashedPassword,
      });

      // Save user and return a response
      const userIsSaved = await newUser.save();

      msg = res.status(200).json(userIsSaved);
    } else {
      msg = res.status(404).json({
        message: "username is already taken. Please choose a different name",
      });
    }

    return msg;
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    // Decrypting of user information starts here

    const decrypt = new JSEncrypt();
    const privateKey = fs.readFileSync("private.pem", "utf8");
    decrypt.setPrivateKey(privateKey);
    let decryptedPassword = decrypt.decrypt(req.body.password);

    // Decryption of user information ends here

    const user = await User.find({ email: req.body.email });

      
    if (!user || user.length <= 0) {
      return res.status(404).json("user not found");
    }
    // check if the password is incorrect and send a response to the user

    const validPassword = await bcrypt.compare(
      req.body.password,
      user[0].password
    );

    if (!validPassword) {
      return res.status(400).json("password incorrect");
    }

    // Returns the user if everything is okay
    return res.status(200).json(user);
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});

// Password reset route

router.post("/updateUser/:id", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json("Sorry, user was not found");
    }
    if (user && user.email === req.body.email) {
      // Update the user's password field
      user.password = hashedPassword;
      user.save((err) => {
        if (err) return res.status(400).json("Unable to perform the operation");
      });
      return res.status(200).json("User updated successfully");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
