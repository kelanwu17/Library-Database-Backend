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
          tech.deviceName = techResult[0]?.deviceName || "Unknown Title";
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
  const { memberId, techId, instanceId, role } = req.body;
  if (!memberId || !techId || !instanceId) {
    return res.status(400).json({ message: "Invalid request." });
  }

  const limitSql =
    "SELECT * FROM checkedouttechhistory WHERE memberId = ? AND timeStampReturn IS NULL";
  db.query(limitSql, [memberId], (limitErr, limitRes) => {
    if (limitErr) {
      console.error("Error checking existing tech checkout:", limitErr);
      return res.status(500).send("Error checking existing tech checkout.");
    }

    if (role === "student" && limitRes.length > 1) {
      return res.status(400).send("Limit Exceeded");
    } else if (role === "faculty" && limitRes.length > 2) {
      return res.status(400).send("Limit Exceeded");
    }

    const checkSql =
      "SELECT * FROM checkedouttechhistory WHERE memberId = ? AND techId = ? AND instanceId = ? AND timeStampReturn IS NULL";
    db.query(checkSql, [memberId, techId, instanceId], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking tech item:", checkErr);
        return res.status(500).send("Error checking existing tech checkout.");
      }

      if (checkResult.length > 0) {
        return res.status(400).send("This tech item is already checked out.");
      }

      let insertSql = ``;
      if (role === "student") {
        insertSql = `
          INSERT INTO checkedouttechhistory 
          (memberId, techId, instanceId, timeStampDue, timeStampCheckedOut) 
          VALUES (?, ?, ?, NOW() + INTERVAL 1 WEEK, NOW())`;
      } else if (role === "faculty") {
        insertSql = `
          INSERT INTO checkedouttechhistory 
          (memberId, techId, instanceId, timeStampDue, timeStampCheckedOut) 
          VALUES (?, ?, ?, NOW() + INTERVAL 2 WEEK, NOW())`;
      }

      db.query(insertSql, [memberId, techId, instanceId], (err) => {
        if (err) {
          console.error("Error inserting tech item:", err);
          return res.status(500).send("Error adding tech item to database.");
        }
        res.status(201).send("Tech item checked out successfully.");
      });
    });
  });
});

router.put("/updateCheckoutTech/:id", (req, res) => {
  const { id } = req.params;

  // Query to get instanceId and techId from checkedouttechhistory
  const getTechDetails = `
    SELECT instanceId, techId
    FROM checkedouttechhistory
    WHERE checkedOutTechHistoryId = ?;
  `;

  db.query(getTechDetails, [id], (err, rows) => {
    if (err) {
      console.error("Error retrieving tech details:", err);
      return res.status(500).send("Error retrieving tech details.");
    }

    if (rows.length === 0) {
      return res.status(404).send("Checked-out tech item not found.");
    }

    const { instanceId, techId } = rows[0];

    // Update checkedouttechhistory to set the return timestamp
    const updateReturnTimestamp = `
      UPDATE checkedouttechhistory
      SET timeStampReturn = NOW()
      WHERE checkedOutTechHistoryId = ?;
    `;

    db.query(updateReturnTimestamp, [id], (err, result) => {
      if (err) {
        console.error("Error updating tech return timestamp:", err);
        return res.status(500).send("Error updating the return timestamp.");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Checked-out tech item not found.");
      }

      // Update techinstance to set checkedOutStatus to FALSE
      const updateTechInstance = `
        UPDATE techinstance
        SET checkedOutStatus = FALSE
        WHERE instanceId = ?;
      `;

      db.query(updateTechInstance, [instanceId], (err) => {
        if (err) {
          console.error("Error updating tech instance:", err);
          return res.status(500).send("Error updating the tech instance.");
        }

        // Update technology to increment the count by 1
        const updateTechCount = `
          UPDATE technology
          SET count = count + 1
          WHERE techId = ?;
        `;

        db.query(updateTechCount, [techId], (err) => {
          if (err) {
            console.error("Error updating tech count:", err);
            return res.status(500).send("Error updating the tech count.");
          }

          res.status(200).send("Tech item returned successfully.");
        });
      });
    });
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
