const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  const sql = "SELECT * FROM books";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Error getting books from database.");
    }
    res.json(result);
  });
});

router.post("/createBook", (req, res) => {
  const {
    title,
    genre,
    ageCategory,
    count,
    aisle,
    description,
    author,
    isbn,
    publisher,
    edition,
    monetaryValue,
    lastUpdatedBy,
    imgUrl,
  } = req.body;

  // Check existing ISBN
  const checkIsbnSql = "SELECT * FROM books WHERE isbn = ?";
  db.query(checkIsbnSql, [isbn], (checkErr, checkResult) => {
    if (checkErr) {
      return res.status(500).send("Error checking ISBN existence");
    }

    if (checkResult.length > 0) {
      return res.status(400).send("ISBN already exists");
    }

    // Insert the book into the books table
    const insertSql = `INSERT INTO books (title, genre, ageCategory, count, aisle, description, author, isbn, publisher, edition, monetaryValue, lastUpdatedBy, imgUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      insertSql,
      [
        title,
        genre,
        ageCategory,
        count,
        aisle,
        description,
        author,
        isbn,
        publisher,
        edition,
        monetaryValue,
        lastUpdatedBy,
        imgUrl,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).send("Database Error: " + err.message);
        }

        const bookId = result.insertId; // Get the ID of the newly created book
        const insertInstanceSql = `INSERT INTO bookinstance (bookId, isMissing, checkedOutStatus) VALUES (?,?, ?)`;

        // Create instances
        const instancePromises = [];
        for (let i = 0; i < count; i++) {
          // Push each insert operation into an array of promises
          instancePromises.push(
            new Promise((resolve, reject) => {
              db.query(insertInstanceSql, [bookId, false, false], (instanceErr, instanceResult) => {
                if (instanceErr) {
                  reject(instanceErr); // Reject the promise if there's an error
                } else {
                  resolve(instanceResult); // Resolve the promise on success
                }
              });
            })
          );
        }

        // Wait for all insert promises to complete
        Promise.all(instancePromises)
          .then(() => {
            res.status(201).send("Book added successfully with instances created");
          })
          .catch((instanceErr) => {
            res.status(500).send("Error creating book instances: " + instanceErr.message);
          });
      }
    );
  });
});



router.put("/updateBook=:bookId", (req, res) => {
  const { bookId } = req.params;
  const {
    title,
    genre,
    ageCategory,
    count, // New count provided in the update
    aisle,
    description,
    author,
    isbn,
    publisher,
    edition,
    monetaryValue,
    lastUpdatedBy,
    imgUrl,
  } = req.body;

  // Step 1: Check the current count from the books table
  const getCountSql = "SELECT count FROM books WHERE bookId = ?";
  db.query(getCountSql, [bookId], (err, result) => {
    if (err) return res.status(500).send("Database Error: " + err.message);

    const currentCount = result[0].count;

    if (currentCount < count) {
      // Step 2: Add new instances if count increased
      const instancesToAdd = count - currentCount;
      const insertInstanceSql = "INSERT INTO bookinstance (bookId, checkedOutStatus) VALUES (?, ?)";

      const promises = [];
      for (let i = 0; i < instancesToAdd; i++) {
        promises.push(
          new Promise((resolve, reject) => {
            db.query(insertInstanceSql, [bookId, false], (instanceErr, instanceResult) => {
              if (instanceErr) reject(instanceErr);
              else resolve(instanceResult);
            });
          })
        );
      }

      Promise.all(promises)
        .then(() => updateBookRecord())
        .catch((err) => res.status(500).send("Error adding instances: " + err.message));

    } else if (currentCount > count) {
      // Step 3: Remove instances if count decreased
      const instancesToRemove = currentCount - count;
      const deleteInstanceSql = `
        DELETE FROM bookinstance 
        WHERE bookId = ? AND checkedOutStatus = false 
        ORDER BY instanceId DESC LIMIT ?`;

      db.query(deleteInstanceSql, [bookId, instancesToRemove], (err) => {
        if (err) return res.status(500).send("Error deleting instances: " + err.message);
        updateBookRecord();
      });
    } else {
      // If count hasn't changed, just update the book record
      updateBookRecord();
    }

    // Step 4: Update the books table with new information
    function updateBookRecord() {
      const updateSql = `
        UPDATE books 
        SET title = ?, genre = ?, ageCategory = ?, count = ?, aisle = ?, 
            description = ?, author = ?, isbn = ?, publisher = ?, edition = ?, 
            monetaryValue = ?, lastUpdatedBy = ?, imgUrl = ?
        WHERE bookId = ?`;

      db.query(
        updateSql,
        [
          title, genre, ageCategory, count, aisle, description, author,
          isbn, publisher, edition, monetaryValue, lastUpdatedBy, imgUrl, bookId,
        ],
        (err) => {
          if (err) return res.status(500).send("Database Error: " + err.message);
          res.status(200).send("Book updated successfully");
        }
      );
    }
  });
});

router.delete("/deleteBook=:id", (req, res) => {
  const sql = "DELETE FROM books WHERE bookId = ?";
  const id = req.params.id;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Error deleting book: ", err.message);
      return res.status(500).send("Error deleting book");
    }
    res.status(200).send(`Book ${id} successfully deleted`);
  })
})

module.exports = router;
