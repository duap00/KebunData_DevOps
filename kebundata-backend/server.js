const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// --- ADD THIS SECTION ---
// Root Endpoint: Just to say "Hello" and prove we are online
app.get('/', (req, res) => {
    res.send('✅ KebunData Backend is Running! Go to /api/posts to see data.');
});
// ------------------------

// 1. Setup Database File
// We store it in a 'data' folder so we can back it up easily
const dbFolder = path.join(__dirname, 'data');
if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder);
}
const dbPath = path.join(dbFolder, 'kebundata.db');

// 2. Connect (This creates the file if missing)
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database ' + err.message);
    else console.log('Connected to SQLite database at ' + dbPath);
});

// 3. Create Table (Automatically on startup)
db.run(`CREATE TABLE IF NOT EXISTS journal_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// --- API ENDPOINTS ---

// GET All Posts
app.get('/api/posts', (req, res) => {
    // SQLite uses "SELECT * FROM" just like Oracle
    db.all("SELECT id, title, content, image_url, video_url, created_at FROM journal_posts ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Normalize keys to lowercase for frontend
        res.json(rows); 
    });
});

// CREATE Post
app.post('/api/posts', (req, res) => {
    const { title, content, image, video } = req.body;
    const sql = `INSERT INTO journal_posts (title, content, image_url, video_url) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [title, content, image || '', video || ''], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Post saved", id: this.lastID });
    });
});

// DELETE Post
app.delete('/api/posts/:id', (req, res) => {
    db.run(`DELETE FROM journal_posts WHERE id = ?`, req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Deleted", changes: this.changes });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
