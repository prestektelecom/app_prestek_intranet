-- Permissões de gestão por capacidade (change permissoes-por-capacidade).
-- is_admin = true continua valendo como "todas": não há seed, a tabela nasce vazia.
-- O catálogo de capacidades vive em backend/middleware/permissoes.js, sem CHECK
-- aqui, para acrescentar uma capacidade não exigir nova migration.
-- Idempotente: migrations/run.js reexecuta todos os .sql a cada rodada.
CREATE TABLE IF NOT EXISTS usuarios_permissoes (
    usuario_id    VARCHAR(50)  NOT NULL REFERENCES usuarios_perfil(usuario_id) ON DELETE CASCADE,
    permissao     VARCHAR(50)  NOT NULL,
    concedido_por VARCHAR(255),
    concedido_em  TIMESTAMPTZ  DEFAULT NOW(),
    PRIMARY KEY (usuario_id, permissao)
);
