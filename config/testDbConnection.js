import { createPool } from 'mysql2/promise';

async function testConnection() {
    try {
        const pool = createPool({
            host: 'localhost',
            user: 'root',
            password: '', // empty password for Laragon's default root user
            database: 'hospital_db'
        });

        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        console.log('Database connection successful:', rows[0].solution); // Should log "2"
        
        await pool.end(); // Close the connection
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

testConnection();
