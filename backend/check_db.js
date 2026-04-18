
import pool from './db.js';

async function checkMetadata() {
    try {
        const res = await pool.query('SELECT * FROM planos_metadata LIMIT 20');
        console.log('--- Planos Metadata (JSON) ---');
        console.log(JSON.stringify(res.rows, null, 2));
        
        const count = await pool.query('SELECT COUNT(*) FROM planos_metadata');
        console.log('Total metadata records:', count.rows[0].count);
        
        process.exit(0);
    } catch (err) {
        console.error('Error querying DB:', err);
        process.exit(1);
    }
}

checkMetadata();
