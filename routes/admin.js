const express = require("express");
const router = express.Router();
const db = require("../config/db");

const moment = require("moment");

//get all admins
router.get("/", (req, res) => {
  const sql = "SELECT * FROM admin";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Error getting members from database.");
    }
    res.json(result);
  });
});

//add new admin
router.post("/createAdmin", (req, res) => {
  const { userName, password, firstName, lastName, email, phone, DOB, roles } =
    req.body;
  const checkSql = "SELECT * FROM member WHERE email = ? AND userName = ?";
  db.query(checkSql, [email, userName], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).send("Error checking user existence");
    }

    if (checkResult.length > 0) {
      const existingUser = checkResult[0];
      if (existingUser.email === email) {
        return res.status(400).send("Email already in use");
      }
      if (existingUser.userName === userName) {
        return res.status(400).send("Username already in use");
      }
    }
    const currentTime = moment();
    const insertSql =
      "INSERT INTO admin (userName, password, firstName, lastName, email, phone, DOB, roles, activeAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(
      insertSql,
      [userName, password, firstName, lastName, email, phone, DOB, roles, true],
      (insertErr, insertResult) => {
        if (insertErr) {
          console.error(insertErr);
          return res.status(500).send("Error adding admin to database");
        }
        res.status(201).send("Admin added successfully");
      }
    );
  });
});

//alter admin
router.put("/updateAdmin=:id", (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, DOB, roles } = req.body;
  const sql = `UPDATE admin SET
    firstName = ?,
    lastName = ?,
    email = ?,
    phone = ?,
    DOB = ?,
    roles = ?,
    WHERE memberId = ?`;
  db.query(
    sql,
    [firstName, lastName, email, phone, DOB, roles, id],
    (err, result) => {
      if (err) {
        console.error("Error updating admin", err);
        return res.status(500).send("Error updating admin");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("User not found");
      }
      res.status(200).send(`Admin: ${id} successfully updated`);
    }
  );
});
//delete admin
router.delete("/deleteMember=:id", (req, res) => {
  const sql = "DELETE FROM admin WEHRE adminId = ?";
  const id = req.params.id;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting admin:", err);
      return res.status(500).send("Error deleting admin");
    }
    res.status(200).send(`Member: ${id} successfully deleted`);
  });
});

module.exports = router;
