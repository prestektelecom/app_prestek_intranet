-- Tabela de Plantões: Escala mensal de suporte
CREATE TABLE IF NOT EXISTS plantoes (
    id                SERIAL PRIMARY KEY,
    data              DATE NOT NULL UNIQUE,  -- Data do plantão
    horario_inicio    TIME DEFAULT '09:00',
    horario_fim       TIME DEFAULT '17:00',
    
    -- Referências aos usuários (vinculado ao funcionario_id da tabela usuarios_perfil)
    n1_id             VARCHAR(50), 
    n2_id             VARCHAR(50),
    gerente_id        VARCHAR(50),
    
    criado_em         TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em     TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_plantoes_data ON plantoes(data);

-- Dados de exemplo (Seed Data)
-- Supondo que o usuário Felix tenha um funcionario_id (precisamos verificar no banco se existe)
-- Se não existir, o frontend saberá tratar o 'Não atribuído'
INSERT INTO plantoes (data, horario_inicio, horario_fim)
VALUES ('2025-03-01', '09:00', '17:00')
ON CONFLICT (data) DO NOTHING;
