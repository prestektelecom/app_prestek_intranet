# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Todos os colaboradores da Prestek Telecom, em toda a empresa — não é uma ferramenta de um único setor. Dois níveis de acesso:
- **Colaboradores em geral:** uso do dia a dia — conferir escalas de plantão, ler comunicados internos, localizar colegas/setores, abrir chamados de suporte, consultar cobertura de rede.
- **Admin / equipe de TI:** as mesmas telas, mais as áreas restritas (Painel Admin, seção TI) para gestão de usuários/permissões e operações de TI.

## Product Purpose

Centraliza operações da empresa que antes estavam espalhadas entre planilhas, WhatsApp e ferramentas improvisadas, em um único portal interno: escala de plantão (Plantão), comunicação interna (Comunicados), diretório de colaboradores/setores (Colaboradores, Setores), chamados de suporte (Meus Chamados), unidades (Escritórios) e consulta de cobertura de rede (Cobertura). O IXC (ERP/CRM de telecom da empresa) continua sendo a fonte de verdade no backend para dados de cliente, contrato e cobertura — o portal não substitui o IXC, ele é a camada que torna o resto da operação da empresa utilizável no dia a dia.

## Positioning

Não é um produto voltado ao mercado externo — não há concorrentes para se diferenciar. Seu valor está na consolidação interna: uma única superfície coerente e com identidade da marca, em vez de os colaboradores lidarem diretamente com o IXC somado a ferramentas informais para tudo que o IXC não cobre (informações tipo RH, comunicação, escalas, chamados).

## Operating Context

- Multi-unidade / multi-cidade: a Prestek opera em várias unidades e regiões de cobertura, não em uma única localidade (ver Escritórios, mapa de Cobertura com Leaflet + geocoding).
- A integração com o IXC está ativa no backend (services/ixc*.js) para cobertura, contratos, cidades/UF, taxonomias e funções — tratada como autoritativa, nunca mockada.
- A camada de banco de dados tem failover/replicação multi-host (documentado em docs/), refletindo necessidades de confiabilidade em produção.
- O login suporta persistência por sessão ou "lembrar-me", com `is_admin` controlando o acesso às telas restritas a administradores.
- Os usuários podem alternar entre um tema claro e quatro temas escuros distintos (Default Dark, Cyber-Obsidian, Deep-Space Aurora, AMOLED Pitch Black) — a escolha de tema é um recurso permanente do produto, não algo pontual.

## Capabilities and Constraints

- **O IXC é a fonte de verdade:** dados de cliente, contrato e cobertura sempre vêm da integração com o IXC e nunca devem ser mockados ou substituídos por dados estáticos no trabalho de produto.
- **Somente PT-BR:** não há internacionalização planejada; toda a interface e conteúdo permanecem em português do Brasil.
- **Multi-unidade / multi-cidade:** design e funcionalidades precisam funcionar em várias unidades/regiões da Prestek, sem assumir uma única localidade.
- Visibilidade por papel: algumas telas (Painel Admin, TI) são exclusivas de admin/TI e precisam continuar restritas.
- O dashboard usa `react-grid-layout` para posicionar os widgets, mas o layout é fixo (`isDraggable`/`isResizable` desligados) — os usuários não podem reorganizá-lo hoje. Um modo de edição chegou a ser construído e arquivado (`openspec/changes/archive/2026-05-25-dashboard-drag-and-drop`) e os endpoints de backend (`/api/user/dashboard-layout`) continuam de pé, mas uma reescrita posterior do Dashboard não manteve a UI de edição. Decisão de 2026-09-11 (Fase 3 do Impeccable): documentar como está, não reativar por ora.

## Brand Commitments

- Nome da empresa: Prestek Telecom.
- Existe um manual de marca vinculante em `src/docs/Manual-da-Marca-Prestek-Telecom.pdf` — suas restrições de logo, cor e voz são obrigatórias, não apenas uma referência de partida, para qualquer trabalho visual.
- A identidade visual atual (paleta, tipografia, estilo de componentes, temas escuros) já está documentada em `DESIGN.md`.

## Evidence on Hand

- Manual de marca em PDF: `src/docs/Manual-da-Marca-Prestek-Telecom.pdf`.
- Interface já existente e em produção em todas as telas listadas (é uma base de código estabelecida, não um projeto do zero).
- Não se aplicam depoimentos, clientes ou benchmarks fabricados — é uma ferramenta interna, sem alegações de marketing externas.

## Product Principles

1. Os dados do IXC são autoritativos — nunca falsificar ou duplicar o que o IXC já possui.
2. Um portal, uma identidade — consolidar ferramentas internas espalhadas em vez de somar mais uma.
3. Funciona igual em todas as unidades — nenhuma funcionalidade deve assumir uma única localidade ou região.
4. Fronteiras de papel/permissão são estruturais — telas exclusivas de admin/TI continuam restritas, não apenas escondidas.
5. Temas são um recurso, não uma casca — claro mais quatro temas escuros são uma capacidade permanente voltada ao usuário.
