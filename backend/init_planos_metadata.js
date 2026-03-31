import pool from './db.js';

async function setup() {
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS planos_metadata (
            plano_id VARCHAR(50) PRIMARY KEY,
            prazo_instalacao VARCHAR(100),
            atualizado_em TIMESTAMPTZ DEFAULT NOW()
        );
        `);
        console.log('Tabela planos_metadata criada/verificada.');
        
        // Add new column
        await pool.query(`
        ALTER TABLE planos_metadata 
        ADD COLUMN IF NOT EXISTS taxa_instalacao VARCHAR(100);
        `);
        console.log('Coluna taxa_instalacao adicionada/verificada.');

        process.exit(0);
    } catch (e) {
        console.error('Erro ao criar tabela planos_metadata:', e);
        process.exit(1);
    }
}
setup();
