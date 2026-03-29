CREATE TABLE IF NOT EXISTS setores_descricoes (
    id_setor VARCHAR(50) PRIMARY KEY,
    descricao TEXT NOT NULL,
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_por VARCHAR(100)
);
