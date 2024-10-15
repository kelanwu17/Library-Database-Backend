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
    bookGenre,
    ageCategory,
    bookCount,
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

  //check existing isbn
  const checkIsbnSql = "SELECT * FROM books WHERE isbn = ?";
  db.query(checkIsbnSql, [isbn], (checkErr, checkResult) => {
    if (checkErr) {
      return res.status(500).send("Error checking isbn existence");
    }

    if (checkResult.length > 0) {
      return res.status(400).send("ISBN already exists");
    }
    const insertSql = `INSERT INTO books (title, bookGenre, ageCategory, bookCount, aisle, description, author, isbn, publisher, edition, monetaryValue, lastUpdatedBy, imgUrl) VALUES (?, ?, ?, ?, ? ,?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      insertSql,
      [
        title,
        bookGenre,
        ageCategory,
        bookCount,
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
          return res.status(500).send("Database Error:" + err.message);
        }
        res.status(201).send("Book added successfully");
      }
    );
  });
});

router.put("/updateBook=:id", (req, res) => {
  const { id } = req.params;
  const {
    title,
    bookGenre,
    ageCategory,
    bookCount,
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
  const sql = `UPDATE books SET
    title = ?,
    bookGenre = ?,
    ageCategory = ?,
    bookCount = ?,
    aisle = ?,
    description = ?,
    author = ?,
    isbn = ?,
    publisher = ?,
    edition = ?,
    monetaryValue = ?,
    lastUpdatedBy = ?,
    imgUrl = ?
    WHERE bookId = ?
  `;
  db.query(
    sql,
    [
      title,
      bookGenre,
      ageCategory,
      bookCount,
      aisle,
      description,
      author,
      isbn,
      publisher,
      edition,
      monetaryValue,
      lastUpdatedBy,
      imgUrl,
      id
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating book: " + err.message);
        return res.status(500).send("Error updating book in database");
      }
      if (result.affectRows === 0) {
        return res.status(404).send("Book not found");
      }
      res.status(200).send(`Book: ${id} successfully updated`);
    }
  );
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
