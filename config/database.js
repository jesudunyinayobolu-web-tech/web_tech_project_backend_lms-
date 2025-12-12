const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
    connectionString: "postgresql://jesudunyin:HwraWL1iV8Lq6BsPZzXUYIjSrs8V2Cxz@dpg-d4oe1f49c44c73fdji0g-a.frankfurt-postgres.render.com:5432/library_db_zhg7?sslmode=require",
    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database on Render.com');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
    process.exit(-1);
});

// Query helper function
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

module.exports = {
    query,
    pool
};