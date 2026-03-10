CREATE TABLE IF NOT EXISTS comunicados (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- "Urgente", "Importante", "Geral"
    departamento_autor VARCHAR(100) NOT NULL,
    link_opcional VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por VARCHAR(100) -- Pode ser ID ou nome do Admin
);
