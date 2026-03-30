const db = require("../db");

const createWord = async (req, res) => {
  const { word, meaning } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!word || !meaning) {
    return res.status(400).json({ message: "Word and meaning are required" });
  }

  try {
    await db.promise().query(
      "INSERT INTO words (word, meaning, image) VALUES (?, ?, ?)",
      [word, meaning, image]
    );

    res.status(201).json({ message: "Word added successfully" });
  } catch (error) {
    console.error("Create word error:", error);
    res.status(500).json({ message: "Failed to add word" });
  }
};

const getWords = async (req, res) => {
  try {
    const [words] = await db.promise().query("SELECT * FROM words ORDER BY id DESC");
    res.json(words);
  } catch (error) {
    console.error("Get words error:", error);
    res.status(500).json({ message: "Failed to fetch words" });
  }
};

const getWordById = async (req, res) => {
  const { id } = req.params;

  try {
    const [words] = await db.promise().query(
      "SELECT * FROM words WHERE id = ?",
      [id]
    );

    if (words.length === 0) {
      return res.status(404).json({ message: "Word not found" });
    }

    res.json(words[0]);
  } catch (error) {
    console.error("Get word by ID error:", error);
    res.status(500).json({ message: "Failed to fetch word" });
  }
};

const updateWord = async (req, res) => {
  const { id } = req.params;
  const { word, meaning } = req.body;
  const newImage = req.file ? req.file.filename : null;

  try {
    const [words] = await db.promise().query(
      "SELECT * FROM words WHERE id = ?",
      [id]
    );

    if (words.length === 0) {
      return res.status(404).json({ message: "Word not found" });
    }

    const currentWord = words[0];

    const updatedWord = word || currentWord.word;
    const updatedMeaning = meaning || currentWord.meaning;
    const updatedImage = newImage || currentWord.image;

    await db.promise().query(
      "UPDATE words SET word = ?, meaning = ?, image = ? WHERE id = ?",
      [updatedWord, updatedMeaning, updatedImage, id]
    );

    res.json({ message: "Word updated successfully" });
  } catch (error) {
    console.error("Update word error:", error);
    res.status(500).json({ message: "Failed to update word" });
  }
};

const deleteWord = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.promise().query(
      "DELETE FROM words WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Word not found" });
    }

    res.json({ message: "Word deleted successfully" });
  } catch (error) {
    console.error("Delete word error:", error);
    res.status(500).json({ message: "Failed to delete word" });
  }
};

module.exports = {
  createWord,
  getWords,
  getWordById,
  updateWord,
  deleteWord
};