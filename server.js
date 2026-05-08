const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'presensi_simple'
});

db.connect(err => {
    if (err) console.error("Gagal konek database: " + err.message);
    else console.log("Terhubung ke Database MySQL");
});

// --- API AUTH ---
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Username sudah terdaftar!" });
        res.json({ success: true, message: "Berhasil Daftar!" });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (results.length > 0) res.json({ success: true });
        else res.status(401).json({ success: false, message: "Username atau Password Salah!" });
    });
});

// --- API CRUD PEGAWAI ---
// READ
app.get('/pegawai', (req, res) => {
    db.query('SELECT * FROM pegawai ORDER BY id DESC', (err, result) => res.json(result));
});

// CREATE
app.post('/pegawai', (req, res) => {
    const { nama, jabatan } = req.body;
    db.query('INSERT INTO pegawai (nama, jabatan) VALUES (?, ?)', [nama, jabatan], () => {
        res.json({ success: true, message: 'Data Berhasil Disimpan' });
    });
});

// UPDATE
app.put('/pegawai/:id', (req, res) => {
    const { id } = req.params;
    const { nama, jabatan } = req.body;
    db.query('UPDATE pegawai SET nama = ?, jabatan = ? WHERE id = ?', [nama, jabatan, id], () => {
        res.json({ success: true, message: 'Data Berhasil Diperbarui' });
    });
});

// DELETE
app.delete('/pegawai/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM pegawai WHERE id = ?', [id], () => {
        res.json({ success: true, message: 'Data Berhasil Dihapus' });
    });
});

app.listen(5000, () => console.log('Server berjalan di: http://localhost:5000'));