-- Adiciona coluna is_admin à tabela usuarios_perfil caso ainda não exista
ALTER TABLE usuarios_perfil
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_perfil_is_admin ON usuarios_perfil(is_admin);
