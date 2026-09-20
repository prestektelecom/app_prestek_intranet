-- Persistência real do CRUD de Processos (antes `PROCESSOS` era um array
-- estático vazio em src/data/processosData.js — criar/editar só mexia em
-- estado React local e sumia ao recarregar). Espelha o padrão já correto de
-- categorias_processos: colunas simples (não JSONB), sem tabela de auditoria
-- própria (essa tabela também não tem).
CREATE TABLE IF NOT EXISTS processos (
    id                          VARCHAR(20) PRIMARY KEY,
    nome                        VARCHAR(300) NOT NULL,
    descricao                   TEXT NOT NULL,
    categoria                   VARCHAR(50) NOT NULL REFERENCES categorias_processos(id),
    status                      VARCHAR(20) NOT NULL DEFAULT 'ativo',
    versao                      VARCHAR(20) NOT NULL DEFAULT '1.0',
    doc_url                     TEXT,
    responsavel_nome            VARCHAR(200),
    responsavel_setor           VARCHAR(200),
    responsavel_funcionario_id  VARCHAR(50),
    etapas                      INTEGER,
    tempo_estimado              VARCHAR(100),
    tags                        TEXT[] NOT NULL DEFAULT '{}',
    ultima_atualizacao          DATE,
    criado_em                   TIMESTAMP NOT NULL DEFAULT NOW()
);
