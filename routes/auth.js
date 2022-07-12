const router = require("express").Router();
const User = require("../models/User");

// Register
router.get("/register", async (req, res) => {

      console.log("Hello")
    const user = new User({
      username: "trhrack",
      email: "travhck.ajah11@gmail.com",
      password: "123456",
    });

    await user.save();
    res.send("Ok real")
//   const dta = await User.find({}).then((response) =>{ return response}).catch(error => error);
//   console.log("dta ", dta);
});

module.exports = router;
