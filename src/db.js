const Database = require("better-sqlite3");
const path = require("../db.sqlite");

// Define the path to the database file (in the current directory)
const dbPath = path.join(__dirname, "database.sqlite");

// Initialize the database
const db = new Database(dbPath);

// Create the users table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Export the database instance so server.js can use it
module.exports = db;
