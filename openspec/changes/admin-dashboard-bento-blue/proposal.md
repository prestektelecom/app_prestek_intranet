## Why

A "Visão Geral do Painel" do AdminDashboard ainda usa a paleta âmbar/laranja legada (`bg-primary`, `from-primary to-orange-600`), criando inconsistência visual com todas as páginas da intranet que já foram migradas para o design system Bento Blue (Dashboard, Serviços, Colaboradores, Cobertura, Comunicados, Perfil e Configurações).

## What Changes

- KPI cards redesenhados com accent stripes coloridas (azul, ciano, verde) e tipografia ink Bento Blue
- Card destaque "Gerenciar Usuários" migrado de gradiente laranja para gradiente azul `#1F5BA8 → #4A9EF5`
- Cards secundários "Comunicados" e "Auditoria" com hover em azul ao invés de âmbar
- Link "Ver Tudo" nas Atividades Recentes de `text-primary` âmbar para `#4A9EF5`
- Ícone de log `create_comunicado` em azul bento ao invés de âmbar
- Background do `<main>` de warm stone para `#F5F9FF` (azul-gelo Bento Blue)
- Constante de cores `C` (Bento Blue tokens) adicionada inline no componente, seguindo o padrão do Dashboard.jsx

## Capabilities

### New Capabilities
- `admin-panel-overview-bento`: Visão Geral do Painel Admin com visual Bento Blue — KPIs, Atividades Recentes e cards de atalho no design system azul frio

### Modified Capabilities
<!-- Nenhuma — mudança puramente visual, sem alteração de requisitos funcionais -->

## Impact

- **Arquivo**: `src/components/AdminDashboard.jsx` (apenas a seção `abaAtiva === 'painel'` e o objeto `ICONE_ACAO`)
- **Sem impacto em APIs, backend ou lógica de negócio**
- **Sem impacto nos sub-componentes**: AdminUsuarios, AdminComunicados, AdminAuditoria, PlantaoHistorico
- **Header e sidebar do painel admin**: mantidos sem alteração (escopo A — apenas o conteúdo da visão geral)
