const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [existingUser] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await db.promise().query(
      "INSERT INTO users (name, email, password, verification_token, is_verified) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, verificationToken, 0]
    );

    res.status(201).json({
      message: "Registered successfully"
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

const verifyUser = async (req, res) => {
  const { token } = req.params;

  try {
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE verification_token = ?",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).send("Invalid verification token");
    }

    await db.promise().query(
      "UPDATE users SET is_verified = 1, verification_token = NULL WHERE verification_token = ?",
      [token]
    );

    res.send("Email verified successfully. You can now log in.");
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).send("Verification failed");
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_pic: user.profile_pic
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

module.exports = {
  registerUser,
  verifyUser,
  loginUser
};