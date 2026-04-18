CREATE TABLE IF NOT EXISTS responsaveis_manuais (
    id_setor VARCHAR(50) PRIMARY KEY,
    id_funcionario VARCHAR(50) NOT NULL,
    nome VARCHAR(255),
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
