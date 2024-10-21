const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all event signups
router.get("/", (req, res) => {
  const sql = "SELECT * FROM eventsignup";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error retrieving event signups:", err);
      return res.status(500).json({error:"Error getting members from database."});
    }
    res.status(200).json(result);
  });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM eventsignup WHERE eventId = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error retrieving event signups:", err);
      return res.status(500).json({error:"Error getting members from database."});
    }
    res.status(200).json(result);
  });
});

// Insert a new event signup
router.post("/insertEventSignUp", (req, res) => {
  const { memberId, eventId } = req.body;
  const checkAlreadySignUp =
    "SELECT * FROM eventsignup WHERE memberId = ? AND eventId = ?";
  
  db.query(checkAlreadySignUp, [memberId, eventId], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking event signup existence:", checkErr);
      return res.status(500).send("Error checking event signup existence");
    }
    
    if (checkResult.length > 0) {
      return res.status(400).send("Member already signed up");
    }

    const insertSql =
      "INSERT INTO eventsignup (memberId, eventId, timeEnrolled, checkIn) VALUES (?, ?, NOW(), false)";
    
    db.query(insertSql, [memberId, eventId], (err, result) => {
      if (err) {
        console.error("Error inserting event signup:", err);
        return res.status(500).send("Error inserting event signup");
      }
      res.status(201).send("User successfully signed up");
    });
  });
});

// Edit an event signup by ID
router.put("/editEventSignUp/:id", (req, res) => {
  const { id } = req.params;
  const { checkIn } = req.body;
  
  const sql = `UPDATE eventsignup SET checkIn = ? WHERE eventSignUpId = ?`;
  
  db.query(sql, [checkIn, id], (err, result) => {
    if (err) {
      console.error("Error updating event signup:", err);
      return res.status(500).send("Error updating event signup");
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).send("Event signup not found");
    }
    
    res.status(200).send("Checked In Successfully");
  });
});

// Delete an event signup by ID
router.delete("/deleteMember/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM eventsignup WHERE eventSignUpId = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting event signup:", err);
      return res.status(500).send("Error deleting event signup");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Event signup not found");
    }

    res.status(200).send("Event sign up was deleted");
  });
});

module.exports = router;
