const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { checkedOutMail } = require("../mailer/mailer");

// Get all checked-out books
router.get("/", (req, res) => {
  const sql = "SELECT * FROM checkedoutbookhistory";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching checked-out books:", err);
      return res
        .status(500)
        .send("Error getting checked-out books from the database.");
    }

    if (result.length === 0) {
      return res.status(404).send("No checked-out books found.");
    }

    res.status(200).json(result);
  });
});
router.get("/allInfo", (req, res) => {
  const sql = `
    SELECT 
      CheckedOutBookHistory.*,
      Books.title AS bookTitle,
      Books.genre AS bookGenre,
      Member.username AS memberUsername
    FROM 
      CheckedOutBookHistory
    JOIN 
      Books ON CheckedOutBookHistory.bookId = Books.bookId
    JOIN 
      Member ON CheckedOutBookHistory.memberId = Member.memberId
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching checked-out books:", err);
      return res
        .status(500)
        .send("Error getting checked-out books from the database.");
    }

    if (result.length === 0) {
      return res.status(404).send("No checked-out books found.");
    }

    res.status(200).json(result);
  });
});

router.get("/:id", (req, res) => {
  const memberId = req.params.id;
  const sql = "SELECT * FROM checkedoutbookhistory WHERE memberId = ?";
  db.query(sql, [memberId], (err, result) => {
    if (err) {
      console.error("Error fetching checked-out books:", err);
      return res
        .status(500)
        .send("Error getting checked-out books from the database.");
    }
    const bookPromise = result.map((book) => {
      const bookNameSql = "SELECT title FROM books WHERE bookId = ?";
      return new Promise((resolve, reject) => {
        db.query(bookNameSql, [book.bookId], (err2, bookResult) => {
          if (err2) {
            console.error("Error retrieving book name:", err2);
            return reject("Error getting book names from db");
          }
          book.bookTitle = bookResult[0]?.title || "Unknown Title";
          resolve(book);
        });
      });
    });

    Promise.all(bookPromise)
      .then((results) => {
        res.status(200).json(results);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });
});

// Insert a new checked-out book entry
router.post("/insertCheckOutBook", (req, res) => {
  const { memberId, bookId, instanceId, role } = req.body;
  if (!memberId || !bookId || !instanceId) {
    return res.status(400).json({ message: "Invalid request." });
  }

  const limitSql = "SELECT * FROM checkedoutbookhistory WHERE memberId = ? AND timeStampReturn IS NULL";
  db.query(limitSql, [memberId], (limitErr, limitRes) => {
    if (limitErr) {
      console.error("Error checking existing checkout:", limitErr);
      return res.status(500).send("Error checking existing checkout.");
    }

    if (role === "student" && limitRes.length > 1) {
      return res.status(400).send("Limit Exceeded");
    } else if (role === "faculty" && limitRes.length > 2) {
      return res.status(400).send("Limit Exceeded");
    }

    const checkSql =
      "SELECT * FROM checkedoutbookhistory WHERE memberId = ? AND bookId = ? AND instanceId = ? AND timeStampReturn IS NULL";
    db.query(checkSql, [memberId, bookId, instanceId], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking existing checkout:", checkErr);
        return res.status(500).send("Error checking existing checkout.");
      }

      if (checkResult.length > 0) {
        return res.status(400).send("This book is already checked out.");
      }

      const insertSql = `
        INSERT INTO checkedoutbookhistory 
        (memberId, bookId, instanceId, timeStampDue, timeStampCheckedOut) 
        VALUES (?, ?, ?, NOW() + INTERVAL 2 WEEK, NOW())`;

      db.query(insertSql, [memberId, bookId, instanceId], (err) => {
        if (err) {
          console.error("Error adding checked-out book:", err);
          return res.status(500).send("Error adding checked-out book.");
        }
        res.status(201).send("Book checked out successfully.");
      });
    });
  });
});


// Mark a book as returned by updating the return timestamp
router.put("/updateCheckOutBook/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE checkedoutbookhistory 
    SET timeStampReturn = NOW() 
    WHERE checkedOutBookHistoryId = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error updating return timestamp:", err);
      return res.status(500).send("Error updating the return timestamp.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Checked-out book not found.");
    }

    res.status(200).send("Book returned successfully.");
  });
});

// Delete a checked-out book entry
router.delete("/deleteCheckOutBook/:id", (req, res) => {
  const { id } = req.params;

  const sql =
    "DELETE FROM checkedoutbookhistory WHERE checkedOutBookHistoryId = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting checked-out book:", err);
      return res.status(500).send("Error deleting the checked-out book.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Checked-out book not found.");
    }

    res.status(200).send(`Checked-out book ${id} successfully deleted.`);
  });
});

module.exports = router;
