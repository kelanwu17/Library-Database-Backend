const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM checkedouttechhistory";
  db.query(sql, (err, result) => {
    if (err) {
      return res
        .status(500)
        .send("Error getting checkedout tech from database.");
    }
    res.json(result);
  });
});

router.post("/insertCheckOutTech", (req, res) => {
  const { memberId, techId, instanceId } = req.body;
  const checkTechIdAndMemberId =
    "SELECT * FROM checkedouttechhistory WHERE memberId = ? AND techId = ? AND instanceId = ?";
  db.query(
    checkTechIdAndMemberId,
    [memberId, techId, instanceId],
    (checkErr, checkResult) => {
      if (checkErr) {
        return res
          .status(500)
          .send("Error checking memberId & techId  & instanceId existence");
      }
      if (checkResult.length > 0) {
        return res.status(400).send("tech already checkedOut");
      }
      const insertSql =
        "INSERT INTO checkedouttechhistory (memberId, techId, instanceId, timeStampDue, timeStampCheckedOut) VALUES (?, ?, ?, NOW() + INTERVAL 2 WEEK, NOW())";
      db.query(insertSql, [memberId, techId, instanceId], (err, result) => {
        if (err) {
          return res
            .status(500)
            .send("Error adding checkedouttech to database");
        }
        res.status(201).send("tech checked out successfully");
      });
    }
  );
});

router.put("/updateCheckoutTech=:id", (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE checkedouttechhistory SET
      timeStampReturn = NOW()
      WHERE checkedOutTechHistoryId = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send("Error updating in database");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("checkedouttech not found");
    }
    res.status(200).send(`tech returned successfully`);
  });
});

router.put("/deleteCheckOutTech=:id", (req,res) => {
    const { id } = req.params;
    const sql = "DELETE FROM checkedouttechhistory WHERE checkedOutTechHistoryId = ?";
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).send("Error deleting checkout tech");
  
      }
      res.status(200).send(`checked out tech: ${id} successfully deleted`);
  
    })
  })

module.exports = router;
