const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM technology";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Error getting technologies from database.");
    }
    res.json(result);
  });
});

router.post("/createTechnology", (req, res) => {
  const {
    deviceName,
    modelNumber,
    techCount,
    availabilityStatus,
    monetaryValue,
    lastUpdatedBy,
    imgUrl,
  } = req.body;

  // Check if the model number already exists
  const checkModelNumberSql = "SELECT * FROM technology WHERE modelNumber = ?";
  db.query(checkModelNumberSql, [modelNumber], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking model number existence:", checkErr);
      return res.status(500).send("Error checking model number existence");
    }

    if (checkResult.length > 0) {
      return res.status(400).send("Model number already exists");
    }

    const insertSql = `
        INSERT INTO technology (
          deviceName,
          modelNumber,
          techCount,
          availabilityStatus,
          monetaryValue,
          lastUpdatedBy,
          imgUrl
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

    db.query(
      insertSql,
      [
        deviceName,
        modelNumber,
        techCount,
        availabilityStatus,
        monetaryValue,
        lastUpdatedBy,
        imgUrl,
      ],
      (err, result) => {
        if (err) {
          console.error("Database Error:", err.message);
          return res.status(500).send("Database Error: " + err.message);
        }
        res.status(201).send("Technology added successfully");
      }
    );
  });
});

router.put("/updateTechnology=:id", (req, res) => {
  const { id } = req.params;
  const {
    deviceName,
    modelNumber,
    techCount,
    availabilityStatus,
    monetaryValue,
    lastUpdatedBy,
    imgUrl,
  } = req.body;
  const sql = `UPDATE technology SET 
    deviceName = ?,
          modelNumber = ?,
          techCount = ?,
          availabilityStatus = ?,
          monetaryValue = ?,
          lastUpdatedBy = ?,
          imgUrl = ? WHERE techId = ?`;
  db.query(
    sql,
    [
      deviceName,
      modelNumber,
      techCount,
      availabilityStatus,
      monetaryValue,
      lastUpdatedBy,
      imgUrl,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating technology: " + err.message);
        return res.status(500).send("Error updating technology in database");
      }
      if (result.affectRows === 0) {
        return res.status(404).send("Technology not found");
      }
      res.status(200).send(`Technology: ${id} successfully updated`);
    }
  );
});

router.delete("/deleteTechnology=:id", (req, res) => {
  const sql = "DELETE FROM technology WHERE techId = ?";
  const id = req.params.id;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Error deleting book: ", err.message);
      return res.status(500).send("Error deleting book");
    }
    res.status(200).send(`Book ${id} successfully deleted`);
  });
});

module.exports = router;
