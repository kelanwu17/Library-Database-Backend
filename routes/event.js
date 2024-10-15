const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM event";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Error getting events from database.");
    }
    res.json(result);
  });
});

router.post("/createEvent", (req, res) => {
  const {
    title,
    location,
    ageGroup,
    category,
    eventCreator,
    eventHolder,
    timeDate,
  } = req.body;

  const checkEventTitle = "SELECT * FROM event WHERE title = ?";
  const insertSql = `
      INSERT INTO event (title, location, ageGroup, category, eventCreator, eventHolder, timeDate) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  // Check if the event title already exists
  db.query(checkEventTitle, [title], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking event title:", checkErr);
      return res
        .status(500)
        .json({ error: "Database error checking event title" });
    }

    if (checkResult.length > 0) {
      return res.status(400).json({ error: "Event title already exists" });
    }

    // Insert the new event
    db.query(
      insertSql,
      [
        title,
        location,
        ageGroup,
        category,
        eventCreator,
        eventHolder,
        timeDate,
      ],
      (err, result) => {
        if (err) {
          console.error("Database error during event insertion:", err);
          return res
            .status(500)
            .json({ error: "Database error creating event" });
        }

        res
          .status(201)
          .json({
            message: "Event created successfully",
            eventId: result.insertId,
          });
      }
    );
  });
});

router.put("/updateEvent=:id", (req, res) => {
  const { id } = req.params;
  const {
    title,
    location,
    ageGroup,
    category,
    eventCreator,
    eventHolder,
    timeDate,
  } = req.body;
  const sql = `UPDATE event SET
        title = ?,
        location = ?,
        ageGroup = ?,
        category = ?,
        eventCreator = ?,
        eventHolder = ?,
        timeDate = ? WHERE eventId = ?`;
  db.query(
    sql,
    [
      title,
      location,
      ageGroup,
      category,
      eventCreator,
      eventHolder,
      timeDate,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating event: " + err.message);
        return res.status(500).send("Error updating event in database");
      }
      if (result.affectRows === 0) {
        return res.status(404).send("Event not found");
      }
      res.status(200).send(`Event: ${id} successfully updated`);
    }
  );
});

router.delete("/deleteEvent/:id", (req, res) => {
  const sql = "DELETE FROM event WHERE eventId = ?";
  const id = req.params.id;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting event:", err.message);
      return res.status(500).json({ error: "Error deleting event" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `Event with ID ${id} not found` });
    }

    res.status(200).json({ message: `Event ${id} successfully deleted` });
  });
});

module.exports = router;
