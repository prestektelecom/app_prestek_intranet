-- Caixa de sugestões (change caixa-de-sugestoes).
-- Sem seed: a tabela nasce vazia. `tipo` e `status` são validados no backend
-- (backend/services/sugestoes.js), sem CHECK aqui, para acrescentar um valor
-- não exigir nova migration.
-- Idempotente: migrations/run.js reexecuta todos os .sql a cada rodada.
CREATE TABLE IF NOT EXISTS sugestoes (
    id             SERIAL       PRIMARY KEY,
    usuario_id     VARCHAR(50)  NOT NULL REFERENCES usuarios_perfil(usuario_id) ON DELETE CASCADE,
    usuario_nome   VARCHAR(255),
    tipo           VARCHAR(20)  NOT NULL,
    titulo         VARCHAR(120) NOT NULL,
    descricao      TEXT         NOT NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'nova',
    resposta       TEXT,
    respondido_por VARCHAR(255),
    criado_em      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sugestoes_usuario ON sugestoes (usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_sugestoes_status  ON sugestoes (status);
