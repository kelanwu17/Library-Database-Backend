const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM checkedoutbookhistory";
  db.query(sql, (err, result) => {
    if (err) {
      return res
        .status(500)
        .send("Error getting checkedout books from database.");
    }
    res.json(result);
  });
});

router.post("/insertCheckOutBook", (req, res) => {
  const { memberId, bookId, instanceId } = req.body;
  const checkBookIdAndMemberId =
    "SELECT * FROM checkedoutbookhistory WHERE memberId = ? AND bookId = ? AND instanceId = ?";
  db.query(
    checkBookIdAndMemberId,
    [memberId, bookId, instanceId],
    (checkErr, checkResult) => {
      if (checkErr) {
        return res
          .status(500)
          .send("Error checking memberId & bookId  & instanceId existence");
      }
      if (checkResult.length > 0) {
        return res.status(400).send("Book already checkedOut");
      }
      const insertSql =
        "INSERT INTO checkedoutbookhistory (memberId, bookId, instanceId, timeStampDue, timeStampCheckedOut) VALUES (?, ?, ?, NOW() + INTERVAL 2 WEEK, NOW())";
      db.query(insertSql, [memberId, bookId, instanceId], (err, result) => {
        if (err) {
          return res
            .status(500)
            .send("Error adding checkedoutbook to database");
        }
        res.status(201).send("Book checked out successfully");
      });
    }
  );
});

router.put("/updateCheckoutBook=:id", (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE checkedoutbookhistory SET
    timeStampReturn = NOW()
    WHERE checkedOutBookHistoryId = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send("Error updating in database");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("checkedoutbook not found");
    }
    res.status(200).send(`Book returned successfully`);
  })
});

router.put("/deleteCheckOutBook=:id", (req,res) => {
  const { id } = req.params;
  const sql = "DELETE FROM checkedoutbookhistory WHERE checkedOutMusicHistoryId = ?";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Error deleting checkout book");

    }
    res.status(200).send(`checked out book: ${id} successfully deleted`);

  })
})

module.exports = router;
