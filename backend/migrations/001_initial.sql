-- Preferências e configurações por usuário
CREATE TABLE IF NOT EXISTS usuarios_preferencias (
    id            SERIAL PRIMARY KEY,
    usuario_id    VARCHAR(50)  NOT NULL,   -- ID vindo da API IXC
    usuario_email VARCHAR(255) NOT NULL,
    chave         VARCHAR(100) NOT NULL,   -- ex: 'tema', 'idioma', 'notificacoes'
    valor         TEXT,                   -- valor da preferência
    criado_em     TIMESTAMPTZ  DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(usuario_id, chave)
);

-- Configurações globais do site (admin)
CREATE TABLE IF NOT EXISTS configuracoes_site (
    id         SERIAL PRIMARY KEY,
    chave      VARCHAR(100) NOT NULL UNIQUE,
    valor      TEXT,
    descricao  TEXT,
    alterado_por_id    VARCHAR(50),
    alterado_por_email VARCHAR(255),
    alterado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_pref_usuario_id ON usuarios_preferencias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pref_chave ON usuarios_preferencias(chave);
