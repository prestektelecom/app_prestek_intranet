-- Perfil de usuário: dados vindos da API IXC, sincronizados no login
-- Armazena tanto os dados de usuarios quanto de funcionarios
CREATE TABLE IF NOT EXISTS usuarios_perfil (
    id                SERIAL PRIMARY KEY,
    usuario_id        VARCHAR(50)  NOT NULL UNIQUE,  -- ID da tabela usuarios IXC
    usuario_email     VARCHAR(255) NOT NULL,
    usuario_nome      VARCHAR(255),
    acesso_token      VARCHAR(255),

    -- Dados de Funcionário (tabela funcionarios IXC)
    funcionario_id    VARCHAR(50),
    funcionario_nome  VARCHAR(255),
    funcionario_email VARCHAR(255),
    id_funcao         VARCHAR(100),
    id_departamento   VARCHAR(50),
    filial_id         VARCHAR(50),
    fone_celular      VARCHAR(30),
    fone              VARCHAR(30),
    ramal             VARCHAR(20),
    data_nascimento   DATE,
    data_admissao     DATE,
    ativo             CHAR(1) DEFAULT 'S',
    foto_perfil       TEXT,

    -- Auditoria
    sincronizado_em   TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em     TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_perfil_usuario_id    ON usuarios_perfil(usuario_id);
CREATE INDEX IF NOT EXISTS idx_perfil_usuario_email ON usuarios_perfil(usuario_email);
