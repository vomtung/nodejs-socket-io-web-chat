const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'files.db');
const db = new sqlite3.Database(dbPath);

db.run(`
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    file_name TEXT,
    mime_type TEXT,
    data BLOB
)
`);

module.exports = db;
