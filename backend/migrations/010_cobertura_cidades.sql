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
-- Só semeia com a tabela vazia: `run.js` reexecuta todas as migrations a cada rodada e esta
-- tabela não tem chave única além do `id` identity, então `ON CONFLICT DO NOTHING` nunca
-- dispara e cada rodada duplicava as linhas (mesmo problema já corrigido na 009).
INSERT INTO cobertura_cidades (estado, cidade, bairro, tecnologia, velocidade_maxima, status, percentual_cobertura)
SELECT * FROM (VALUES
('AL', 'Delmiro Gouveia', 'Centro',         'FTTH',   '500 MEGA', 'Ativo',   98),
('AL', 'Batalha',         'Zona Rural',     'Rádio',  '20 MEGA',  'Ativo',   85),
('AL', 'Penedo',          'Santa Luzia',    'UTP',    '100 MEGA', 'Ativo',   92),
('AL', 'Delmiro Gouveia', 'Novo Horizonte', 'FTTH',   '300 MEGA', 'Expansão',45)
) AS seed(estado, cidade, bairro, tecnologia, velocidade_maxima, status, percentual_cobertura)
WHERE NOT EXISTS (SELECT 1 FROM cobertura_cidades);

-- Índice para buscas por cidade
CREATE INDEX IF NOT EXISTS idx_cobertura_cidades_cidade ON cobertura_cidades(cidade);
CREATE INDEX IF NOT EXISTS idx_cobertura_cidades_estado ON cobertura_cidades(estado);
