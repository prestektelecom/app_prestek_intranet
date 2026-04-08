-- Migration 011: adicionar cidade_ixc_id para vincular dados locais aos registros do IXC
-- Permite que o campo tecnologia/velocidade/status/percentual sejam manuais
-- enquanto cidade e bairro são descobertos automaticamente via API IXC

ALTER TABLE cobertura_cidades
    ADD COLUMN IF NOT EXISTS cidade_ixc_id TEXT,
    ADD COLUMN IF NOT EXISTS bairro_normalizado TEXT;

-- Índice de busca pelo ID da cidade no IXC
CREATE INDEX IF NOT EXISTS idx_cobertura_cidade_ixc ON cobertura_cidades(cidade_ixc_id);

-- Índice composto para upsert (cidade_ixc_id + bairro)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cobertura_ixc_bairro
    ON cobertura_cidades(cidade_ixc_id, bairro)
    WHERE cidade_ixc_id IS NOT NULL;
