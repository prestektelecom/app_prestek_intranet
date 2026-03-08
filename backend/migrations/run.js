import fs from 'fs';
import path from 'path';
import pool from '../db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
    const filePath = path.join(__dirname, '001_initial.sql');
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log('📦 Executando migration inicial...');
        await pool.query(sql);
        console.log('✅ Tabelas criadas no banco de dados com sucesso.');
    } catch (err) {
        console.error('❌ Falha ao rodar migrations:', err.message);
    } finally {
        pool.end();
    }
}

runMigrations();
