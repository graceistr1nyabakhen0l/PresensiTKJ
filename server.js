const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// --- KONEKSI DATABASE SQLITE ---
// Database akan otomatis tercipta dalam file bernama 'database.sqlite'
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Gagal konek database: " + err.message);
    else console.log("Terhubung ke Database SQLite (File: " + dbPath + ")");
});

// --- PEMBUATAN TABEL OTOMATIS ---
db.serialize(() => {
    // Tabel User untuk Login
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    // Tabel Pegawai
    db.run(`CREATE TABLE IF NOT EXISTS pegawai (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT,
        jabatan TEXT,
        status TEXT DEFAULT 'Hadir',
        waktu DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// --- API AUTH ---
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function (err) {
        if (err) return res.status(500).json({ success: false, message: "Username sudah terdaftar!" });
        res.json({ success: true, message: "Berhasil Daftar!" });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: "Server Error" });
        if (row) res.json({ success: true });
        else res.status(401).json({ success: false, message: "Username atau Password Salah!" });
    });
});

// --- API CRUD PEGAWAI ---
// READ
app.get('/pegawai', (req, res) => {
    db.all('SELECT * FROM pegawai ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json([]);
        res.json(rows);
    });
});

// CREATE
app.post('/pegawai', (req, res) => {
    const { nama, jabatan } = req.body;
    db.run('INSERT INTO pegawai (nama, jabatan) VALUES (?, ?)', [nama, jabatan], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Data Berhasil Disimpan' });
    });
});

// UPDATE
app.put('/pegawai/:id', (req, res) => {
    const { id } = req.params;
    const { nama, jabatan } = req.body;
    db.run('UPDATE pegawai SET nama = ?, jabatan = ? WHERE id = ?', [nama, jabatan, id], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Data Berhasil Diperbarui' });
    });
});

// DELETE
app.delete('/pegawai/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM pegawai WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Data Berhasil Dihapus' });
    });
});

// Port 5000 (Pastikan sudah allow di ufw Ubuntu)
app.listen(5000, () => console.log('Server berjalan di: http://10.103.132.15.78:5000'));