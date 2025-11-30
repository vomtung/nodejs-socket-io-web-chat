const express = require("express");
const path = require("path");
const routes = require("./routes");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

// middleware phục vụ file tĩnh
app.use(express.static(path.join(__dirname, "../public")));

// route cơ bản
app.use("/", routes);

// ======================
//  SQLITE FILE STORAGE
// ======================
const dbPath = path.join(__dirname, 'halo_db.db');
const db = new sqlite3.Database(dbPath);

db.run(`
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    file_name TEXT,
    mime_type TEXT,
    data BLOB
  )
`);

console.log("📦 SQLite ready at halo_db.db");

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// ======================
//  UPLOAD FILE API
// ======================
app.post("/upload", upload.single("file"), (req, res) => {
  const fileId = req.body.fileId;
  const fileName = req.file.originalname;
  const mime = req.file.mimetype;
  const buffer = req.file.buffer;

  db.run(
    `INSERT INTO files (id, file_name, mime_type, data) VALUES (?, ?, ?, ?)`,
    [fileId, fileName, mime, buffer],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      console.log(`📥 Saved file ${fileName} → SQLite`);
      res.json({ status: "ok", fileId });
    }
  );
});

// ======================
//  DOWNLOAD FILE API
// ======================
app.get("/download/:fileId", (req, res) => {
  const fileId = req.params.fileId;

  db.get(
    `SELECT file_name, mime_type, data FROM files WHERE id = ?`,
    [fileId],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: "File not found" });
      }

      res.setHeader("Content-Type", row.mime_type);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${row.file_name}"`
      );

      res.send(row.data);
    }
  );
});

module.exports = app;
