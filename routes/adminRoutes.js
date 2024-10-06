const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Add a new admin
router.post('/', async (req, res) => {
    const { username, password, role } = req.body;

    // Input validation (basic example)
    if (!username || !password || !role) {
        return res.status(400).send('All fields are required');
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO admin (username, password, role) VALUES (?, ?, ?)', 
            [username, password_hash, role]);
        res.status(201).send('Admin added');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all admins
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM admin');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Update admin info
router.put('/:id', async (req, res) => {
    const { username } = req.body;

    // Input validation (basic example)
    if (!username ) {
        return res.status(400).send('Username is required');
    }

    try {
        const [result] = await pool.query('UPDATE admin SET username = ? WHERE id = ?',
            [username, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Admin not found');
        }

        res.send('Admin updated');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete admin
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM admin WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Admin not found');
        }

        res.send('Admin deleted');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
