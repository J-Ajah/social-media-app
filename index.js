const express = require("express");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 8800;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const uploadRoutes = require("./routes/upload");
const path = require("path");

dotenv.config(); // Provides environment variables for the Application process usage.


mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

// Meaning - if this path is used then don't make any request. Just go this directory
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Middleware
app.use(express.json());

app.use(helmet()); ///Secures request between node and express applications
app.use(morgan("common")); //Http request logger

// Adds the url to the whitelist for Cross Origin Resource Sharing.
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/upload", uploadRoutes);

app.listen(PORT, () => {
  console.log("backend server is running!");
});
