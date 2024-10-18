const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM librarycard";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Error getting librarycards from database.");
    }
    res.json(result);
  });
});

router.post("/createLibraryCard", (req, res) => {
  const { memberId } = req.body;
  const checkSql = "SELECT * FROM librarycard WHERE memberId = ?";
  db.query(checkSql, [memberId], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).send("Error checking library card existence");
    }
    if (checkResult.length > 0) {
      return res.status(400).send("Library Card already exists");
    }
    const insertSql = `INSERT INTO librarycard (memberId, status, dateIssued, dateExpired) 
                         VALUES (?, 1, NOW(), DATE_ADD(NOW(), INTERVAL 2 YEAR))`;
    db.query(insertSql, [memberId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Database Error: " + err.message);
      }
      res.status(201).send("Library card added successfully");
    });
  });
});

// router.put("/updateLibraryCard=:id", (req, res) => {
//     const { id }  = req.params;
//     const { status, dateExpired } = req.body;
//     const sql = 
// });

module.exports = router;
