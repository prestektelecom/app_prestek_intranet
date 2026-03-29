import pool from './db.js';

async function setup() {
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS setores_descricoes (
            id_setor VARCHAR(50) PRIMARY KEY,
            descricao TEXT NOT NULL,
            atualizado_em TIMESTAMPTZ DEFAULT NOW(),
            atualizado_por VARCHAR(100)
        );
        `);
        console.log('Tabela setores_descricoes criada/verificada.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
setup();
