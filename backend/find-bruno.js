import pool from './db.js';

async function test() {
    try {
        const res = await pool.query("SELECT * FROM usuarios_perfil WHERE funcionario_nome LIKE '%BRUNO FERNANDO%' OR usuario_nome LIKE '%BRUNO FERNANDO%'");
        console.log("Dados do Bruno no Banco Local:");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch(e) {
        console.error(e)
    } finally {
        pool.end();
    }
}
test();
