const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Add a new patient
router.post('/', async (req, res) => {
    const { first_name, last_name, email, phone, date_of_birth, gender, address, password } = req.body;

    // Input validation (basic example)
    if (!first_name || !last_name || !email || !phone || !date_of_birth || !gender || !address || !password) {
        return res.status(400).send('All fields are required');
    }

    // Email format validation (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send('Invalid email format');
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, password) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [first_name, last_name, email, phone, date_of_birth, gender, address, password_hash]
        );
        res.status(201).send('Patient added');
    } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get Patient Profile
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).send('Patient not found');
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update Patient Profile
router.put('/:id', async (req, res) => {
    const { first_name, last_name, email, phone, date_of_birth, gender, address, password } = req.body;

    // Input validation (basic example)
    if (!first_name || !last_name || !email || !phone || !date_of_birth || !gender || !address) {
        return res.status(400).send('All fields are required except password');
    }

    try {
        // Prepare the query parameters
        const params = [first_name, last_name, email, phone, date_of_birth, gender, address, req.params.id];
        
        // Only include password if provided
        if (password) {
            const password_hash = await bcrypt.hash(password, 10);
            params.splice(7, 1, password_hash); // Update password in params (index 7)
        }

        await pool.query(
            'UPDATE patients SET first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?, gender = ?, address = ?, password = ? WHERE id = ?',
            [...params.slice(0, 7), password ? params[7] : null, req.params.id] // Ensure password is set correctly
        );

        res.send('Patient profile updated');
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Delete Patient Account
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM patients WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Patient not found');
        }

        res.send('Patient account deleted');
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
