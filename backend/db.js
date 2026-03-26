import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool(
    process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false }
        : {
            host: process.env.DB_HOST || process.env.PGHOST,
            port: process.env.DB_PORT || process.env.PGPORT || 5432,
            database: process.env.DB_NAME || process.env.PGDATABASE,
            user: process.env.DB_USER || process.env.PGUSER,
            password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
          }
);

pool.connect((err, client, release) => {
    if (err) {
        console.error('Erro na conexão com PostgreSQL:', err.message);
    } else {
        console.log('Conectado ao banco PostgreSQL com sucesso.');
        release();
    }
});

export default pool;
