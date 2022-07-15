const express = require("express");
const app = express();

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");

dotenv.config();
console.log(process.env.MONGO_URL);

// mongoose.connect(
//   process.env.MONGO_URL,
//   { },
//   () => {
//     console.log("Connected Successfully!");
//   }
// );

mongoose.connect(process.env.MONGO_URL)
    .then(()=>{
        console.log("DB connection successful");
    })
    .catch((err)=>{
        console.log(err);
    })

// Middleware

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));



app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes)



app.listen(8800, () => {
  console.log("backend server is running!");
});
