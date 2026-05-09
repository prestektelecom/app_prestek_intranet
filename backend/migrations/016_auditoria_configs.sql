-- Adapta tabela auditoria_logs ao novo schema (adiciona colunas admin se não existirem)
CREATE TABLE IF NOT EXISTS auditoria_logs (
    id              SERIAL PRIMARY KEY,
    acao            VARCHAR(100) NOT NULL,
    criado_em       TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE auditoria_logs ADD COLUMN IF NOT EXISTS admin_id    VARCHAR(50);
ALTER TABLE auditoria_logs ADD COLUMN IF NOT EXISTS admin_nome  VARCHAR(255);
ALTER TABLE auditoria_logs ADD COLUMN IF NOT EXISTS admin_email VARCHAR(255);
ALTER TABLE auditoria_logs ADD COLUMN IF NOT EXISTS entidade    VARCHAR(100);
ALTER TABLE auditoria_logs ADD COLUMN IF NOT EXISTS entidade_id VARCHAR(100);
ALTER TABLE auditoria_logs ADD COLUMN IF NOT EXISTS descricao   TEXT;

CREATE INDEX IF NOT EXISTS idx_auditoria_admin_id  ON auditoria_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_acao       ON auditoria_logs(acao);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado_em  ON auditoria_logs(criado_em DESC);

-- Tabela de configurações globais do sistema
CREATE TABLE IF NOT EXISTS configuracoes_globais (
    chave       VARCHAR(100) PRIMARY KEY,
    valor       TEXT         NOT NULL,
    descricao   TEXT,
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE configuracoes_globais ADD COLUMN IF NOT EXISTS atualizado_por VARCHAR(255);

INSERT INTO configuracoes_globais (chave, valor, descricao)
VALUES
    ('modo_manutencao', 'false', 'Ativa o modo manutenção, bloqueando acesso de usuários comuns'),
    ('timeout_sessao_min', '480', 'Tempo em minutos até expirar a sessão do usuário'),
    ('nome_sistema', 'Prestek Intranet', 'Nome exibido na intranet')
ON CONFLICT (chave) DO NOTHING;
