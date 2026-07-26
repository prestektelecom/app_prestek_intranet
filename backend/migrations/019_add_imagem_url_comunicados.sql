-- Migration 019: Adiciona coluna imagem_url na tabela comunicados
ALTER TABLE comunicados ADD COLUMN IF NOT EXISTS imagem_url TEXT;

COMMENT ON COLUMN comunicados.imagem_url IS 'URL opcional de imagem de capa/destaque para o comunicado';
