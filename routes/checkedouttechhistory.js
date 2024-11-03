const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all checked-out tech items
router.get("/", (req, res) => {
  const sql = "SELECT * FROM checkedouttechhistory";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error retrieving tech history:", err);
      return res.status(500).send("Error retrieving tech items from database.");
    }

    if (result.length === 0) {
      return res.status(404).send("No checked-out tech records found.");
    }

    res.status(200).json(result);
  });
});

router.get("/:id", (req, res) => {
  const memberId = req.params.id;
  const sql = "SELECT * FROM checkedouttechhistory WHERE memberId = ?";
  db.query(sql, [memberId], (err, result) => {
    if (err) {
      console.error("Error fetching checked-out tech:", err);
      return res
        .status(500)
        .send("Error getting checked-out tech from the database.");
    }
    const techPromise = result.map((tech) => {
      const deviceNameSql = "SELECT deviceName FROM technology WHERE techId = ?";
      return new Promise((resolve, reject) => {
        db.query(deviceNameSql, [tech.techId], (err2, techResult) => {
          if (err2) {
            console.error("Error retrieving device name:", err2);
            return reject("Error getting device name from db");
          }
          tech.techId = techResult[0]?.deviceName || "Unknown Title";
          resolve(tech);
        });
      });
    });

    Promise.all(techPromise)
      .then((results) => {
        res.status(200).json(results);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });
});

// Insert a new checked-out tech item
router.post("/insertCheckOutTech", (req, res) => {
  const { memberId, techId, instanceId } = req.body;

  const checkSql =
    "SELECT * FROM checkedouttechhistory WHERE memberId = ? AND techId = ? AND instanceId = ? AND timeStampReturn = ?";

  db.query(checkSql, [memberId, techId, instanceId, null], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking tech item:", checkErr);
      return res.status(500).send("Error checking existing tech checkout.");
    }

    if (checkResult.length > 0) {
      return res.status(400).send("Tech item already checked out.");
    }

    const insertSql = `
      INSERT INTO checkedouttechhistory 
      (memberId, techId, instanceId, timeStampDue, timeStampCheckedOut) 
      VALUES (?, ?, ?, NOW() + INTERVAL 2 WEEK, NOW())`;

    db.query(insertSql, [memberId, techId, instanceId], (err) => {
      if (err) {
        console.error("Error inserting tech item:", err);
        return res.status(500).send("Error adding tech item to database.");
      }

      res.status(201).send("Tech item checked out successfully.");
    });
  });
});

// Mark tech item as returned by updating the return timestamp
router.put("/updateCheckoutTech/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE checkedouttechhistory 
    SET timeStampReturn = NOW() 
    WHERE checkedOutTechHistoryId = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error updating tech return timestamp:", err);
      return res.status(500).send("Error updating tech return.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Checked-out tech item not found.");
    }

    res.status(200).send("Tech item returned successfully.");
  });
});

// Delete a checked-out tech entry
router.delete("/deleteCheckOutTech/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM checkedouttechhistory WHERE checkedOutTechHistoryId = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting tech item:", err);
      return res.status(500).send("Error deleting tech item.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Checked-out tech item not found.");
    }

    res.status(200).send(`Tech item with ID ${id} deleted successfully.`);
  });
});

module.exports = router;
