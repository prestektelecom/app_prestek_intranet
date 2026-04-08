-- Tabela de Cobertura de Cidades
-- Os dados de cidade/bairro/tecnologia são inseridos manualmente via intranet
-- O campo percentual_cobertura representa a % de atendimento ou expansão
CREATE TABLE IF NOT EXISTS cobertura_cidades (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    estado CHAR(2) NOT NULL DEFAULT 'AL',
    cidade TEXT NOT NULL,
    bairro TEXT NOT NULL,
    tecnologia TEXT NOT NULL DEFAULT 'FTTH', -- FTTH, Rádio, UTP
    velocidade_maxima TEXT NOT NULL DEFAULT '100 MEGA',
    status TEXT NOT NULL DEFAULT 'Ativo', -- Ativo, Expansão, Inativo
    percentual_cobertura INT NOT NULL DEFAULT 100, -- 0 a 100
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados iniciais de exemplo
INSERT INTO cobertura_cidades (estado, cidade, bairro, tecnologia, velocidade_maxima, status, percentual_cobertura) VALUES
('AL', 'Delmiro Gouveia', 'Centro',         'FTTH',   '500 MEGA', 'Ativo',   98),
('AL', 'Batalha',         'Zona Rural',     'Rádio',  '20 MEGA',  'Ativo',   85),
('AL', 'Penedo',          'Santa Luzia',    'UTP',    '100 MEGA', 'Ativo',   92),
('AL', 'Delmiro Gouveia', 'Novo Horizonte', 'FTTH',   '300 MEGA', 'Expansão',45)
ON CONFLICT DO NOTHING;

-- Índice para buscas por cidade
CREATE INDEX IF NOT EXISTS idx_cobertura_cidades_cidade ON cobertura_cidades(cidade);
CREATE INDEX IF NOT EXISTS idx_cobertura_cidades_estado ON cobertura_cidades(estado);
