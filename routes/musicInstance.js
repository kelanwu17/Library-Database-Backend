const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    const sql = "SELECT * FROM musicinstance";
  db.query(sql, (err, result) => {
    if (err) {
      return res
        .status(500)
        .send("Error getting music instances from database.");
    }
    res.json(result);
  });
});


module.exports = router;