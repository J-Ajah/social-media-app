const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config(); // Provides environment variables for the Application process usage.
console.log(process.env.CLOUDINARY_KEY);

// Configuration
cloudinary.config({
  cloud_name: "duedatz3o",
  api_key: "278358134263853",
  api_secret: process.env.CLOUDINARY_KEY,
});

const uploadFileToCloudinary = (file, res) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      { folder: "/social_media" },
      (error, data) => {
        if (error) {
          res.status(500).json("Failed to upload image");
        }

        resolve(data?.secure_url);
      }
    );
  });
};

module.exports = {uploadFileToCloudinary};
