const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM employeelog";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Error getting employee log from database.");
    }
    res.json(result);
  });
});

router.put("/updateEmployeeLog=:id", (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  const sql = `UPDATE employeelogid SET description = ? WHERE employeeLogId = ?`;
  db.query(sql, [description, id], (err, result) => {
    if (err) {
      return res.status(500).send("Error updating employee log from database.");
    }
    if (result.affectedRows === 0) {
        return res.status(404).send("Log not found");
      }
      res.status(200).send(`Log: ${id} successfully updated`);
  });
});

module.exports = router;
