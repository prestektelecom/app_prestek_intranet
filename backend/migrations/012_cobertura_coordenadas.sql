-- Adiciona colunas de coordenadas geográficas ao bairro
ALTER TABLE cobertura_cidades
    ADD COLUMN IF NOT EXISTS latitude  NUMERIC(10,7),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);
