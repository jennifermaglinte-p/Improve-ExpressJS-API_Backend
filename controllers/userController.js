const db = require("../db");

const getProfile = async (req, res) => {
  try {
    const [users] = await db.promise().query(
      "SELECT id, name, email, profile_pic FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const profilePic = req.file ? req.file.filename : null;

  try {
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = users[0];

    const updatedName = name || currentUser.name;
    const updatedEmail = email || currentUser.email;
    const updatedProfilePic = profilePic || currentUser.profile_pic;

    await db.promise().query(
      "UPDATE users SET name = ?, email = ?, profile_pic = ? WHERE id = ?",
      [updatedName, updatedEmail, updatedProfilePic, req.user.id]
    );

    res.json({
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

module.exports = {
  getProfile,
  updateProfile
};