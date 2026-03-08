import fs from 'fs';
import path from 'path';
import pool from '../db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
    // Busca todos os arquivos .sql em ordem alfabética
    const arquivos = fs.readdirSync(__dirname)
        .filter(f => f.endsWith('.sql'))
        .sort();

    for (const arquivo of arquivos) {
        const filePath = path.join(__dirname, arquivo);
        try {
            const sql = fs.readFileSync(filePath, 'utf8');
            console.log(`📦 Executando migration: ${arquivo}...`);
            await pool.query(sql);
            console.log(`✅ Migration ${arquivo} concluída com sucesso.`);
        } catch (err) {
            console.error(`❌ Falha ao rodar migration ${arquivo}:`, err.message);
        }
    }
    pool.end();
    console.log('🎉 Todas as migrations foram processadas.');
}

runMigrations();
