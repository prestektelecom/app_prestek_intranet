-- Tabela de escritórios/unidades da Prestek
CREATE TABLE IF NOT EXISTS escritorios (
    id        SERIAL PRIMARY KEY,
    nome      VARCHAR(120) NOT NULL,
    tipo      VARCHAR(30)  NOT NULL DEFAULT 'Filial',
    cidade    VARCHAR(80)  NOT NULL,
    estado    CHAR(2)      NOT NULL,
    endereco  TEXT         NOT NULL DEFAULT '',
    cep       VARCHAR(9)   NOT NULL DEFAULT '',
    lat       NUMERIC(10, 7) NOT NULL,
    lng       NUMERIC(10, 7) NOT NULL,
    cor       VARCHAR(20)  NOT NULL DEFAULT '#3B82F6'
);

-- Dados iniciais migrados de officesData.js
INSERT INTO escritorios (id, nome, tipo, cidade, estado, endereco, cep, lat, lng, cor) VALUES
(1,  'PENEDO/AL (MATRIZ)',          'Matriz', 'Penedo',                'AL', 'Rodovia Mário Freire Leahy, 1658 - Sr. do Bonfim',      '57200-000', -10.2892274, -36.5635948, '#F97316'),
(2,  'PENEDO/AL (CENTRO)',          'Filial', 'Penedo',                'AL', 'Av. Duque de Caxias, 253 - Centro Histórico',           '57200-000', -10.2938214, -36.5834007, '#3B82F6'),
(3,  'SÃO SEBASTIÃO/AL',           'Filial', 'São Sebastião',         'AL', 'Av. Antônio Custódio Pôrto, 171',                       '57275-000',  -9.9328346, -36.5461990, '#3B82F6'),
(4,  'PIAÇABUÇU/AL',               'Filial', 'Piaçabuçu',             'AL', 'R. João S de Góis, 102',                                '57400-000', -10.4073687, -36.4335175, '#3B82F6'),
(5,  'IGREJA NOVA/AL',              'Filial', 'Igreja Nova',           'AL', 'R. Pedro Falcão, 48',                                   '57770-000', -10.1290228, -36.6565893, '#3B82F6'),
(6,  'CORURIPE/AL',                 'Filial', 'Coruripe',              'AL', 'R. da Oliveira, 34-172 - Vila do Mansinho',             '57230-000', -10.1259276, -36.1772811, '#3B82F6'),
(7,  'SÃO MIGUEL DOS CAMPOS/AL',   'Filial', 'São Miguel dos Campos', 'AL', 'Lot. Hélio Jatobá II, QD L2, Nº 57',                   '57140-000',  -9.7971413, -36.1030027, '#3B82F6'),
(9,  'PORTO REAL DO COLÉGIO/AL',   'Filial', 'Porto Real do Colégio', 'AL', 'R. da Alegria',                                         '57760-000', -10.1863448, -36.8381432, '#3B82F6'),
(10, 'BATALHA/AL',                  'Filial', 'Batalha',               'AL', 'Av. Mair Guedes do Amaral, 146 - Centro',              '57420-000',  -9.6735735, -37.1243748, '#3B82F6'),
(12, 'MAJOR ISIDORO/AL',            'Filial', 'Major Isidoro',         'AL', 'R. Cícero Ferreira de Souza, Sn, Centro',              '57460-000',  -9.5315730, -36.9850424, '#3B82F6'),
(13, 'NEÓPOLIS/SE',                 'Filial', 'Neópolis',              'SE', 'R. Dr. Eronildes de Carvalho, 249 - Centro',           '49160-000', -10.3187084, -36.5776939, '#10B981'),
(14, 'ILHA DAS FLORES/SE',          'Filial', 'Ilha das Flores',       'SE', 'Av. Barão do Rio Branco, 40, Centro',                  '49190-000', -10.4348696, -36.5372180, '#10B981'),
(15, 'PROPRIÁ/SE',                  'Filial', 'Propriá',               'SE', 'R. Nilo Peçanha, 1640',                                '49300-000', -10.2135397, -36.8286745, '#10B981'),
(16, 'JAPOATÃ/SE',                  'Filial', 'Japoatã',               'SE', 'R. Dr. Augusto Falcão - Centro',                       '49950-000', -10.3451951, -36.7985175, '#10B981'),
(17, 'CEDRO DE SÃO JOÃO/SE',        'Filial', 'Cedro de São João',     'SE', 'R. Antônio Batista',                                   '49370-000', -10.2506132, -36.8813442, '#10B981'),
(18, 'PORTO CALVO/AL',              'Filial', 'Porto Calvo',           'AL', 'Av. Camaçari, 32 B',                                   '57230-000',  -9.0530421, -35.4215053, '#3B82F6')
ON CONFLICT (id) DO NOTHING;

-- Garante que a sequência do SERIAL não colide com os IDs inseridos manualmente
SELECT setval('escritorios_id_seq', (SELECT MAX(id) FROM escritorios));
