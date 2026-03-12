import pool from './db.js';

async function test() {
    try {
        const res = await pool.query("SELECT * FROM usuarios_perfil WHERE usuario_email LIKE '%marcio%' LIMIT 5");
        console.log("Perfis locais do banco com email marcio:");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch(e) {
        console.error(e)
    } finally {
        pool.end();
    }
}
test();
