const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM music";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Error getting music from database.");
    }
    res.json(result);
  });
});

router.post("/createMusic", (req, res) => {
  const {
    musicGenre,
    artist,
    dateReleased,
    count,
    albumName,
    monetaryValue,
    availabilityStatus,
    lastUpdatedBy,
    imgUrl,
  } = req.body;

  const checkAlbumAndArtistSql =
    "SELECT * FROM music WHERE artist = ? AND albumName = ?";
  db.query(checkAlbumAndArtistSql, [artist, albumName], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr.message);
      return res.status(500).send("Error checking album/artist in db");
    }

    if (checkResult.length > 0) {
      return res.status(400).send("Music already exists");
    }

    const insertSql = `INSERT INTO music (musicGenre,
      artist,
      dateReleased,
      count,
      albumName,
      monetaryValue,
      availabilityStatus,
      lastUpdatedBy,
      imgUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(insertSql, [
      musicGenre,
      artist,
      dateReleased,
      count,
      albumName,
      monetaryValue,
      availabilityStatus,
      lastUpdatedBy,
      imgUrl,
    ], (err, result) => {
      if (err) {
        return res.status(500).send("Database Error:" + err.message);
      }

      // Create instances based on count
      const insertInstanceSql = "INSERT INTO musicinstance (musicId, checkedOutStatus, isMissing) VALUES (?, ?, ?)";
      const promises = [];
      for (let i = 0; i < count; i++) {
        promises.push(new Promise((resolve, reject) => {
          db.query(insertInstanceSql, [result.insertId, false, false], (instanceErr) => {
            if (instanceErr) reject(instanceErr);
            else resolve();
          });
        }));
      }

      Promise.all(promises)
        .then(() => res.status(201).send("Music and instances added successfully"))
        .catch((instanceErr) => res.status(500).send("Error creating instances: " + instanceErr.message));
    });
  });
});

router.put("/updateMusic=:id", (req, res) => {
  const { id } = req.params;
  const {
    musicGenre,
    artist,
    dateReleased,
    count,
    albumName,
    monetaryValue,
    availabilityStatus,
    lastUpdatedBy,
    imgUrl,
  } = req.body;

  // Step 1: Get the current count of instances
  const getCurrentCountSql = "SELECT count FROM music WHERE musicId = ?";
  db.query(getCurrentCountSql, [id], (err, result) => {
    if (err) {
      console.error("Error fetching current music count: " + err.message);
      return res.status(500).send("Error fetching current music count");
    }

    const currentCount = result[0].count;

    // Step 2: Update the music record
    const updateSql = `UPDATE music SET
      musicGenre = ?,
      artist = ?,
      dateReleased = ?,
      count = ?,
      albumName = ?,
      monetaryValue = ?,
      availabilityStatus = ?,
      lastUpdatedBy = ?,
      imgUrl = ? 
      WHERE musicId = ?`;

    db.query(updateSql, [
      musicGenre,
      artist,
      dateReleased,
      count,
      albumName,
      monetaryValue,
      availabilityStatus,
      lastUpdatedBy,
      imgUrl,
      id,
    ], (err, updateResult) => {
      if (err) {
        console.error("Error updating music: " + err.message);
        return res.status(500).send("Error updating music in database");
      }

      if (updateResult.affectedRows === 0) {
        return res.status(404).send("Music not found");
      }

      // Step 3: Handle instances based on the updated count
      if (currentCount < count) {
        // Add new instances
        const instancesToAdd = count - currentCount;
        const insertInstanceSql = "INSERT INTO musicinstance (musicId, checkedOutStatus) VALUES (?, ?)";
        
        const promises = [];
        for (let i = 0; i < instancesToAdd; i++) {
          promises.push(new Promise((resolve, reject) => {
            db.query(insertInstanceSql, [id, false], (instanceErr) => {
              if (instanceErr) reject(instanceErr);
              else resolve();
            });
          }));
        }

        Promise.all(promises)
          .then(() => res.status(200).send(`Music: ${id} successfully updated, added ${instancesToAdd} new instances`))
          .catch((instanceErr) => res.status(500).send("Error creating instances: " + instanceErr.message));
      } else if (currentCount > count) {
        // Remove instances if count decreased
        const instancesToRemove = currentCount - count;
        const deleteInstanceSql = `
          DELETE FROM musicinstance 
          WHERE musicId = ? AND checkedOutStatus = false 
          ORDER BY instanceId DESC LIMIT ?`;

        db.query(deleteInstanceSql, [id, instancesToRemove], (err) => {
          if (err) {
            return res.status(500).send("Error deleting instances: " + err.message);
          }
          res.status(200).send(`Music: ${id} successfully updated, removed ${instancesToRemove} instances`);
        });
      } else {
        // If count hasn't changed
        res.status(200).send(`Music: ${id} successfully updated`);
      }
    });
  });
});


router.delete("/deleteMusic=:id", (req, res) => {
  const sql = "DELETE FROM music WHERE musicId = ?";
  const id = req.params.id;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Error deleting book: ", err.message);
      return res.status(500).send("Error deleting music");
    }
    res.status(200).send(`Music ${id} successfully deleted`);
  });
});
module.exports = router;
