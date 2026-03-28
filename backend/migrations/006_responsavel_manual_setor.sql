-- Tabela para sobrescrever manualmente o responsável exibido por setor no Diretório
-- Tem prioridade máxima sobre a lógica automática de grupos supervisor
CREATE TABLE IF NOT EXISTS setor_responsavel_manual (
    id_setor      TEXT PRIMARY KEY,      -- ID do setor (empresa_setor.id no IXC)
    id_funcionario TEXT NOT NULL,        -- ID do funcionário responsável (funcionarios.id no IXC)
    nome          TEXT,                  -- Nome em cache para exibição rápida
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
