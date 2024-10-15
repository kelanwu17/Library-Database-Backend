const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM fines";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Error getting fines from database.");
    }
    res.json(result);
  });
});

router.post("/createFine", (req, res) => {
    const { itemId, itemType, memberId, fineAmount } = req.body;
  
    const checkItemIdAndType =
      "SELECT * FROM fines WHERE itemId = ? AND itemType = ?";
    
    db.query(checkItemIdAndType, [itemId, itemType], (checkErr, checkResult) => {
      if (checkErr) {
        return res.status(500).send("Error checking itemId & itemType existence");
      }
  
      if (checkResult.length > 0) {
        return res.status(400).send("Item already exists");
      }
  
      const insertSql = `
        INSERT INTO fines (itemId, itemType, memberId, fineAmount) 
        VALUES (?, ?, ?, ?)
      `;
  
      db.query(insertSql, [itemId, itemType, memberId, fineAmount], (err) => {
        if (err) {
          return res.status(500).send("Database Error: " + err.message);
        }
        res.status(201).send("Fine added successfully");
      });
    });
  });
  

router.put("/updateFine=:id", (req,res) => {
    const { id } = req.params;
    const { fineAmount } = req.body;
    const sql = `UPDATE fines SET fineAmount = ? WHERE finesId = ?`;
    db.query(sql, [fineAmount, id], (err, result) => {
        if (err) {
            console.error("Error updating fine: " + err.message);
            return res.status(500).send("Error updating fine in database");
        }
        if (result.affectedRows === 0) {
            return res.status(404).send("Fine not found");
        }
        res.status(200).send(`Fine id: ${id} successfully updated`);
    });
});

router.delete("/deleteFine=:id", (req,res)=>{
    const sql = "DELETE FROM fines WHERE finesId = ?";
    const { id } = req.params;
  
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error deleting fine: ", err.message);
        return res.status(500).send("Error deleting fine");
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).send(`Fine with ID: ${id} not found`);
      }
  
      res.status(200).send(`Fine ID: ${id} successfully deleted`);
    });
  });


module.exports = router;
