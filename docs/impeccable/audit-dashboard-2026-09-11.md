# Audit técnico — Dashboard (Fase 3 do programa Impeccable)

Data: 2026-09-11 · Alvos: `src/components/Dashboard.jsx`, `src/components/TiSupportModal.jsx`, `src/components/ui/glowing-effect.tsx`, `src/components/common/`.
Evidência: `impeccable detect --json` (13 advisory, exit 0), overlay do detector injetado em 3 vistas (Avaliação B da crítica do mesmo dia), medições no navegador (Playwright, `localhost:5000`, dois papéis — técnico de campo/admin e colaboradora comum/RH — 1440×900 e 390×844, claro/Default Dark/AMOLED), simulação de falha de rede via `page.route().abort()` em dois widgets simultâneos, teste de teclado no `TiSupportModal` e no carrossel/lista de comunicados. Capturas em `.playwright-mcp/critA-dash-*.png`, `critB-dash-*.png`.

## Placar

| # | Dimensão | Nota | Achado-chave |
|---|---|---|---|
| 1 | Acessibilidade | 2 | `TiSupportModal` sem `role`/`aria-modal`/`aria-labelledby`, sem trap de foco (Tab visita 4 elementos de fundo antes do modal) e sem Escape; badges de estado (sucesso 3,82:1, aviso 2,84:1) abaixo de 4,5:1; carrossel e lista de comunicados já corrigidos (foco visível, `role="button"`, pausa por foco) |
| 2 | Performance | 3 | `GlowingEffect` usa um único listener de `pointermove` compartilhado no `document.body` (não um por card, como uma crítica anterior presumia); estados de erro e retry testados ao vivo em dois widgets simultâneos, sem travar a UI; sem otimização de imagem nos avatares de aniversariantes (fallback para iniciais cobre bem) |
| 3 | Design responsivo | 3 | Sobreposição antiga SetorBento/PlantaoBento em xs corrigida (verificado a 390px); botão "Gerenciar Meus Chamados" mede 35px de altura no celular, abaixo do piso de toque de 44px; 2px de overflow horizontal medido só na vista mobile |
| 4 | Tema | 2 | Botão de ação principal do OS invisível no claro (branco sobre branco) por colisão de utilitários Tailwind, mascarado por acidente no escuro; `GlowingEffect` com 4 cores hardcoded fora da paleta (`#dd7bbb`, `#d79f1e`, `#5a922c`, `#4c7894`) nos 9 usos do Dashboard; badges usam o token "de gráfico" (`--success-bento`) em vez do "de texto" (`--success-strong`) que o próprio DESIGN.md já documenta como correção necessária |
| 5 | Integridade da implementação | 2 | Grid "customizável" do PRODUCT.md travado (`isDraggable`/`isResizable` hardcoded `false`), com endpoints de backend e CSS do modo de edição ainda vivos e não usados; constante `CARD`/`bento-hover-border` (a versão on-brand do hover) escrita e nunca usada; anotação do IXC vazando para nome de aniversariante; 3 requisições redundantes na carga (`/api/comunicados` ×2, `/api/departamentos-empresa` ×2) |
| **Total** | | **12/20** | **Aceitável (10–13)** |

## Veredito de integridade

**Aprovado com ressalvas.** O Dashboard evoluiu de forma real desde a última rodada (13 → 15 → 26/40 na crítica; os 3 P0 antigos verificados corrigidos ao vivo), e os estados de erro são hoje um dos pontos mais fortes do produto: falha de rede simulada em dois widgets ao mesmo tempo produz mensagem clara e retry funcional nos dois, sem exceção crua. A ressalva central é uma regressão silenciosa: o botão de ação primária do widget mais visto da tela ficou branco sobre branco por uma colisão de classes CSS que ninguém percebeu porque o mesmo bug "funciona por acidente" no tema escuro. A segunda ressalva é de coerência de marca: o gesto de interação mais repetido da tela (o brilho de hover, presente em 9 lugares) é literalmente a demonstração de um componente de terceiro, nunca recolorido, enquanto a versão correta já existe no arquivo e não é usada. A terceira é de integridade produto-código: o PRODUCT.md descreve um grid customizável como capacidade permanente, e a tela hoje não entrega isso, com os endpoints de backend correspondentes ainda de pé e não chamados.

## Sumário executivo

- Placar: **12/20** (Aceitável)
- Issues: **1 P0 · 4 P1 · 5 P2 · 4 P3**
- Top 5: (1) botão de ação invisível no claro (colisão `bg-surface`/`bg-primary`); (2) modal de Suporte de TI sem semântica nem foco; (3) brilho de hover fora da marca nos 9 cards; (4) badges de estado abaixo do contraste AA; (5) grid travado contra o PRODUCT.md, com backend pronto e não usado
- Próximos passos: `harden` (botão, modal, badges) → `colorize` (glow) → `clarify` (decisão do grid) → `polish`

## Achados por severidade

### P0

**[P0] Botão de ação principal do widget mais visto é invisível no tema claro**
- Local: `Dashboard.jsx:18` (`ACTION_BTN` contém `bg-surface`), `:356-361` (override concatena `bg-primary` na mesma string de classe).
- Categoria: Tema / Acessibilidade. WCAG 1.4.3.
- Impacto: medido nos dois agentes de forma independente — `background-color: rgb(255,255,255)`, `color: rgb(255,255,255)`, contraste 1,0:1. `bg-surface` e `bg-primary` têm a mesma especificidade CSS; quem vence é a ordem na folha gerada, não a ordem na string de classe, e `bg-surface` vence sempre. No claro o botão simplesmente não existe visualmente, embora continue clicável; no escuro o mesmo bug passa despercebido porque `--surface` escuro também combina com texto branco.
- Recomendação: remover a duplicidade de `bg-*`/`border-*` entre `ACTION_BTN` e o override; criar `ACTION_BTN_PRIMARY` sem os utilitários de base, ou usar `tailwind-merge` para resolver o conflito de forma determinística.
- Comando: `/impeccable harden`

### P1

**[P1] `TiSupportModal` sem semântica de diálogo nem gerenciamento de foco**
- Local: `TiSupportModal.jsx` (arquivo inteiro).
- Categoria: Acessibilidade. WCAG 2.4.3, 4.1.2.
- Medido: `role`, `aria-modal`, `aria-labelledby` todos `null`; Tab a partir do botão que abre visita 4 elementos de fundo (Meu Perfil, Comunicados, 2 links de rodapé) antes de qualquer controle do modal; Escape não fecha.
- Recomendação: migrar para o `ModalShell` compartilhado (documentado no DESIGN.md) ou replicar seu contrato: `role="dialog"`, `aria-modal`, `aria-labelledby`, foco inicial dentro do modal, trap de Tab, Escape fechando.
- Comando: `/impeccable harden`

**[P1] Brilho de hover fora da marca nos 9 `GlowingEffect` do Dashboard**
- Local: `ui/glowing-effect.tsx:193-204` (rosa `#dd7bbb`, dourado `#d79f1e`, verde `#5a922c`, azul-acinzentado `#4c7894`); consumido em `Dashboard.jsx` (KpiCard ×3, OsBento, PlantaoBento, ComunicadosCard, AtalhosCard, AniversariantesCard, TeamBento).
- Categoria: Tema / Integridade.
- Detector: 4 findings `design-system-color`, sem exceção registrada em `ignore.md`.
- Recomendação: trocar pela classe `bento-hover-border` (já correta, no token `CARD` de `Dashboard.jsx:17`, hoje não usada) ou recolorir o componente para os tokens do tema.
- Comando: `/impeccable colorize`

**[P1] Badges de estado sobre fundo "-soft" abaixo do contraste AA**
- Local: `Dashboard.jsx:23` (`KpiCard.toneClasses`), `:276-278` (badge do `OsBento`).
- Categoria: Acessibilidade. WCAG 1.4.3.
- Medido: verde "Tudo em dia" 3,82:1 no claro; amarelo "IMPORTANTE" 2,84:1. O DESIGN.md já resolveu esse padrão exato com os tokens `-strong`, não usados aqui.
- Recomendação: trocar `--success-bento`/`--warning-bento`/`--danger-bento` por `--success-strong`/`--warning-strong`/`--danger-strong` em texto sobre fundo `-soft`.
- Comando: `/impeccable harden`

**[P1] Grid "customizável" do PRODUCT.md travado, sem UI de edição**
- Local: `Dashboard.jsx:1316-1317` (`isDraggable={false}`, `isResizable={false}`); `index.css` (`.layout.is-editing` morto); `backend/server.js:4112-4151` (`/api/user/dashboard-layout` GET/POST ainda funcionam).
- Categoria: Integridade de produto.
- Impacto: uma change anterior (`archive/2026-05-25-dashboard-drag-and-drop`) implementou essa capacidade por completo; uma reescrita posterior do Dashboard a removeu da UI sem atualizar o PRODUCT.md nem remover o código morto associado.
- Recomendação: decisão de produto explícita — reativar o modo de edição ou atualizar o PRODUCT.md e registrar a decisão com dono e data em `MEMORIA.md`.
- Comando: `/impeccable clarify`

### P2

**[P2] Anotação do IXC vazando para nome de aniversariante**: `AniversariantesCard` exibiu "(férias) Costa" ao vivo; `nomeCurto()`/`nomeFormatado()` (`Dashboard.jsx:896-918`) não filtram parênteses do cadastro. `/impeccable clarify`

**[P2] Três requisições redundantes na carga**: `/api/comunicados` buscado de forma independente em `ComunicadoBanner` (`:388`) e `ComunicadosCard` (`:655`); `/api/departamentos-empresa` buscado em `AniversariantesCard` e `TeamBento`. `/impeccable optimize`

**[P2] Rodapé com dois links mortos**: "Política de Privacidade" e "Diretrizes Internas" (`Dashboard.jsx:1346-1347`) em `href="#"`. `/impeccable clarify`

**[P2] Carrossel de comunicados sem `aria-live`**: a troca automática de slide não é anunciada a quem não está com foco no card. `/impeccable harden`

**[P2] Variação de KPI sem teto de exibição**: `-929%` observado com dado de teste de base pequena; nenhum tratamento visual amortece um número de 3-4 dígitos num badge desenhado para `±NN%`. `/impeccable polish`

### P3

- **[P3] Tamanhos fora da rampa** (detector, 9 ocorrências): 9 a 17px em rótulos, chips e datas do feed de comunicados e do widget de colaboradores. `/impeccable typeset`
- **[P3] `layout-transition` no próprio Dashboard.jsx**, fora da exceção do config (que só cobre `Sidebar.jsx`). Registrar exceção ou remover a transição de `width`/`height`. `/impeccable polish`
- **[P3] Alvos abaixo de 44px no celular**: setas do carrossel (17×20, 13×20), indicador (21×24), fechar (20×27), dots (8×8), "Ver todos" (79×20). `/impeccable adapt`
- **[P3] `clipped-overflow-container` e `gpt-thin-border-wide-shadow`** (detector). `/impeccable polish`

## Padrões sistêmicos

1. **Colisão de utilitários Tailwind de mesma especificidade apagando um controle** — primeira ocorrência verificada no produto (o botão do OsBento). Vale conferir se o mesmo padrão de concatenar uma constante de estilo com um override de cor aparece em outros CTAs "primary" fora do chrome (Serviços, Cobertura).
2. **Componente de terceiro não recolorido para a marca** — o mesmo padrão do Login (Fase 2, ilustração Lottie) e potencialmente de outros componentes de `ui/` vindos de bibliotecas de exemplo (Aceternity-style). Conferir `GlowingEffectDemo.jsx` e qualquer outro import de `ui/` ainda não auditado.
3. **Token "de gráfico" usado como cor de texto** — já era transversal desde a Fase 1 (`C.muted`); agora confirmado também para `success`/`warning`/`danger` (`-bento` vs `-strong`) no Dashboard. Regra candidata para o DESIGN.md: tokens `-bento` nunca em texto, só em ícone ou elemento gráfico ≥ 3:1.
4. **Capacidade de produto documentada e não entregue** — o grid customizável é o segundo caso desse tipo depois da tagline/SSO do Login (Fase 2). Revisar o PRODUCT.md inteiro contra o código na Fase 16, não só ao final do programa.

## Pontos positivos

- **Estados de erro de primeira classe**: falha de rede simulada em dois widgets simultâneos rendeu mensagem clara e retry funcional nos dois, sem exceção técnica exposta.
- **"sem_dados" tratado como dado**: verificado ao vivo com a persona de RH, "Eficiência: N/A" limpo, sem erro fabricado — a correção da Fase anterior continua de pé.
- **Horário de plantão real**: backend agora seleciona `horario_inicio`/`horario_fim`; sem fallback inventado, "Horário a confirmar" quando ausente.
- **Carrossel e lista de comunicados acessíveis**: `role="button"`, `aria-label` descritivo, foco visível, pausa por hover e por foco juntos — os três P0 antigos de teclado seguem corrigidos.
- **`GlowingEffect` com um só listener compartilhado** (`document.body`, `pointermove`, `passive: true`), não um por card como uma crítica anterior presumia — a implementação é mais eficiente do que parecia, mesmo com a cor errada.
- **Atalhos sem destino desabilitados com clareza**: "Holerite"/"Ponto"/"Ferias" marcados `emBreve: true` em vez do antigo `url: '#'` que abria aba em branco.

## Ações recomendadas

1. **[P0] `/impeccable harden`**: resolver a colisão `bg-surface`/`bg-primary` no botão do OsBento.
2. **[P1] `/impeccable harden`**: `TiSupportModal` com `role="dialog"`, foco e Escape; badges com os tokens `-strong`; `aria-live` no carrossel.
3. **[P1] `/impeccable colorize`**: `GlowingEffect` do Dashboard na paleta da marca (`bento-hover-border` ou recoloração dos tokens).
4. **[P1] `/impeccable clarify`**: decisão sobre o grid customizável (reativar ou atualizar o PRODUCT.md).
5. **[P2] `/impeccable clarify`**: nome de aniversariante sem anotação do IXC; rodapé sem links mortos.
6. **[P2] `/impeccable optimize`**: unificar os fetches redundantes de comunicados e departamentos.
7. **`/impeccable polish`**: passagem final nos cinco temas e nos dois viewports.

Re-rodar `/impeccable audit` e `/impeccable critique` depois da change para registrar a tendência (12/20 → alvo 16+; 26/40 → alvo 30+).

## Nota adicional (durante a correção, 2026-09-11)

Achado fora do escopo desta change, não reportado por nenhuma das duas avaliações (não foi exercitado nos testes ao vivo): `TAG_DEFAULT.chip` (`Dashboard.jsx:465`, fallback do carrossel de comunicados para qualquer `tipo` fora de `Urgente`/`Importante`/`Aviso`/`Geral`/`Info`) usa `bg-primary text-white` — o mesmo padrão branco-sobre-laranja em texto pequeno (10px) que o botão do OS tinha. É um caminho de fallback raro (o backend normalmente envia um dos cinco tipos conhecidos) e está amarrado a uma decisão pré-existente e maior (as cores categóricas do carrossel usam uma paleta própria, fora do accent único da marca, para as cinco categorias). Registrado para a rodada de polish; não corrigido nesta change para não abrir uma frente de redesenho das cores de categoria sem decisão explícita.

## Nota adicional 2 (durante a verificação final, 2026-09-11)

O mesmo `GlowingEffect` fora da marca também aparece em `src/components/common/BentoCard.jsx:25-32` (sem `variant`, portanto a paleta rosa/dourado/verde/azul), componente compartilhado consumido por 6 arquivos da área de Serviços (`ServicesDirectory.jsx`, `PlansGrid.jsx`, `PlanoBentoCard.jsx`, `StreamingBentoCard.jsx`, `TechBentoCard.jsx`, `ServiceDetailModal.jsx`) — fora do escopo desta change (Dashboard), mas a mesma causa raiz. A variante `brand` criada nesta change já cobre esse caso: trocar `BentoCard.jsx` para `variant="brand"` é a correção natural quando a Fase 10 (Serviços) chegar. Registrado na seção Transversal do programa.

Também notado: `src/components/common/GlowingEffectDemo.jsx` não tem nenhum consumidor no repositório (`grep` vazio) — candidato a remoção na Fase 16 (código morto).
