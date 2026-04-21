## Context

O componente `Schedule.jsx` é responsável pela exibição e gerenciamento da escala de plantão da Prestek Intranet. Antes desta mudança, o componente era um arquivo único monolítico (~500 linhas), sem suporte a gerenciamento de turnos pela interface, com calendário com dias desalinhados e título pouco descritivo. O sistema usa React + Tailwind CSS + Material Design 3.

## Goals / Non-Goals

**Goals:**
- Melhorar a clareza da interface com título "Visão Geral da Escala"
- Corrigir alinhamento do calendário semanal
- Implementar modal de gerenciamento de plantão com CRUD completo
- Filtrar funcionários por departamento no modal
- Suportar fechamento do modal via click-outside
- Refatorar o componente em subcomponentes para manutenibilidade

**Non-Goals:**
- Integração com APIs externas de calendário
- Sistema de notificações push para plantões
- Drag-and-drop de turnos entre dias
- Versão mobile dedicada (responsividade básica apenas)

## Decisions

**D1: Refatoração em subcomponentes dentro do mesmo arquivo Schedule.jsx**
- Decisão: Manter subcomponentes no mesmo arquivo ao invés de criar arquivos separados
- Razão: O projeto tem arquivos de componente grandes como padrão; separar aumentaria a complexidade de imports sem benefício imediato
- Alternativa descartada: Um arquivo por subcomponente (maior overhead de organização)

**D2: Filtro de departamento hardcoded para N1 → ATENDIMENTO/NOC**
- Decisão: Filtrar `employees` pelo campo `department === 'ATENDIMENTO/NOC'` quando o cargo for N1
- Razão: Regra de negócio clara e estável; não justifica configuração dinâmica
- Alternativa descartada: Tabela de mapeamento cargo→departamento no backend

**D3: Click-outside via referência React (useRef)**
- Decisão: Usar `useRef` no container do modal e `mousedown` listener no `document`
- Razão: Padrão React idiomático, sem dependências externas
- Alternativa descartada: Overlay semi-transparente como elemento clicável (menos acessível)

**D4: Material Design 3 via Tailwind CSS customizado**
- Decisão: Usar classes Tailwind existentes com variantes `backdrop-blur`, `ring`, `shadow-xl`
- Razão: Projeto já usa Tailwind; não justifica adicionar biblioteca MD3 completa
- Alternativa descartada: Importar componentes do Material UI

## Risks / Trade-offs

- **[Risco] Arquivo Schedule.jsx muito grande** → Mitigação: Extrair subcomponentes como funções dentro do arquivo; considerar separação em arquivos futuros se ultrapassar 300 linhas por subcomponente
- **[Risco] Filtro por departamento pode quebrar se o nome do departamento mudar** → Mitigação: Centralizar a constante de departamento no topo do componente
- **[Trade-off] Click-outside não fecha com ESC** → Aceito por ora; adicionar no próximo ciclo junto com acessibilidade ARIA
