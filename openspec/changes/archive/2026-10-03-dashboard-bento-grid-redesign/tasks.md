## 1. Estilizaçao e Design Tokens

- [x] 1.1 Em `src/index.css`, revisar e aprimorar utilitários para glassmorphism (`backdrop-blur-md`, `bg-surface/80`) e adaptar a classe `bento-hover-border` para transiçoes suaves de 300ms.

## 2. Redesenho do Hero Card Inteligente

- [x] 2.1 Refatorar o componente `HeroCard` em `src/components/Dashboard.jsx` para exibir saudaçao dinâmica ("Bom dia/Boa tarde"), nome do usuário, cargo e o botão proeminente `+ Abrir Chamado TI` que abre o `TiSupportModal`.
- [x] 2.2 Integrar o indicador de alerta técnico e widget de horário/localidade no topo do Hero Card.

## 3. Redesenho dos Cards Bento (OS, Comunicados e KPIs)

- [x] 3.1 Refatorar `OsBento` para o novo formato Bento expandido, destacando a contagem de Ordens de Serviço sob responsabilidade do usuário, pílula de alerta para prazos de hoje e botão de açao principal.
- [x] 3.2 Refatorar `ComunicadosCard` para exibir o banner hero no topo ("Featured") para o aviso mais recente e lista compacta para os demais.
- [x] 3.3 Refatorar `KpiCard`, `PlantaoBento` e `AtalhosCard` aplicando a estilizaçao Bento Glassmorphism com cantos `rounded-2xl` e numerais tabulares.

## 4. Reorganizaçao do Layout Bento (react-grid-layout)

- [x] 4.1 Atualizar a constante `DEFAULT_LAYOUT_LG` e demais breakpoints em `Dashboard.jsx` posicionando o Hero no topo, seguido pelas duas colunas principais (OS no meu nome + Comunicados) e cards secundários na base.
- [x] 4.2 Atualizar a chave de suporte do `localStorage` para `dashboardLayout_v2` garantindo que todos os usuários recebam o novo layout Bento por padrão.

## 5. Verificaçao e Testes

- [x] 5.1 Verificar a responsividade do Bento Grid nos breakpoints `lg`, `md` e `sm` (mobile).
- [x] 5.2 Confirmar que a alternância entre temas Light e Dark respeita o glassmorphism e as bordas de hover glow.
