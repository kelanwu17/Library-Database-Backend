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
    count,
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
          count,
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
        count,
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

        // Create instances based on count
        for (let i = 0; i < count; i++) {
          const instanceInsertSql = `
            INSERT INTO technologyInstance (techId, isMissing, checkedOutStatus)
            VALUES (?, ?, ?)
          `;
          db.query(
            instanceInsertSql,
            [result.insertId, false, false], // false for isMissing and checkedOutStatus
            (instanceErr) => {
              if (instanceErr) {
                console.error("Error creating instance:", instanceErr);
                return res.status(500).send("Error creating technology instances");
              }
            }
          );
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
    count,
    availabilityStatus,
    monetaryValue,
    lastUpdatedBy,
    imgUrl,
  } = req.body;

  // First, get the current count of instances for the technology
  const getCountSql = "SELECT count FROM technology WHERE techId = ?";
  db.query(getCountSql, [id], (getCountErr, getCountResult) => {
    if (getCountErr) {
      console.error("Error retrieving current count: " + getCountErr.message);
      return res.status(500).send("Error retrieving count");
    }

    if (getCountResult.length === 0) {
      return res.status(404).send("Technology not found");
    }

    const currentcount = getCountResult[0].count;

    // Update technology
    const updateSql = `UPDATE technology SET 
      deviceName = ?,
      modelNumber = ?,
      count = ?,
      availabilityStatus = ?,
      monetaryValue = ?,
      lastUpdatedBy = ?,
      imgUrl = ? WHERE techId = ?`;

    db.query(
      updateSql,
      [
        deviceName,
        modelNumber,
        count,
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
        if (result.affectedRows === 0) {
          return res.status(404).send("Technology not found");
        }

        // Adjust instances if the count has changed
        if (count !== currentcount) {
          if (count > currentcount) {
            // Need to add instances
            const instancesToAdd = count - currentcount;
            for (let i = 0; i < instancesToAdd; i++) {
              const instanceInsertSql = `
                INSERT INTO technologyInstance (techId, isMissing, checkedOutStatus)
                VALUES (?, ?, ?)
              `;
              db.query(
                instanceInsertSql,
                [id, false, false], // false for isMissing and checkedOutStatus
                (instanceErr) => {
                  if (instanceErr) {
                    console.error("Error creating instance:", instanceErr);
                    return res.status(500).send("Error creating technology instances");
                  }
                }
              );
            }
          } else {
            // Need to remove excess instances
            const instancesToRemove = currentcount - count;
            const removeSql = `
              DELETE FROM technologyInstance 
              WHERE techId = ? 
              ORDER BY instanceId 
              LIMIT ?
            `;
            db.query(removeSql, [id, instancesToRemove], (removeErr) => {
              if (removeErr) {
                console.error("Error removing instances:", removeErr);
                return res.status(500).send("Error removing technology instances");
              }
            });
          }
        }

        res.status(200).send(`Technology: ${id} successfully updated`);
      }
    );
  });
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
