const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createWord,
  getWords,
  getWordById,
  updateWord,
  deleteWord
} = require("../controllers/wordController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/", upload.single("image"), createWord);
router.get("/", getWords);
router.get("/:id", getWordById);
router.put("/:id", upload.single("image"), updateWord);
router.delete("/:id", deleteWord);

module.exports = router;