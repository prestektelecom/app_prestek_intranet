import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erro na conexão com PostgreSQL:', err.message);
    } else {
        console.log('✅ Conectado ao banco PostgreSQL com sucesso.');
        release();
    }
});

export default pool;
