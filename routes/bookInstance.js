const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    const sql = "SELECT * FROM bookinstance";
  db.query(sql, (err, result) => {
    if (err) {
      return res
        .status(500)
        .send("Error getting book instances from database.");
    }
    res.json(result);
  });
});


module.exports = router;