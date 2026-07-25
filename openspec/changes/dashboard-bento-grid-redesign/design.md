## Context

O Dashboard da Prestek Intranet é o ponto de entrada principal dos colaboradores e técnicos da empresa. Atualmente ele utiliza `react-grid-layout` para permitir posicionamento livre dos cards, mas a disposição default e o design visual básico (Material Design 3 parcial) deixam o layout desorganizado e sem destaque para os fluxos mais importantes do dia a dia (especialmente o volume de Ordens de Serviço sob responsabilidade do usuário).

## Goals / Non-Goals

**Goals:**
- Redesenhar os componentes em `src/components/Dashboard.jsx` adotando a estética **Bento Grid Rico & Dinâmico (Apple/Stripe)**.
- Reestruturar o `DEFAULT_LAYOUT_LG` do `react-grid-layout` para colocar em primeiro plano:
  1. Hero Inteligente com saudaçao + botão de criar chamado
  2. Card de OS no meu nome (tamanho expandido w:6 h:2)
  3. Card de Comunicados Urgentes (w:6 h:3 com banner hero interno)
- Aplicar tokens visuais de glassmorphism, cantos arredondados `rounded-2xl`, bordas semi-transparentes e efeito de brilho `bento-hover-border`.
- Preservar 100% das integrações com as APIs de backend existentes (`/api/colaboradores`, `/api/ixc/su-ticket/list`, `/api/comunicados`, etc.).

**Non-Goals:**
- Modificar endpoints no backend `server.js` ou alterar a estrutura do banco SQLite.
- Remover o recurso de drag-and-drop do `react-grid-layout` (ele continua funcional para customização do usuário).

## Decisions

1. **Decisão: Layout Bento Focado em Utilidade**
   - *Alternativa considerada*: Manter a ordem atual (Hero grande topo -> 3 KPIs lado a lado -> Comunicados/Atalhos).
   - *Escolha*: Hero compacto funcional no topo (w:12 h:2) seguido por 2 colunas principais (OS no meu nome w:6 + Comunicados w:6).
   - *Razão*: Os técnicos precisam ver imediatamente quantas OS estão pendentes e quais são os avisos da empresa.

2. **Decisão: Glassmorphism via Tailwind sem novas bibliotecas**
   - *Alternativa considerada*: Instalar biblioteca externa de componentes UI.
   - *Escolha*: Usar utilitários Tailwind nativos (`bg-surface/80`, `backdrop-blur-md`, `border-border/60`) combinados com a classe `bento-hover-border` já configurada no `index.css`.
   - *Razão*: Mantém o bundle leve e garante consistência total com o tema dark/light da intranet.

## Risks / Trade-offs

- **[Risco]** Usuários com layout personalizado salvo no `localStorage` podem manter a ordem antiga de cards.
  - *Mitigação*: Versionar a chave do layout salvo para `dashboardLayout_v2`, garantindo que o novo Bento Grid seja o padrão inicial para todos os colaboradores.
