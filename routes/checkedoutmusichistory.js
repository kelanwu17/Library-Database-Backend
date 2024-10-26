const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all checked-out music entries
router.get("/", (req, res) => {
  const sql = "SELECT * FROM checkedoutmusichistory";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching checked-out music:", err);
      return res.status(500).send("Error retrieving music from the database.");
    }

    if (result.length === 0) {
      return res.status(404).send("No checked-out music records found.");
    }

    res.status(200).json(result);
  });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM checkedoutmusichistory WHERE memberId = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error fetching checked-out music:", err);
      return res.status(500).send("Error retrieving music from the database.");
    }

    if (result.length === 0) {
      return res.status(404).send("No checked-out music records found.");
    }

    res.status(200).json(result);
  });
});

// Insert a new checked-out music entry
router.post("/insertCheckOutMusic", (req, res) => {
  const { memberId, musicId, instanceId } = req.body;

  const checkSql =
    "SELECT * FROM checkedoutmusichistory WHERE memberId = ? AND musicId = ? AND instanceId = ? AND timeStampReturn = ?";
  
  db.query(checkSql, [memberId, musicId, instanceId, null], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking existing checkout:", checkErr);
      return res.status(500).send("Error checking for existing checkout.");
    }

    if (checkResult.length > 0) {
      return res.status(400).send("This music is already checked out.");
    }

    const insertSql = `
      INSERT INTO checkedoutmusichistory 
      (memberId, musicId, instanceId, timeStampDue, timeStampCheckedOut) 
      VALUES (?, ?, ?, NOW() + INTERVAL 2 WEEK, NOW())`;

    db.query(insertSql, [memberId, musicId, instanceId], (err) => {
      if (err) {
        console.error("Error inserting checked-out music:", err);
        return res.status(500).send("Error adding checked-out music.");
      }

      res.status(201).send("Music checked out successfully.");
    });
  });
});

// Mark music as returned by updating the return timestamp
router.put("/updateCheckoutMusic/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE checkedoutmusichistory 
    SET timeStampReturn = NOW() 
    WHERE checkedOutMusicHistoryId = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error updating return timestamp:", err);
      return res.status(500).send("Error updating return timestamp.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Checked-out music record not found.");
    }

    res.status(200).send("Music returned successfully.");
  });
});

// Delete a checked-out music entry
router.delete("/deleteCheckOutMusic/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM checkedoutmusichistory WHERE checkedOutMusicHistoryId = ?";
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting checked-out music:", err);
      return res.status(500).send("Error deleting checked-out music.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Checked-out music record not found.");
    }

    res.status(200).send(`Checked-out music record ${id} deleted successfully.`);
  });
});

module.exports = router;
