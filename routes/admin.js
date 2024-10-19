const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

// Get all admins
router.get("/", (req, res) => {
  const sql = "SELECT * FROM admin";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching admins:", err);
      return res.status(500).json({ message: "Error fetching admins from database." });
    }
    res.status(200).json(result);
  });
});

// Add new admin
router.post("/createAdmin", async (req, res) => {
  const { userName, password, firstName, lastName, email, phone, DOB, roles } = req.body;

  if (!userName || !password || !email) {
    return res.status(400).json({ message: "Username, password, and email are required." });
  }

  const checkSql = "SELECT * FROM member WHERE email = ? OR userName = ?";
  db.query(checkSql, [email, userName], async (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking user existence:", checkErr);
      return res.status(500).json({ message: "Error checking user existence." });
    }

    if (checkResult.length > 0) {
      return res.status(400).json({ message: "Email or Username already in use." });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertSql = `
        INSERT INTO admin (userName, password, firstName, lastName, email, phone, DOB, roles, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        insertSql,
        [userName, hashedPassword, firstName, lastName, email, phone, DOB, roles, true],
        (insertErr) => {
          if (insertErr) {
            console.error("Error adding admin:", insertErr);
            return res.status(500).json({ message: "Error adding admin to database." });
          }
          res.status(201).json({ message: "Admin added successfully." });
        }
      );
    } catch (error) {
      console.error("Error hashing password:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  });
});

// Update admin
router.put("/admin/:id", (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, DOB, roles } = req.body;

  const sql = `
    UPDATE admin SET
      firstName = ?, lastName = ?, email = ?, phone = ?, DOB = ?, roles = ?
    WHERE adminId = ?
  `;
  db.query(sql, [firstName, lastName, email, phone, DOB, roles, id], (err, result) => {
    if (err) {
      console.error("Error updating admin:", err);
      return res.status(500).json({ message: "Error updating admin." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Admin not found." });
    }
    res.status(200).json({ message: `Admin ${id} successfully updated.` });
  });
});

// Delete admin
router.delete("/admin/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM admin WHERE adminId = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting admin:", err);
      return res.status(500).json({ message: "Error deleting admin." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Admin not found." });
    }
    res.status(200).json({ message: `Admin ${id} successfully deleted.` });
  });
});

module.exports = router;
