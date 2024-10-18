const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM checkedoutmusichistory";
  db.query(sql, (err, result) => {
    if (err) {
      return res
        .status(500)
        .send("Error getting checkedout music from database.");
    }
    res.json(result);
  });
});

router.post("/insertCheckOutMusic", (req, res) => {
  const { memberId, musicId, instanceId } = req.body;
  const checkmusicIdAndMemberId =
    "SELECT * FROM checkedoutmusichistory WHERE memberId = ? AND musicId = ? AND instanceId = ?";
  db.query(
    checkmusicIdAndMemberId,
    [memberId, musicId, instanceId],
    (checkErr, checkResult) => {
      if (checkErr) {
        return res
          .status(500)
          .send("Error checking memberId & musicId  & instanceId existence");
      }
      if (checkResult.length > 0) {
        return res.status(400).send("Music already checkedOut");
      }
      const insertSql =
        "INSERT INTO checkedoutmusichistory (memberId, musicId, instanceId, timeStampDue, timeStampCheckedOut) VALUES (?, ?, ?, NOW() + INTERVAL 2 WEEK, NOW())";
      db.query(insertSql, [memberId, musicId, instanceId], (err, result) => {
        if (err) {
          return res
            .status(500)
            .send("Error adding checkedout music to database");
        }
        res.status(201).send("Music checked out successfully");
      });
    }
  );
});
router.put("/updateCheckoutMusic=:id", (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE checkedoutmusichistory SET
      timeStampReturn = NOW()
      WHERE checkedOutMusicHistoryId = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send("Error updating in database");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("checkedoutmusic not found");
    }
    res.status(200).send(`Music returned successfully`);
  });
});

router.put("/deleteCheckOutMusic=:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM checkedoutmusichistory WHERE checkedOutMusicHistoryId = ?";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Error deleting checkout music");
    }
    res.status(200).send(`checked out music: ${id} successfully deleted`);
  });
});

module.exports = router;
