-- Migration 022: vínculo opcional de um Processo nosso a um processo de
-- workflow do IXC (wfl_processo), e cache do assunto resolvido a partir da
-- primeira tarefa desse fluxo que efetivamente abre OS (wfl_tarefa ->
-- wfl_interacoes -> wfl_parametro_oss -> su_oss_assunto). Todas nullable:
-- a maioria dos processos existentes não terá vínculo. Resolvido sob
-- demanda (ver backend/services/ixc.js), nunca ao vivo a cada leitura —
-- por isso o cache (ixc_assunto_id/nome) fica na própria linha, não só o
-- id do processo do IXC.
ALTER TABLE processos ADD COLUMN IF NOT EXISTS ixc_wfl_processo_id INTEGER;
ALTER TABLE processos ADD COLUMN IF NOT EXISTS ixc_wfl_processo_nome VARCHAR(300);
ALTER TABLE processos ADD COLUMN IF NOT EXISTS ixc_assunto_id INTEGER;
ALTER TABLE processos ADD COLUMN IF NOT EXISTS ixc_assunto_nome VARCHAR(300);
ALTER TABLE processos ADD COLUMN IF NOT EXISTS ixc_resolvido_em TIMESTAMP;

COMMENT ON COLUMN processos.ixc_wfl_processo_id IS 'id do wfl_processo do IXC vinculado a este Processo, escolhido pelo admin. NULL = sem vínculo.';
COMMENT ON COLUMN processos.ixc_wfl_processo_nome IS 'Cache do wfl_processo.descricao no momento do vínculo, para exibir no formulário sem nova chamada ao IXC.';
COMMENT ON COLUMN processos.ixc_assunto_id IS 'id_assunto resolvido a partir da 1a tarefa do wfl_processo vinculado (ver resolverAssuntoWorkflow). Exibido na listagem no lugar do id interno.';
COMMENT ON COLUMN processos.ixc_assunto_nome IS 'Cache de su_oss_assunto.assunto (nome), só para exibição/tooltip.';
COMMENT ON COLUMN processos.ixc_resolvido_em IS 'Timestamp da última resolução bem-sucedida da cadeia de workflow.';
