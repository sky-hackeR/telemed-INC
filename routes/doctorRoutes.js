const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Add a new doctor
router.post('/', async (req, res) => {
    const { first_name, last_name, specialization, email, phone, schedule } = req.body;

    // Input validation
    if (!first_name || !last_name || !specialization || !email || !phone || !schedule) {
        return res.status(400).send('All fields are required');
    }

    try {
        await pool.query(
            'INSERT INTO doctors (first_name, last_name, specialization, email, phone, schedule) VALUES (?, ?, ?, ?, ?, ?)', 
            [first_name, last_name, specialization, email, phone, schedule]
        );
        res.status(201).send('Doctor added');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all doctors
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM doctors');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Update doctor info
router.put('/:id', async (req, res) => {
    const { first_name, last_name, specialization, email, phone, schedule } = req.body;

    // Input validation (basic example)
    if (!first_name || !last_name || !email) {
        return res.status(400).send('First name, last name, and email are required');
    }

    try {
        const params = [first_name, last_name, specialization, email, phone, schedule, req.params.id];

        // Update doctor information without password
        const [result] = await pool.query(
            'UPDATE doctors SET first_name = ?, last_name = ?, specialization = ?, email = ?, phone = ?, schedule = ? WHERE id = ?',
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).send('Doctor not found');
        }

        res.send('Doctor updated');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Doctor not found');
        }

        res.send('Doctor deleted');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
