const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middleware/authMiddleware");
const { getProfile, updateProfile } = require("../controllers/userController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, upload.single("profile_pic"), updateProfile);

module.exports = router;