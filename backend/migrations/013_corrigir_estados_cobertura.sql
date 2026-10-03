-- Migration 013: Correção de estados numéricos e constraint de validação
-- Os estados '7' (Alagoas) e '28' (Sergipe) foram inseridos com ID numérico do IXC
-- Este script corrige os dados e adiciona constraint de validação

-- 1. Corrigir registros com estado numérico: 7 = Alagoas, 28 = Sergipe
UPDATE cobertura_cidades
    SET estado = 'AL', updated_at = NOW()
    WHERE TRIM(estado) = '7';

UPDATE cobertura_cidades
    SET estado = 'SE', updated_at = NOW()
    WHERE TRIM(estado) = '28';

-- 2. Limpar quaisquer outros valores inválidos (fallback para AL)
UPDATE cobertura_cidades
    SET estado = 'AL', updated_at = NOW()
    WHERE TRIM(estado) NOT IN ('AL', 'SE');

-- 3. Adicionar constraint CHECK para garantir apenas AL e SE no futuro
-- (idempotente: só cria se a constraint ainda não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_estado_valido'
    ) THEN
        ALTER TABLE cobertura_cidades
            ADD CONSTRAINT chk_estado_valido
            CHECK (TRIM(estado) IN ('AL', 'SE'));
    END IF;
END $$;
