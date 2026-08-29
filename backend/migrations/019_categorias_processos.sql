-- Categorias de Processos, gerenciáveis por admin (antes era o array CATEGORIAS
-- hardcoded em src/data/processosData.js)
CREATE TABLE IF NOT EXISTS categorias_processos (
    id      VARCHAR(50) PRIMARY KEY,
    label   VARCHAR(200) NOT NULL,
    icon    VARCHAR(100) NOT NULL,
    prefixo VARCHAR(10),
    ordem   INTEGER NOT NULL DEFAULT 0
);

-- Dados iniciais migrados de processosData.js
INSERT INTO categorias_processos (id, label, icon, prefixo, ordem) VALUES
('atendimento', 'Atendimento ao Cliente',   'support_agent', 'AT',  1),
('noc',         'NOC / Infraestrutura',      'router',        'NOC', 2),
('vendas',      'Vendas Comercial',          'sell',          'VD',  3),
('financeiro',  'Financeiro',                'payments',      'FIN', 4),
('rh',          'Recursos Humanos',          'person',        'RH',  5),
('ti',          'Tecnologia da Informação',  'computer',      'TI',  6),
('operacoes',   'Operações Gerais',          'settings',      'OP',  7)
ON CONFLICT (id) DO NOTHING;
