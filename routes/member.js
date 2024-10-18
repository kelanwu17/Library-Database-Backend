const express = require("express");
const router = express.Router();
const db = require("../config/db");

const moment = require("moment");

//get all members
router.get("/", (req, res) => {
  const sql = "SELECT * FROM member";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Error getting members from database.");
    }
    res.json(result);
  });
});

//add new member
router.post("/createMember", (req, res) => {
  const {
    username,
    password,
    firstName,
    lastName,
    email,
    phone,
    DOB,
    preferences,
  } = req.body;

  const currentTime = moment();

  // First, check for existing email or username
  const checkSql = "SELECT * FROM member WHERE email = ? OR username = ?";
  db.query(checkSql, [email, username], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).send("Error checking user existence");
    }

    if (checkResult.length > 0) {
      const existingUser = checkResult[0];
      if (existingUser.email === email) {
        return res.status(400).send("Email already in use");
      }
      if (existingUser.username === username) {
        return res.status(400).send("Username already in use");
      }
    }
    const insertSql =
      "INSERT INTO member (username, password, firstName, lastName, email, phone, DOB, preferences, createdAt, updatedAt, accountStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)";

    db.query(
      insertSql,
      [
        username,
        password,
        firstName,
        lastName,
        email,
        phone,
        DOB,
        preferences,
        true,
      ],
      (insertErr, insertResult) => {
        if (insertErr) {
          console.error(insertErr);
          return res.status(500).send("Error adding user to database");
        }
        res.status(201).send("User added successfully");
      }
    );
  });
});

//alter member
router.put("/updateMember=:id", (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    email,
    phone,
    DOB,
    preferences,
  } = req.body;

  const sql = `UPDATE member SET 
    firstName = ?, 
    lastName = ?, 
    email = ?, 
    phone = ?, 
    DOB = ?, 
    preferences = ? 
    WHERE memberId = ?`;
  db.query(
    sql,
    [
      firstName,
      lastName,
      email,
      phone,
      DOB,
      preferences,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).send("Error updating user in database");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("User not found");
      }
      res.status(200).send(`User: ${id} successfully updated`);
    }
  );
});

//delete member from database
router.delete("/deleteMember=:id", (req, res) => {
  const sql = "DELETE FROM member WHERE memberId = ?";
  const id = req.params.id;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting member:", err);
      return res.status(500).send("Error deleting member");
    }
    res.status(200).send(`Member: ${id} successfully deleted`);
  });
});

module.exports = router;
