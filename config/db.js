const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "librarydatabase.mysql.database.azure.com",
  user: "admin3380",
  password: "Password!",
  database: "library",
  port: 3306,
  ssl: {
    rejectUnauthorized: true,
  },
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database: " + err.message);
    return;
  }
  console.log("Connected to database");
});

module.exports = db;
