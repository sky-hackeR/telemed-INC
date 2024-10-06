const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Book an appointment
router.post('/', async (req, res) => {
    const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;

    // Input validation
    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
        return res.status(400).send('All fields are required');
    }

    try {
        await pool.query('INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_date, appointment_time, 'scheduled']);
        res.status(201).send('Appointment booked');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all appointments for a patient
router.get('/patient/:patient_id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM appointments WHERE patient_id = ?', [req.params.patient_id]);

        if (rows.length === 0) {
            return res.status(404).send('No appointments found for this patient');
        }

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Update appointment status
router.put('/:id', async (req, res) => {
    const { status } = req.body;

    // Input validation
    if (!status) {
        return res.status(400).send('Status is required');
    }

    try {
        const [result] = await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Appointment not found');
        }

        res.send('Appointment status updated');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete an appointment
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Appointment not found');
        }

        res.send('Appointment canceled');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
