import pool from './db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigration() {
    const sql = readFileSync(join(__dirname, 'migrations/013_corrigir_estados_cobertura.sql'), 'utf-8');
    
    const client = await pool.connect();
    try {
        console.log('Iniciando migration 013...');
        
        // Verificar estado antes
        const antes = await client.query("SELECT estado, COUNT(*) as total FROM cobertura_cidades GROUP BY estado ORDER BY estado");
        console.log('\n--- Estado ANTES da migration ---');
        antes.rows.forEach(r => console.log(`  estado='${r.estado}': ${r.total} registros`));
        
        // Executar migration
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        
        // Verificar estado depois
        const depois = await client.query("SELECT estado, COUNT(*) as total FROM cobertura_cidades GROUP BY estado ORDER BY estado");
        console.log('\n--- Estado DEPOIS da migration ---');
        depois.rows.forEach(r => console.log(`  estado='${r.estado}': ${r.total} registros`));
        
        console.log('\n✅ Migration 013 aplicada com sucesso!');
    } catch(e) {
        await client.query('ROLLBACK');
        console.error('❌ Erro na migration:', e.message);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
