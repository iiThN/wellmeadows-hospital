const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) { console.error('MySQL connection failed:', err); }
  else     { console.log('Connected to MySQL!'); }
});

// WARD
app.get('/api/wards', (req, res) => {
  db.query('SELECT * FROM Ward', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});

// STAFF
app.get('/api/staff', (req, res) => {
  db.query('SELECT * FROM Staff', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/staff/:staff_no/qualifications', (req, res) => {
  db.query('SELECT * FROM Staff_Qualification WHERE staff_no = ?', [req.params.staff_no], (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/staff/:staff_no/experience', (req, res) => {
  db.query('SELECT * FROM Staff_Experience WHERE staff_no = ?', [req.params.staff_no], (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/staff/:staff_no/rota', (req, res) => {
  db.query('SELECT * FROM Staff_Rota WHERE staff_no = ?', [req.params.staff_no], (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/staff-rota', (req, res) => {
  db.query('SELECT * FROM Staff_Rota', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});

// PATIENTS
app.get('/api/patients', (req, res) => {
  db.query('SELECT * FROM Patient', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/inpatients', (req, res) => {
  db.query('SELECT * FROM InPatient', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/outpatients', (req, res) => {
  db.query('SELECT * FROM Outpatient', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/next-of-kin', (req, res) => {
  db.query('SELECT * FROM Next_of_KIN', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/appointments', (req, res) => {
  db.query('SELECT * FROM Appointment', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/local-doctors', (req, res) => {
  db.query('SELECT * FROM Local_Doctor', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/patient-referrals', (req, res) => {
  db.query('SELECT * FROM Patient_Referral', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});

// MEDICATION
app.get('/api/pharmaceutical-supplies', (req, res) => {
  db.query('SELECT * FROM Pharmaceutical_Supply', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/patient-medications', (req, res) => {
  db.query('SELECT * FROM Patient_Medication', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});

// SUPPLIES
app.get('/api/surgical-supplies', (req, res) => {
  db.query('SELECT * FROM Surgical_Supply', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/suppliers', (req, res) => {
  db.query('SELECT * FROM Supplier', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/requisitions', (req, res) => {
  db.query('SELECT * FROM Requisition', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});
app.get('/api/requisition-items', (req, res) => {
  db.query('SELECT * FROM Requisition_Item', (err, r) => err ? res.status(500).json({ error: err.message }) : res.json(r));
});

// START SERVER — always last
app.listen(5000, () => console.log('Server running on http://localhost:5000'));