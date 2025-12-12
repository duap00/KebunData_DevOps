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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
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
    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // 2. Crop Logs (Journal)
    db.run(`CREATE TABLE IF NOT EXISTS crop_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        crop_name TEXT DEFAULT 'Kale',
        stage TEXT,     -- NEW: Stores "Sowing", "Germination", etc.
        location TEXT,
        notes TEXT,
        image_url TEXT,
        video_url TEXT,
        plant_height REAL,
        leaf_count INTEGER,
        plant_count INTEGER DEFAULT 0,
        rejected_count INTEGER DEFAULT 0,
        harvest_amount_kg REAL DEFAULT 0,
        air_temp REAL,
        humidity REAL,
        light_lux INTEGER,
        ph_level REAL,
        ec_level REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 3. Farm Systems (Infrastructure)
    db.run(`CREATE TABLE IF NOT EXISTS farm_systems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        system_code TEXT UNIQUE NOT NULL,
        system_type TEXT NOT NULL,
        capacity INTEGER DEFAULT 0,
        current_crop TEXT,
        status TEXT DEFAULT 'Idle'
    )`);

    // 4. Reset & Seed Farm Layout
    db.run("DELETE FROM farm_systems", [], (err) => {
        if (!err) {
            const systems = [
                ['Zipgrow 1', 'Zipgrow Tower', 12],
                ['Zipgrow 2', 'Zipgrow Tower', 10],
                ['Zipgrow 3', 'Zipgrow Tower', 10],
                ['Aeroponics 1', 'Aeroponics', 72],
                ['Germination 1', 'Germination Station', 200],
                ['Packaging 1', 'Packaging Station', 0]
            ];
            const stmt = db.prepare("INSERT INTO farm_systems (system_code, system_type, capacity) VALUES (?, ?, ?)");
            systems.forEach(sys => stmt.run(sys));
            stmt.finalize();
        }
    });

    // 5. Migrations
    const migrations = [
        "ALTER TABLE crop_logs ADD COLUMN plant_count INTEGER DEFAULT 0",
        "ALTER TABLE crop_logs ADD COLUMN rejected_count INTEGER DEFAULT 0",
        "ALTER TABLE crop_logs ADD COLUMN harvest_amount_kg REAL DEFAULT 0",
        "ALTER TABLE crop_logs ADD COLUMN location TEXT",
        "ALTER TABLE crop_logs ADD COLUMN title TEXT",
        "ALTER TABLE crop_logs ADD COLUMN stage TEXT" // NEW MIGRATION
    ];
    migrations.forEach(sql => {
        db.run(sql, (err) => { if (err && !err.message.includes("duplicate")) console.log("Migration info:", err.message); });
    });
});

// --- HELPER: IOT SIMULATOR ---
function getSimulatedSensorData() {
    const now = new Date();
    const hour = now.getHours();
    const tempBase = 24; 
    const temp = tempBase + Math.sin((hour - 10) * Math.PI / 12) * 4 + (Math.random() * 0.5);
    const humid = 80 - Math.sin((hour - 10) * Math.PI / 12) * 15 + (Math.random() * 2);

    return {
        air_temp: parseFloat(temp.toFixed(1)),
        humidity: parseFloat(humid.toFixed(1)),
        ph: parseFloat((6.5 + (Math.random() * 0.4 - 0.2)).toFixed(2)),
        ec: parseFloat((1.8 + (Math.random() * 0.2 - 0.1)).toFixed(2)),
        active_sensors: 24,
        total_sensors: 25
    };
}

// --- API ENDPOINTS ---

app.get('/api/dashboard', (req, res) => {
    db.all("SELECT * FROM farm_systems ORDER BY system_code", [], (err, systems) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get("SELECT SUM(harvest_amount_kg) as total FROM crop_logs", [], (err, row) => {
            const totalHarvest = row ? row.total : 0;
            const dashboardData = {
                systems: systems,
                harvest: totalHarvest || 0,
                sensors: getSimulatedSensorData(),
                last_updated: new Date().toISOString()
            };
            res.json(dashboardData);
        });
    });
});

app.get('/api/posts', (req, res) => {
    db.all("SELECT * FROM crop_logs ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = rows.map(r => ({
            id: r.id,
            title: r.title || `${r.crop_name} Update`, 
            content: r.notes,
            image: r.image_url,
            video: r.video_url,
            date: r.created_at,
            crop_name: r.crop_name,
            location: r.location,
            stage: r.stage, // Send stage to frontend
            stats: {
                height: r.plant_height,
                leaves: r.leaf_count,
                plant_count: r.plant_count,
                rejected_count: r.rejected_count,
                harvest_kg: r.harvest_amount_kg,
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
        crop_name, stage, location, height, leaves, 
        plant_count, rejected_count, harvest_kg,
        temp, humid, lux, ph, ec 
    } = req.body;

    const finalCrop = crop_name || 'General'; 

    const sql = `INSERT INTO crop_logs (
        title, crop_name, stage, location, notes, image_url, video_url, 
        plant_height, leaf_count, plant_count, rejected_count, harvest_amount_kg,
        air_temp, humidity, light_lux, ph_level, ec_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
        title || 'New Entry',
        finalCrop, stage || 'Observation', location || 'General', content, image || '', video || '',
        height || 0, leaves || 0, plant_count || 0, rejected_count || 0, harvest_kg || 0,
        temp || 0, humid || 0, lux || 0, ph || 0, ec || 0
    ];

    db.run(sql, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // AUTO-UPDATE MAP
        if (location && location !== 'General') {
            db.run(`UPDATE farm_systems SET current_crop = ?, status = 'Active' WHERE system_code = ?`, 
                [finalCrop, location], 
                (updateErr) => { if (updateErr) console.error("Map update failed:", updateErr); }
            );
        }

        res.json({ message: "Log saved", id: this.lastID });
    });
});

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
    } catch (error) { res.status(500).json({ error: "AI Error" }); }
});

app.delete('/api/posts/:id', (req, res) => {
    db.run(`DELETE FROM crop_logs WHERE id = ?`, req.params.id, function(err) {
        if (err) res.status(500).send(err.message);
        else res.json({ message: "Deleted" });
    });
});

app.get('/', (req, res) => res.send('✅ KebunData Scientific Backend Running'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
