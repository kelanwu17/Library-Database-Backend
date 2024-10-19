const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all reservations
router.get("/", (req, res) => {
  const sql = "SELECT * FROM reserve";
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error getting reserves from database:", err);
      return res.status(500).send("Error getting reserves from database.");
    }
    res.status(200).json(result);
  });
});

// Create a new reservation
router.post("/createReserve", (req, res) => {
  const { itemId, itemType, memberId, isActive } = req.body;

  const checkItemIdAndType = "SELECT * FROM reserve WHERE itemId = ? AND itemType = ?";
  
  db.query(checkItemIdAndType, [itemId, itemType], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking itemId and itemType existence:", checkErr);
      return res.status(500).send("Error checking itemId & itemType existence");
    }

    if (checkResult.length > 0) {
      return res.status(400).send("Item already reserved");
    }

    const insertSql = ` 
      INSERT INTO reserve (itemId, itemType, memberId, isActive) 
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertSql, [itemId, itemType, memberId, isActive], (err) => {
      if (err) {
        console.error("Database Error while creating reservation:", err);
        return res.status(500).send("Database Error: " + err.message);
      }
      res.status(201).send("Reserved successfully");
    });
  });
});

// Uncomment this section when needed
/*
router.put("/updateFine=:id", (req, res) => {
  const { id } = req.params;
  const { fineAmount } = req.body;
  
  const sql = `UPDATE reserve SET fineAmount = ? WHERE finesId = ?`;
  db.query(sql, [fineAmount, id], (err, result) => {
    if (err) {
      console.error("Error updating fine:", err.message);
      return res.status(500).send("Error updating fine in database");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Fine not found");
    }
    res.status(200).send(`Fine ID: ${id} successfully updated`);
  });
});
*/

// Delete a reservation
router.delete("/deleteFine/:id", (req, res) => {
  const sql = "DELETE FROM reserve WHERE reserveId = ?";
  const { id } = req.params;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting reserve:", err.message);
      return res.status(500).send("Error deleting reserve");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send(`Reserve with ID: ${id} not found`);
    }

    res.status(200).send(`Reserve ID: ${id} successfully deleted`);
  });
});

module.exports = router;
