import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// Timeout por host antes de desistir e tentar o próximo da lista
const CONNECT_TIMEOUT_MS = 10_000;

// Monta a lista ordenada de candidatos de conexão.
// PRODUÇÃO: DB_PRIMARY_HOST (Felix) primeiro, DB_REPLICA_HOST (Antonio) como fallback.
// LOCAL:    apenas DB_HOST — sem fallback, nunca toca nos servidores remotos.
// LEGADO:   DATABASE_URL do Replit quando nenhum DB_HOST/DB_PRIMARY_HOST existe.
function montarCandidatos() {
    const base = {
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
    };

    if (process.env.DB_PRIMARY_HOST) {
        return [process.env.DB_PRIMARY_HOST, process.env.DB_REPLICA_HOST]
            .filter(Boolean)
            .map((host) => ({ rotulo: host, config: { ...base, host } }));
    }

    if (process.env.DB_HOST) {
        return [{ rotulo: process.env.DB_HOST, config: { ...base, host: process.env.DB_HOST } }];
    }

    return [{
        rotulo: 'DATABASE_URL',
        config: {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
        },
    }];
}

let poolAtivo = null;      // Pool em uso no momento
let selecaoEmCurso = null; // Promise da seleção em andamento (evita corrida entre requisições)

// Percorre os candidatos e adota o primeiro nó que aceita ESCRITA.
// Um STANDBY responde true em pg_is_in_recovery() e é descartado — é o equivalente
// ao target_session_attrs=read-write do libpq, que o driver `pg` puro não implementa.
async function selecionarPool() {
    const candidatos = montarCandidatos();
    const houveAlternativas = candidatos.length > 1;
    const falhas = [];

    for (const { rotulo, config } of candidatos) {
        const pool = new Pool(config);
        // Sem este handler, a queda do servidor derruba o processo Node inteiro
        pool.on('error', (err) => {
            console.error(`Conexão com ${rotulo} perdida:`, err.message);
            if (poolAtivo === pool) poolAtivo = null; // força nova seleção na próxima query
        });

        try {
            if (houveAlternativas) {
                const { rows } = await pool.query('SELECT pg_is_in_recovery() AS somente_leitura');
                if (rows[0].somente_leitura) {
                    falhas.push(`${rotulo}: é STANDBY (somente leitura)`);
                    await pool.end();
                    continue;
                }
            } else {
                await pool.query('SELECT 1');
            }

            console.log(`Conectado ao banco PostgreSQL com sucesso. (host: ${rotulo})`);
            return pool;
        } catch (err) {
            falhas.push(`${rotulo}: ${err.message}`);
            await pool.end().catch(() => {});
        }
    }

    // Nenhum host disponível: o servidor continua de pé e loga o erro, como antes
    throw new Error(`Erro na conexão com PostgreSQL: ${falhas.join(' | ')}`);
}

async function obterPool() {
    if (poolAtivo) return poolAtivo;
    if (!selecaoEmCurso) {
        selecaoEmCurso = selecionarPool()
            .then((pool) => { poolAtivo = pool; return pool; })
            .finally(() => { selecaoEmCurso = null; });
    }
    return selecaoEmCurso;
}

// Fachada com a mesma superfície do Pool usada pelo projeto (query/connect/end),
// resolvendo o host ativo sob demanda para permitir troca após failover sem reiniciar o Node.
const db = {
    async query(...args) {
        const pool = await obterPool();
        return pool.query(...args);
    },
    async connect() {
        const pool = await obterPool();
        return pool.connect();
    },
    async end() {
        const pool = poolAtivo;
        poolAtivo = null;
        if (pool) await pool.end();
    },
};

// Tenta conectar na inicialização apenas para logar o estado — sem interromper o boot
obterPool().catch((err) => console.error(err.message));

export default db;
