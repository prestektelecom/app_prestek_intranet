-- Ajustes de equipe por setor, só na intranet (change setores-membros-manuais).
-- O IXC continua sendo a base: cada linha INCLUI uma pessoa num setor ou EXCLUI
-- uma pessoa que o IXC colocou lá. Apagar a linha devolve a pessoa ao IXC.
-- Sem seed: a tabela nasce vazia e o comportamento de hoje não muda.
-- Idempotente: migrations/run.js reexecuta todos os .sql a cada rodada.
CREATE TABLE IF NOT EXISTS setores_membros_manuais (
    id_setor       VARCHAR(50)  NOT NULL,
    id_funcionario VARCHAR(50)  NOT NULL,
    acao           VARCHAR(10)  NOT NULL CHECK (acao IN ('incluir', 'excluir')),
    nome           VARCHAR(255),
    atualizado_por VARCHAR(255),
    atualizado_em  TIMESTAMPTZ  DEFAULT NOW(),
    PRIMARY KEY (id_setor, id_funcionario)
);
