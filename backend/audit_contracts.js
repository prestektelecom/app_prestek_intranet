import pool from './db.js';

async function audit() {
  try {
    const res = await pool.query("SELECT * FROM cobertura_cidades WHERE estado NOT IN ('AL', 'SE')");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

audit();
