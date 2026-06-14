## Why

A página de Comunicados da Empresa ainda usa a identidade visual "Warm Brown/Âmbar" original do projeto — paleta `#a17745`, backgrounds `#fcfaf8`, borders `#eaddcd` e tipografia genérica via Tailwind — enquanto todas as outras páginas principais (Dashboard, Serviços, Colaboradores e Cobertura) já foram migradas para o sistema visual "Bento Blue". Essa inconsistência cria uma experiência fragmentada para o usuário ao navegar entre seções do intranet.

## What Changes

- **Remoção da paleta âmbar**: todos os tokens de cor amber/orange/brown são substituídos pela paleta `C = { bg, surface, accent, ink, ... }` compartilhada com Dashboard e Directory.
- **Hero Banner**: substituição do cabeçalho simples por banner com gradiente azul (`accentDeep → accent`), grid SVG pattern, blur orbs, KPI pills glassmorphism (contagem por tipo: Urgente / Importante / Geral / Total) e campo de busca integrado.
- **Layout de cards**: substituição da timeline com linha vertical por um feed de cards estilo Bento — `border-radius: 18`, `border: 1px solid C.line`, `border-left` colorido por tipo, hover `translateY(-4px)` com shadow contextual.
- **Chips de filtro**: substituição dos pills Tailwind por ChipButtons estilo Directory com contagem por tipo e estado ativo com ring.
- **Ordenação**: select estilizado com look Bento (sem ícones amber, usando `C.ink2` e `C.accent`).
- **Modal CRUD**: header com gradiente azul, backdrop `blur(8px)`, inputs estilizados com `C.line`/`C.accentSoft`, select do tipo com labels de cor semântica.
- **Modal de exclusão**: redesenhado com `C.dangerSoft` e ícone `C.danger`, sem border amber.
- **Tipografia**: `"Plus Jakarta Sans"` para textos corridos, `"JetBrains Mono"` para labels, datas e metadados.
- **Skeletons de carregamento**: cards fantasmas animados durante o fetch inicial.
- **Estado vazio**: empty state centralizado com ícone `C.accentSoft` e botão "Limpar filtros".
- **Inline styles**: migração predominante de classes Tailwind para inline styles com tokens `C{}`, alinhado ao padrão dos demais componentes.

## Capabilities

### New Capabilities

- `comunicados-bento-hero`: Banner hero da página de Comunicados com gradiente azul, KPI pills glassmorphism e campo de busca integrado.
- `comunicados-card-feed`: Feed de cards Bento para exibição de comunicados com cores semânticas por tipo (Urgente/Importante/Geral), hover effects e link opcional.
- `comunicados-filter-chips`: Sistema de filtro por tipo com chips de contagem estilo Directory/Bento Blue.
- `comunicados-crud-modal`: Modal de criação/edição de comunicado redesenhado com tema Bento Blue (header gradiente, inputs `C.line`, select semântico).
- `comunicados-delete-modal`: Modal de confirmação de exclusão redesenhado com tema `C.danger`/`C.dangerSoft`.

### Modified Capabilities

*(Nenhuma capability de spec existente requer alteração de requisitos — apenas mudanças de implementação visual.)*

## Impact

- **Arquivo principal**: `src/components/Comunicados.jsx` — reescrita visual completa (lógica de negócio preservada integralmente).
- **Dependências de estilo**: nenhuma dependência externa nova; reutiliza tokens `C{}` e helper `tone()` já estabelecidos nos outros componentes.
- **CSS global**: nenhuma mudança necessária em `index.css`.
- **APIs**: sem impacto — `/api/comunicados` (GET, POST, PUT, DELETE) permanecem inalterados.
- **Componentes relacionados**: `Dashboard.jsx` → `ComunicadosCard` já usa Bento Blue e não é afetado.
