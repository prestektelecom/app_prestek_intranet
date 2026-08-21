-- Corrige coluna legada id_usuario na tabela auditoria_logs caso exista
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'auditoria_logs' AND column_name = 'id_usuario'
    ) THEN
        ALTER TABLE auditoria_logs ALTER COLUMN id_usuario DROP NOT NULL;
    END IF;
END $$;
