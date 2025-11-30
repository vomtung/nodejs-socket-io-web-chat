const db = require('./db');

// UPLOAD
exports.uploadFile = (req, res) => {
    const fileId = req.body.fileId;
    const fileName = req.file.originalname;
    const mime = req.file.mimetype;
    const buffer = req.file.buffer;

    db.run(
        `INSERT INTO files (id, file_name, mime_type, data) VALUES (?, ?, ?, ?)`,
        [fileId, fileName, mime, buffer],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: "ok", fileId });
        }
    );
};

// DOWNLOAD
exports.downloadFile = (req, res) => {
    const fileId = req.params.fileId;

    db.get(
        `SELECT file_name, mime_type, data FROM files WHERE id = ?`,
        [fileId],
        (err, row) => {
            if (err || !row) return res.status(404).json({ error: "not found" });

            res.setHeader('Content-Type', row.mime_type);
            res.setHeader('Content-Disposition', `attachment; filename="${row.file_name}"`);
            res.send(row.data);
        }
    );
};
