const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all checked-out music entries
router.get("/", (req, res) => {
  const sql = "SELECT * FROM checkedoutmusichistory";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching checked-out music:", err);
      return res.status(500).send("Error retrieving music from the database.");
    }

    if (result.length === 0) {
      return res.status(404).send("No checked-out music records found.");
    }

    res.status(200).json(result);
  });
});

router.get("/:id", (req, res) => {
  const memberId = req.params.id;
  const sql = "SELECT * FROM checkedoutmusichistory WHERE memberId = ?";
  db.query(sql, [memberId], (err, result) => {
    if (err) {
      console.error("Error fetching checked-out music:", err);
      return res
        .status(500)
        .send("Error getting checked-out music from the database.");
    }
    const musicPromise = result.map((music) => {
      const albumNameSql = "SELECT albumName FROM music WHERE musicId = ?";
      return new Promise((resolve, reject) => {
        db.query(albumNameSql, [music.musicId], (err2, musicResult) => {
          if (err2) {
            console.error("Error retrieving music name:", err2);
            return reject("Error getting album name from db");
          }
          music.albumName = musicResult[0]?.albumName || "Unknown Title";
          resolve(music);
        });
      });
    });

    Promise.all(musicPromise)
      .then((results) => {
        res.status(200).json(results);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });
});

// Insert a new checked-out music entry
router.post("/insertCheckOutMusic", (req, res) => {
  const { memberId, musicId, instanceId, role } = req.body;
  if (!memberId || !musicId || !instanceId) {
    return res.status(400).json({ message: "Invalid request." });
  }

  const limitSql =
    "SELECT * FROM checkedoutmusichistory WHERE memberId = ? AND timeStampReturn IS NULL";
  db.query(limitSql, [memberId], (limitErr, limitRes) => {
    if (limitErr) {
      console.error("Error checking existing music checkout:", limitErr);
      return res.status(500).send("Error checking existing music checkout.");
    }

    if (role === "student" && limitRes.length > 1) {
      return res.status(400).send("Limit Exceeded");
    } else if (role === "faculty" && limitRes.length > 2) {
      return res.status(400).send("Limit Exceeded");
    }

    const checkSql =
      "SELECT * FROM checkedoutmusichistory WHERE memberId = ? AND musicId = ? AND instanceId = ? AND timeStampReturn IS NULL";
    db.query(checkSql, [memberId, musicId, instanceId], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking existing music checkout:", checkErr);
        return res.status(500).send("Error checking existing music checkout.");
      }

      if (checkResult.length > 0) {
        return res.status(400).send("This music item is already checked out.");
      }

      let insertSql = ``;
      if (role === "student") {
        insertSql = `
          INSERT INTO checkedoutmusichistory 
          (memberId, musicId, instanceId, timeStampDue, timeStampCheckedOut) 
          VALUES (?, ?, ?, NOW() + INTERVAL 1 WEEK, NOW())`;
      } else if (role === "faculty") {
        insertSql = `
          INSERT INTO checkedoutmusichistory 
          (memberId, musicId, instanceId, timeStampDue, timeStampCheckedOut) 
          VALUES (?, ?, ?, NOW() + INTERVAL 2 WEEK, NOW())`;
      }

      db.query(insertSql, [memberId, musicId, instanceId], (err) => {
        if (err) {
          console.error("Error inserting checked-out music:", err);
          return res.status(500).send("Error adding checked-out music.");
        }
        res.status(201).send("Music checked out successfully.");
      });
    });
  });
});

router.put("/updateCheckoutMusic/:id", (req, res) => {
  const { id } = req.params;

  // Query to get instanceId and musicId from checkedoutmusichistory
  const getMusicDetails = `
    SELECT instanceId, musicId
    FROM checkedoutmusichistory
    WHERE checkedOutMusicHistoryId = ?;
  `;

  db.query(getMusicDetails, [id], (err, rows) => {
    if (err) {
      console.error("Error retrieving music details:", err);
      return res.status(500).send("Error retrieving music details.");
    }

    if (rows.length === 0) {
      return res.status(404).send("Checked-out music record not found.");
    }

    const { instanceId, musicId } = rows[0];

    // Update checkedoutmusichistory to set the return timestamp
    const updateReturnTimestamp = `
      UPDATE checkedoutmusichistory
      SET timeStampReturn = NOW()
      WHERE checkedOutMusicHistoryId = ?;
    `;

    db.query(updateReturnTimestamp, [id], (err, result) => {
      if (err) {
        console.error("Error updating music return timestamp:", err);
        return res.status(500).send("Error updating the return timestamp.");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Checked-out music record not found.");
      }

      // Update musicinstance to set checkedOutStatus to FALSE
      const updateMusicInstance = `
        UPDATE musicinstance
        SET checkedOutStatus = FALSE
        WHERE instanceId = ?;
      `;

      db.query(updateMusicInstance, [instanceId], (err) => {
        if (err) {
          console.error("Error updating music instance:", err);
          return res.status(500).send("Error updating the music instance.");
        }

        // Update music to increment the count by 1
        const updateMusicCount = `
          UPDATE music
          SET count = count + 1
          WHERE musicId = ?;
        `;

        db.query(updateMusicCount, [musicId], (err) => {
          if (err) {
            console.error("Error updating music count:", err);
            return res.status(500).send("Error updating the music count.");
          }

          res.status(200).send("Music returned successfully.");
        });
      });
    });
  });
});


// Delete a checked-out music entry
router.delete("/deleteCheckOutMusic/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM checkedoutmusichistory WHERE checkedOutMusicHistoryId = ?";
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting checked-out music:", err);
      return res.status(500).send("Error deleting checked-out music.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Checked-out music record not found.");
    }

    res.status(200).send(`Checked-out music record ${id} deleted successfully.`);
  });
});

module.exports = router;
