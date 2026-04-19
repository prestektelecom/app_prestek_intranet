const { Pool } = require('pg');
require('dotenv').config();

const pool = process.env.DB_HOST
    ? new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    })
    : new Pool({
        connectionString: process.env.DATABASE_URL
    });

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const res = await client.query(`
            SELECT id, n1_id, n2_id, gerente_id 
            FROM plantoes 
            WHERE n1_id IS NOT NULL OR n2_id IS NOT NULL OR gerente_id IS NOT NULL
        `);
        
        console.log(`Found ${res.rowCount} records to migrate`);
        
        for (const row of res.rows) {
            let n1 = row.n1_id ? String(row.n1_id) : null;
            let n2 = row.n2_id ? String(row.n2_id) : null;
            let mgr = row.gerente_id ? String(row.gerente_id) : null;
            
            await client.query(
                `UPDATE plantoes SET n1_id = $1, n2_id = $2, gerente_id = $3 WHERE id = $4`,
                [n1, n2, mgr, row.id]
            );
        }
        
        await client.query('COMMIT');
        console.log('Migration complete!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();