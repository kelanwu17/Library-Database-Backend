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
    musicCount,
    albumName,
    monetaryValue,
    available,
    lastUpdatedBy,
    imgUrl,
  } = req.body;
  const checkAlbumAndArtistSql =
    "SELECT * FROM music WHERE artist = ? AND albumName = ?";
  db.query(
    checkAlbumAndArtistSql,
    [artist, albumName],
    (checkErr, checkResult) => {
      if (checkErr) {
        console.error(checkErr.message);
        return res.status(500).send("Error checking album/artist in db");
      }
      if (checkResult.legnth > 0) {
        return res.status(400).send("Music already exists");
      }
      const insertSql = `INSERT INTO music (musicGenre,
      artist,
      dateReleased,
      musicCount,
      albumName,
      monetaryValue,
      available,
      lastUpdatedBy,
      imgUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.query(
        insertSql,
        [
          musicGenre,
          artist,
          dateReleased,
          musicCount,
          albumName,
          monetaryValue,
          available,
          lastUpdatedBy,
          imgUrl,
        ],
        (err, result) => {
          if (err) {
            return res.status(500).send("Database Error:" + err.message);
          }
          res.status(201).send("Music added successfully");
        }
      );
    }
  );
});

router.put("/updateMusic=:id", (req, res) => {
  const { id } = req.params;
  const {
    musicGenre,
    artist,
    dateReleased,
    musicCount,
    albumName,
    monetaryValue,
    available,
    lastUpdatedBy,
    imgUrl,
  } = req.body;
  const sql = `UPDATE music SET
     musicGenre = ?,
          artist= ?,
          dateReleased= ?,
          musicCount= ?,
          albumName= ?,
          monetaryValue= ?,
          available= ?,
          lastUpdatedBy= ?,
          imgUrl= ? WHERE musicId = ?`;
  db.query(
    sql,
    [
      musicGenre,
      artist,
      dateReleased,
      musicCount,
      albumName,
      monetaryValue,
      available,
      lastUpdatedBy,
      imgUrl,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating music: " + err.message);
        return res.status(500).send("Error updating music in database");
      }
      if (result.affectRows === 0) {
        return res.status(404).send("Music not found");
      }
      res.status(200).send(`Music: ${id} successfully updated`);
    }
  );
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
