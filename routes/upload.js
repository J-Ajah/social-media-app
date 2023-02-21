const router = require("express").Router();
const path = require("path");
const multer = require("multer"); //for uploading multi files
const { uploadFileToCloudinary } = require("../utils/utilities");
const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();


// Allowed image formats
const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/jpg"];

//make multer ready for in-memory storage of uploaded file
const multerMemoryStorage = multer.memoryStorage();
const multerUploadInMemory = multer({
  storage: multerMemoryStorage,
  fileFilter: function (req, file, cb) {
    if (ALLOWED_FORMATS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Not supported file type!"), false);
    }
  },
});

const singleUpload = multerUploadInMemory.single("file");

const singleUploadCtrl = (req, res, next) => {
  singleUpload(req, res, (error) => {
    if (error) {
      return res.status(422).send({ message: "Image upload fail!" });
    }

    next();
  });
};


// Returns a base64 image property of the given file buffer
const formatBufferTo64 = (file) =>{
  return parser.format(path.extname(file.originalname).toString(), file.buffer);
 }

 

// Request path starts here
router.post("/", singleUploadCtrl, async (req, res) => {
  try {
    // Converts the file buffer to base64 string format
    const conversionResult = formatBufferTo64(req.file);

    // Uploads the file to cloudinary
    const url = await uploadFileToCloudinary(conversionResult.content, res);
    return res.status(200).json({
      message: "File has been uploaded successfully",
      url: url,
    });
  } catch (error) {
    return res.status(500).json("Image upload failed");
  }
});

module.exports = router;
