-- Tabela de histórico de alterações de plantões
CREATE TABLE IF NOT EXISTS plantoes_historico (
    id              SERIAL PRIMARY KEY,
    plantao_data    DATE NOT NULL,
    n1_anterior     VARCHAR(255),
    n2_anterior     VARCHAR(255),
    gerente_anterior VARCHAR(255),
    n1_novo         VARCHAR(255),
    n2_novo         VARCHAR(255),
    gerente_novo    VARCHAR(255),
    admin_usuario_id VARCHAR(50),
    admin_nome      VARCHAR(255),
    alterado_em     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plantoes_historico_data ON plantoes_historico(plantao_data);
CREATE INDEX IF NOT EXISTS idx_plantoes_historico_alterado_em ON plantoes_historico(alterado_em DESC);
