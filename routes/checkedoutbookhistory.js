const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all checked-out books
router.get("/", (req, res) => {
  const sql = "SELECT * FROM checkedoutbookhistory";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching checked-out books:", err);
      return res
        .status(500)
        .send("Error getting checked-out books from the database.");
    }

    if (result.length === 0) {
      return res.status(404).send("No checked-out books found.");
    }

    res.status(200).json(result);
  });
});

router.get("/:id", (req, res) => {
  const memberId = req.params.id;
  const sql = "SELECT * FROM checkedoutbookhistory WHERE memberId = ?";
  db.query(sql, [memberId], (err, result) => {
    if (err) {
      console.error("Error fetching checked-out books:", err);
      return res
        .status(500)
        .send("Error getting checked-out books from the database.");
    }

    if (result.length === 0) {
      return res.status(404).send("No checked-out books found.");
    }

    res.status(200).json(result);
  });
});

// Insert a new checked-out book entry
router.post("/insertCheckOutBook", (req, res) => {
  const { memberId, bookId, instanceId } = req.body;
  if (!memberId || !bookId || !instanceId) {
    return res.status(400).json({ message: "Invalid request." });
  }
  const checkSql =
    "SELECT * FROM checkedoutbookhistory WHERE memberId = ? AND bookId = ? AND instanceId = ? AND timeStampReturn = ? ";
  db.query(checkSql, [memberId, bookId, instanceId, null], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking existing checkout:", checkErr);
      return res.status(500).send("Error checking existing checkout.");
    }

    if (checkResult.length > 0) {
      return res.status(400).send("This book is already checked out.");
    }

    const insertSql = `
      INSERT INTO checkedoutbookhistory 
      (memberId, bookId, instanceId, timeStampDue, timeStampCheckedOut) 
      VALUES (?, ?, ?, NOW() + INTERVAL 2 WEEK, NOW())`;

    db.query(insertSql, [memberId, bookId, instanceId], (err) => {
      if (err) {
        console.error("Error adding checked-out book:", err);
        return res.status(500).send("Error adding checked-out book.");
      }
      res.status(201).send("Book checked out successfully.");
    });
  });
});

// Mark a book as returned by updating the return timestamp
router.put("/updateCheckOutBook/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE checkedoutbookhistory 
    SET timeStampReturn = NOW() 
    WHERE checkedOutBookHistoryId = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error updating return timestamp:", err);
      return res.status(500).send("Error updating the return timestamp.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Checked-out book not found.");
    }

    res.status(200).send("Book returned successfully.");
  });
});

// Delete a checked-out book entry
router.delete("/deleteCheckOutBook/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM checkedoutbookhistory WHERE checkedOutBookHistoryId = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting checked-out book:", err);
      return res.status(500).send("Error deleting the checked-out book.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Checked-out book not found.");
    }

    res.status(200).send(`Checked-out book ${id} successfully deleted.`);
  });
});

module.exports = router;
