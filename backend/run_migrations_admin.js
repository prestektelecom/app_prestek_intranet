import pool from './db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigration(filename) {
    const sql = readFileSync(join(__dirname, 'migrations', filename), 'utf-8');
    const client = await pool.connect();
    try {
        console.log(`\n📄 Aplicando ${filename}...`);
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`✅ ${filename} aplicada com sucesso!`);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(`❌ Erro em ${filename}:`, e.message);
        throw e;
    } finally {
        client.release();
    }
}

async function main() {
    try {
        await runMigration('015b_add_is_admin.sql');
        await runMigration('016_auditoria_configs.sql');
        console.log('\n🎉 Todas as migrations aplicadas!');
    } catch (e) {
        console.error('\nAbortado por erro.');
    } finally {
        pool.end();
    }
}

main();
