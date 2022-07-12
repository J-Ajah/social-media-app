const router = require("express").Router();

router.get("/", (req, res)=>{
    res.send("Users Route")
})


module.exports = router;

 