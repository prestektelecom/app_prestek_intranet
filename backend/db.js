import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// Prioriza variáveis DB_* explícitas; usa DATABASE_URL do Replit como fallback
const pool = process.env.DB_HOST
    ? new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    })
    : new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
    });

pool.connect((err, client, release) => {
    if (err) {
        console.error('Erro na conexão com PostgreSQL:', err.message);
    } else {
        console.log('Conectado ao banco PostgreSQL com sucesso.');
        release();
    }
});

export default pool;
