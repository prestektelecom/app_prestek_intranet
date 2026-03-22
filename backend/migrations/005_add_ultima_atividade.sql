-- Adiciona campo para rastrear a última atividade/ping do usuário
-- Usado para identificar quem está online em tempo real
ALTER TABLE usuarios_perfil ADD COLUMN IF NOT EXISTS ultima_atividade TIMESTAMPTZ;

-- Índice para busca rápida de usuários online
CREATE INDEX IF NOT EXISTS idx_perfil_ultima_atividade ON usuarios_perfil(ultima_atividade);
