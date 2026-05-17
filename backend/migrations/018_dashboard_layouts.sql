-- Migration 018: Tabela de layouts personalizados da Dashboard por usuário
-- Cada usuário pode ter suas preferências de widgets salvas como JSONB

CREATE TABLE IF NOT EXISTS user_dashboard_layouts (
    user_id VARCHAR(64) PRIMARY KEY,
    layout  JSONB       NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para buscas rápidas por user_id (já é PK, mas deixamos explícito)
CREATE INDEX IF NOT EXISTS idx_udl_user_id ON user_dashboard_layouts (user_id);

-- Comentário para documentação
COMMENT ON TABLE user_dashboard_layouts IS 'Armazena o layout personalizado da Dashboard de cada usuário (posição e tamanho dos widgets)';
COMMENT ON COLUMN user_dashboard_layouts.user_id IS 'ID do usuário (mesmo ID usado na autenticação)';
COMMENT ON COLUMN user_dashboard_layouts.layout IS 'Array JSON com configuração dos widgets: [{i, x, y, w, h}]';
