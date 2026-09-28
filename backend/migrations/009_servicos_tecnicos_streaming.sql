-- Tabela de Serviços Técnicos
CREATE TABLE IF NOT EXISTS servicos_tecnicos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    servico TEXT NOT NULL,
    valor TEXT,
    prazo TEXT,
    pagamento TEXT,
    icon TEXT DEFAULT 'build',
    is_free BOOLEAN DEFAULT false,
    is_special BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Pacotes de Streaming
CREATE TABLE IF NOT EXISTS pacotes_streaming (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    servico TEXT NOT NULL,
    valor TEXT,
    periodicidade TEXT DEFAULT 'Mensal',
    icon TEXT DEFAULT 'play_circle',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados iniciais - Serviços Técnicos
-- Só semeia com a tabela vazia: `run.js` reexecuta todas as migrations a cada rodada e estas
-- tabelas não têm chave única além do `id` identity, então `ON CONFLICT DO NOTHING`
-- nunca dispara e cada rodada duplicava as linhas.
INSERT INTO servicos_tecnicos (servico, valor, prazo, pagamento, icon, is_free, is_special)
SELECT * FROM (VALUES
('Instalação de roteador', 'R$ 50,00', 'Até 5 dias úteis', 'À vista ou 2x Boleto', 'router', false, false),
('Mudar roteador de local', 'R$ 30,00 + custo material', 'Até 5 dias úteis', 'À vista ou 2x Boleto', 'swap_horiz', false, false),
('Configurar roteador', 'R$ 50,00', 'Até 5 dias úteis', 'À vista ou 2x Boleto', 'settings', false, false),
('Manutenção interna', 'R$ 50,00', 'Até 5 dias úteis', 'À vista ou 2x Boleto', 'build', false, false),
('Mudar de titularidade', 'R$ 0,00', 'Até 24 horas', '', 'people', true, false),
('Mudar tecnologia', 'ℹ️ Consulte o NOC', '', '', 'info', false, true),
('Mudar senha no local', 'R$ 50,00', 'Até 5 dias', 'À vista ou 2x Boleto', 'password', false, false),
('Extensão de rede', 'Custo de material', 'Até 5 dias', 'À vista ou 1x Boleto', 'lan', false, false),
('IP fixo', 'R$ 99,90 À vista (ANUAL)', '24h', 'À vista (ANUAL) ou 12x R$9,90 junto mensalidade', 'dns', false, false),
('Roteador 360º WI-FI', 'R$ 50,00', 'Até 5 dias', 'Adicional mensal fatura: R$ 20,00', 'wifi_tethering', false, false),
('Alteração de senha WI-FI', '', 'Até 5 dias', '', 'wifi_lock', true, false),
('Trocar Comodato', 'R$ 50,00', 'Até 5 dias', 'À vista ou 2x Boleto', 'swap_vertical_circle', false, false),
('Solicitação de Comodato', 'R$ 50,00', 'Até 5 dias', 'À vista ou 2x Boleto', 'add_task', false, false)
) AS seed(servico, valor, prazo, pagamento, icon, is_free, is_special)
WHERE NOT EXISTS (SELECT 1 FROM servicos_tecnicos);

-- Dados iniciais - Pacotes de Streaming (mesma regra: só com a tabela vazia)
INSERT INTO pacotes_streaming (servico, valor, periodicidade, icon)
SELECT * FROM (VALUES
('LEVEDUCA', 'R$ 6,00', 'Mensal', 'school'),
('ITTV SMART MINI 32c', 'R$ 10,00', 'Mensal', 'smart_display'),
('ITTV SMART TOTAL 108c', 'R$ 20,00', 'Mensal', 'smart_display'),
('LEVEDUCA+WATCH+PARAMOUNT', 'R$ 19,90', 'Mensal', 'movie'),
('LEVEDUCA+WATCH+PARAMOUNT+ITTV 108c', 'R$ 29,90', 'Mensal', 'movie'),
('LEVEDUCA+WATCH+PARAMOUNT+MAX', 'R$ 39,90', 'Mensal', 'movie'),
('LEVEDUCA+WATCH+PARAMOUNT+MAX+ITTV 108c', 'R$ 66,00', 'Mensal', 'movie'),
('LEVEDUCA+WATCH+PARAMOUNT+MAX+PREMIERE+ITTV 102c', 'R$ 126,00', 'Mensal', 'sports_soccer')
) AS seed(servico, valor, periodicidade, icon)
WHERE NOT EXISTS (SELECT 1 FROM pacotes_streaming);

-- Índices
CREATE INDEX IF NOT EXISTS idx_servicos_tecnicos_id ON servicos_tecnicos(id);
CREATE INDEX IF NOT EXISTS idx_pacotes_streaming_id ON pacotes_streaming(id);
