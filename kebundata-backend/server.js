const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Loaded from .env
const PORT = 3000;

// --- DATABASE SETUP ---
const dbFolder = path.join(__dirname, 'data');
if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder);
const dbPath = path.join(dbFolder, 'kebundata.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('DB Error:', err.message);
    else console.log('Connected to SQLite at ' + dbPath);
});

db.serialize(() => {
    // 1. Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // 2. Create Crop Logs Table (Updated Schema)
    db.run(`CREATE TABLE IF NOT EXISTS crop_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop_name TEXT DEFAULT 'Kale',
        notes TEXT,
        image_url TEXT,
        video_url TEXT,
        plant_height REAL,
        leaf_count INTEGER,
        plant_count INTEGER DEFAULT 0,   -- NEW: Count of active plants
        rejected_count INTEGER DEFAULT 0, -- NEW: Count of failed/rejected plants
        air_temp REAL,
        humidity REAL,
        light_lux INTEGER,
        ph_level REAL,
        ec_level REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 3. Migration: Add columns to existing table if they don't exist
    // This allows you to keep old data while adding new features
    const addCols = [
        "ALTER TABLE crop_logs ADD COLUMN plant_count INTEGER DEFAULT 0",
        "ALTER TABLE crop_logs ADD COLUMN rejected_count INTEGER DEFAULT 0"
    ];
    addCols.forEach(sql => {
        db.run(sql, (err) => {
            // Ignore error if column already exists
            if (err && !err.message.includes("duplicate column name")) {
                console.log("Migration info:", err.message);
            }
        });
    });
});

// --- MIDDLEWARE ---
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// --- NEW: AI PROXY ENDPOINT (Secure) ---
app.post('/api/ask-ai', async (req, res) => {
    const { prompt } = req.body;
    if (!GEMINI_API_KEY) return res.status(500).json({ error: "Server missing API Key" });

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to fetch AI response" });
    }
});

// --- AUTH API ---
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send("Missing fields");
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) return res.status(400).send("User already exists");
        res.status(201).send("User registered");
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) return res.status(400).send("User not found");
        if (await bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign({ name: user.username }, JWT_SECRET);
            res.json({ accessToken: accessToken });
        } else {
            res.status(403).send("Wrong password");
        }
    });
});

// --- LOGS API ---
app.get('/api/posts', (req, res) => {
    db.all("SELECT * FROM crop_logs ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = rows.map(r => ({
            id: r.id,
            title: `${r.crop_name} Update`,
            content: r.notes,
            image: r.image_url,
            video: r.video_url,
            date: r.created_at,
            crop_name: r.crop_name,
            // Send scientific stats including new counts
            stats: {
                height: r.plant_height,
                leaves: r.leaf_count,
                plant_count: r.plant_count,       // NEW
                rejected_count: r.rejected_count, // NEW
                ph: r.ph_level,
                ec: r.ec_level
            }
        }));
        res.json(formatted); 
    });
});

app.post('/api/posts', (req, res) => {
    const { 
        title, content, image, video, 
        crop_name, height, leaves, 
        plant_count, rejected_count, // NEW Inputs
        temp, humid, lux, ph, ec 
    } = req.body;

    // Use title as crop name fallback if not specific
    const finalCrop = crop_name || 'General'; 

    const sql = `INSERT INTO crop_logs (
        crop_name, notes, image_url, video_url, 
        plant_height, leaf_count, plant_count, rejected_count,
        air_temp, humidity, light_lux, ph_level, ec_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
        finalCrop,
        content, 
        image || '', 
        video || '',
        height || 0,
        leaves || 0,
        plant_count || 0,    // NEW: Default to 0
        rejected_count || 0, // NEW: Default to 0
        temp || 0,
        humid || 0,
        lux || 0,
        ph || 0,
        ec || 0
    ];

    db.run(sql, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Log saved", id: this.lastID });
    });
});

app.delete('/api/posts/:id', (req, res) => {
    db.run(`DELETE FROM crop_logs WHERE id = ?`, req.params.id, function(err) {
        if (err) res.status(500).send(err.message);
        else res.json({ message: "Deleted" });
    });
});

app.get('/', (req, res) => res.send('✅ KebunData Scientific Backend Running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
