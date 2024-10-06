const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../config/db');

// Register a new patient
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, phone, date_of_birth, gender, address } = req.body;

    // Input validation
    if (!first_name || !last_name || !email || !password || !phone || !date_of_birth || !gender || !address) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Check if the email is already registered
        const [existingRows] = await pool.query('SELECT * FROM patients WHERE email = ?', [email]);
        if (existingRows.length > 0) {
            return res.status(409).send('Email is already registered');
        }

        const password_hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [first_name, last_name, email, password_hash, phone, date_of_birth, gender, address]);
        
        res.status(201).send('Patient registered');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Login a patient
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        const [rows] = await pool.query('SELECT * FROM patients WHERE email = ?', [email]);
        const patient = rows[0];

        if (patient && await bcrypt.compare(password, patient.password_hash)) {
            req.session.userId = patient.id;
            res.send('Login successful');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Logout a patient
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to log out');
        }
        res.send('Logged out');
    });
});

module.exports = router;
