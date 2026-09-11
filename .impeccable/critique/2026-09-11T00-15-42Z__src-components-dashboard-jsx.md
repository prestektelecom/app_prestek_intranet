---
target: src/components/Dashboard.jsx
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 4
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Dashboard.jsx"
target_fingerprint: "sha256:297a5ee0cf9a0eeeef661126de67ac56abd7214552d43b06813dde08afc4d008"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Dashboard.jsx"
timestamp: 2026-09-11T00-15-42Z
slug: src-components-dashboard-jsx
---
# Crítica de Design — Dashboard (`src/components/Dashboard.jsx`), 3ª rodada

Método: dual-agent (A: aed4c5db805567dfb, revisão de design com navegador · B: a4c9fe5e15f76a5b1, detector CLI + overlay injetado + medições). Rodadas em sequência para dividir um único navegador Playwright, isoladas uma da outra. `http://localhost:5000`, sessão injetada nos 2 papéis (técnico de campo/admin e colaboradora comum/RH), 1440×900 e 390×844, claro, Default Dark e AMOLED; simulação de falha de rede via `page.route().abort()`; teste de teclado no `TiSupportModal` e no carrossel/lista de comunicados. Overlay injetado em 3 vistas (`critB-dash-*.png`); ~20 capturas da revisão (`critA-dash-*.png`, `critA-glow-*.png`, `critA-tisupport-modal.png`, `critA-error-state-*.png`). Alvo: `Dashboard.jsx`, `TiSupportModal.jsx`, `ui/glowing-effect.tsx`. Rodadas anteriores (2026-09-07): 13 → 15/40, fechadas com 3 P0 pendentes num snapshot fechado.

## Placar de Saúde de Design

| # | Heurística | Nota | Antes | Problema-chave |
|---|---|---|---|---|
| 1 | Visibilidade do Status do Sistema | 3 | 2 | Skeletons, relógio ao vivo e contagem "online" funcionam; o CTA principal do card mais visto (OS) simplesmente não aparece |
| 2 | Correspondência com o Mundo Real | 3 | 2 | Vocabulário do IXC correto; anotação do cadastro ("(férias) Costa") vaza para o nome de um aniversariante |
| 3 | Controle e Liberdade do Usuário | 2 | 1 | Carrossel de comunicados agora pausa por foco e por hover (verificado); `TiSupportModal` não fecha com Escape e não move foco ao abrir |
| 4 | Consistência e Padrões | 2 | 2 | Brilho de hover arco-íris quebra a regra de um-accent-só; colisão de classes Tailwind (`bg-surface` vs `bg-primary`) apaga um botão |
| 5 | Prevenção de Erros | 2 | 1 | Nada impede a colisão de utilitários de mesma especificidade; variação de KPI sem teto (`-929%` observado) |
| 6 | Reconhecimento vs. Memorização | 4 | 2 | Tudo relevante já na tela ao abrir: hora, chamados, plantão, aniversário do dia no header |
| 7 | Flexibilidade e Eficiência de Uso | 1 | 1 | PRODUCT.md promete grid customizável como capacidade permanente; `isDraggable`/`isResizable` hardcoded em `false`, sem "Modo de Edição" na UI, embora os endpoints de backend e o CSS do modo existam |
| 8 | Design Estético e Minimalista | 3 | 1 | Densidade e hierarquia equilibradas; manchado pelo brilho fora da marca e pelo botão invisível |
| 9 | Reconhecer/Diagnosticar/Recuperar de Erros | 4 | 2 | Falha de rede simulada em dois widgets simultâneos: mensagem clara em PT-BR e retry funcional nos dois, testado ao vivo |
| 10 | Ajuda e Documentação | 2 | 1 | Sem onboarding para o grid de 7 widgets; só tooltips pontuais |
| **Total** | | **26/40** | **15/40** | **Aceitável (65%)** |

## Veredito de Especificidade de Design

**Avaliação A (sem detector):** híbrido, com a costura visível onde a tela é mais tocada. A casca é genuinamente Prestek — vocabulário do IXC nos comunicados, "Próximo Plantão", "Chamados no meu nome", saudação com nome e cargo. Mas o mecanismo de interação mais repetido da tela, o brilho de proximidade do mouse em qualquer um dos 9 `GlowingEffect`, é literalmente o gradiente de demonstração do componente de terceiro, nunca recolorido: rosa `#dd7bbb`, dourado `#d79f1e`, verde `#5a922c`, azul-acinzentado `#4c7894`. A versão correta já existe no mesmo arquivo (`bento-hover-border`, laranja, documentada no DESIGN.md como "Brilho de sinal") e não é usada em lugar nenhum.

**Scan determinístico (B):** CLI exit 0, 13 advisories: 9 `design-system-font-size` (9 a 17px fora da rampa) e **4 `design-system-color`** (as mesmas cores do glow, `glowing-effect.tsx:193-196`, sem exceção registrada). Overlay: confirma de forma independente o P0 da Avaliação A — `low-contrast 1.0:1` no botão "Gerenciar Meus Chamados" (branco sobre branco), nas 3 vistas claras; no Default Dark o mesmo bug de especificidade existe mas passa despercebido (17,1:1 por acidente, porque `--surface` escuro também é branco no texto). Overlay também mediu o badge de sucesso "Tudo em dia" em 3,82:1 no claro e 6,07:1 no escuro, e listou `layout-transition` no próprio `Dashboard.jsx` (não coberto pela exceção do config, que só cobre `Sidebar.jsx`) e `side-tab` (já aceito, não reportado como novo). No celular, o botão mede 204×35, abaixo do piso de toque de 44px, além de invisível.

**Overlays visuais:** `.playwright-mcp/critB-dash-v1-light.png`, `critB-dash-v2-dark.png`, `critB-dash-v3-mobile.png`, `critB-dash-glow-closeup.png`. Live-server parado, aba fechada.

## Impressão Geral

Os três P0 da rodada anterior (horário de plantão inventado, "sem dados" tratado como erro, comunicados sem teclado) estão corrigidos e verificados ao vivo — evolução real desde 2026-09-07. Em compensação, apareceu um P0 novo, mais grave em certo sentido porque é silencioso: o botão de ação principal do widget mais visto da tela ficou branco sobre branco por uma colisão de classes CSS, invisível mas clicável, e ninguém percebeu porque no tema escuro o mesmo bug "funciona por acidente". A tela também carrega uma regressão de produto: o grid que o PRODUCT.md descreve como customizável foi travado numa reescrita anterior, com os endpoints de backend e o CSS do modo de edição ainda vivos e não usados.

## O Que Está Funcionando

1. **Estados de erro tratados como cidadãos de primeira classe**: falha de rede simulada em dois widgets simultâneos (`/api/eficiencia`, `/api/plantoes`) rendeu mensagem clara e retry funcional nos dois, mantendo navegação viva.
2. **"sem_dados" tratado como dado, não como erro**: verificado ao vivo com a persona de RH — "Eficiência: N/A" limpo, sem mensagem de falha fabricada.
3. **Acessibilidade do carrossel e da lista de comunicados de pé**: Tab confirma foco visível em laranja, `role="button"` com `aria-label` descritivo, pausa por foco e por hover juntas.

## Problemas Prioritários

**[P0] CTA principal do card mais visitado é invisível no tema claro** — `Dashboard.jsx:18` (`ACTION_BTN` já contém `bg-surface`), `:356-361` (override concatena `bg-primary` por cima)
Por que importa: medido nos dois agentes de forma independente: `background-color: rgb(255,255,255)`, `color: rgb(255,255,255)`, contraste 1,0:1. Como `bg-surface` e `bg-primary` são utilitários Tailwind de especificidade igual, quem vence é a ordem na folha gerada, não a ordem na string de classe, e `bg-surface` vence sempre. No claro o botão de "Gerenciar Meus Chamados" simplesmente não existe visualmente, embora continue clicável e focável; no celular também mede 35px de altura, abaixo do piso de toque.
Fix: remover a duplicidade de `bg-*`/`border-*` entre `ACTION_BTN` e o override, ou criar uma constante `ACTION_BTN_PRIMARY` sem `bg-surface`/`border-border`.
Comando: `/impeccable harden`

**[P1] Modal de Suporte de TI sem semântica nem gerenciamento de foco** — `TiSupportModal.jsx` (arquivo inteiro)
Por que importa: verificado nos dois agentes — `role`, `aria-modal`, `aria-labelledby` todos `null`; Tab a partir do botão que abre visita "Meu Perfil", "Comunicados" e os dois links do rodapé antes de qualquer controle do modal (4 paradas fora, confirmadas por B); Escape não fecha. É o fluxo de abrir um chamado real de TI, uma tarefa central do produto, e não usa o `ModalShell` compartilhado que o DESIGN.md documenta.
Fix: migrar para `ModalShell` ou replicar seu contrato: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, foco inicial dentro do modal, Escape fechando, trap de Tab.
Comando: `/impeccable harden`

**[P1] Brilho de hover é um gradiente de demonstração de terceiro, não o "Brilho de sinal" da marca** — `ui/glowing-effect.tsx:193-204`, usado nos 9 `GlowingEffect` do Dashboard
Por que importa: é a única interação que se repete em toda a tela mais visitada do produto e contraria a regra central do DESIGN.md ("The Rare Signal Rule"). Confirmado nos dois agentes, inclusive com os valores computados do gradiente no elemento. A alternativa correta (`bento-hover-border`, laranja) já existe no mesmo arquivo, numa constante (`CARD`) que não é usada.
Fix: trocar o `GlowingEffect` dos cards do Dashboard pela classe `bento-hover-border`, já pronta e correta; ou recolorir o componente para os tokens do tema.
Comando: `/impeccable colorize`

**[P1] Badges de estado sobre fundo "-soft" abaixo do contraste AA** — `Dashboard.jsx:23` (`KpiCard.toneClasses.success`), `:276-278` (badge do `OsBento`)
Por que importa: medido nos dois agentes — verde "Tudo em dia" em 3,82:1 no claro (precisa 4,5:1 para texto de 11px bold); o DESIGN.md já documentou esse exato problema e já criou o token de texto mais escuro (`--success-strong`), mas o componente usa o token "de gráfico" (`--success-bento`). O mesmo padrão se repete no aviso amarelo (2,84:1, medido por B) e é esperável no vermelho.
Fix: trocar `--success-bento`/`--warning-bento`/`--danger-bento` por `--success-strong`/`--warning-strong`/`--danger-strong` em todo texto sobre fundo `-soft`, mantendo a cor "bento" só para ícones e gráficos.
Comando: `/impeccable harden`

**[P1] Grid "customizável" do PRODUCT.md está travado, sem UI de edição** — `Dashboard.jsx:1316-1317` (`isDraggable={false}`, `isResizable={false}`), `index.css` (CSS morto de `.layout.is-editing`), `backend/server.js:4112-4151` (endpoints `/api/user/dashboard-layout` ainda funcionam e não são chamados)
Por que importa: o PRODUCT.md lista isso como capacidade ativa, não aspiracional. Uma change anterior (`archive/2026-05-25-dashboard-drag-and-drop`) implementou e arquivou essa funcionalidade por completo; uma reescrita posterior do Dashboard a removeu da UI sem atualizar o documento nem remover o código morto associado.
Fix: decisão de produto explícita — reativar o modo de edição (o CSS já espera a classe) ou atualizar o PRODUCT.md e registrar a decisão com dono e data.
Comando: `/impeccable clarify`

## Sinais de Alerta por Persona

**Alex (técnico de campo, celular, entre atendimentos):** a sobreposição antiga SetorBento/PlantaoBento está corrigida (verificado a 390px). Mas o botão "Gerenciar Meus Chamados" continua invisível no celular também — o bug não é responsivo, é de especificidade CSS.

**Sam (analista de RH, desktop, de manhã):** "Eficiência: N/A" é tratado com elegância, mas o card de maior destaque visual da tela inteira ("Chamados no meu nome", com selo verde) é permanentemente irrelevante para o trabalho dela — não é um bug, é falta de adaptação por papel.

**Leitor de tela / teclado:** o carrossel e a lista de comunicados passam no teste de Tab com foco visível e `aria-label` correto. Mas abrir "Suporte TI", uma tarefa central do produto, trava numa modal sem diálogo anunciado, sem foco inicial e sem Escape.

## Observações Menores

- Anotação do IXC vazando para a UI: "(férias) Costa" apareceu como nome de aniversariante; `nomeCurto()`/`nomeFormatado()` não filtram parênteses.
- Variação de KPI sem teto de exibição: `-929%` observado com dado de teste de base pequena.
- Rodapé com dois links mortos: "Política de Privacidade" e "Diretrizes Internas" em `href="#"`.
- Carrossel de comunicados sem `aria-live`: a troca automática não é anunciada a quem não está focado no card.
- Três requisições redundantes na carga: `/api/comunicados` (banner e card) e `/api/departamentos-empresa` (aniversariantes e equipe online) — cada um buscado duas vezes de forma independente.

## Perguntas Provocativas

1. Se o brilho de hover de todo card é, byte a byte, o gradiente de demonstração de um componente de portfólio, quantos outros lugares do produto importaram um componente pronto sem revisar as cores?
2. O PRODUCT.md promete um grid reorganizável como capacidade permanente. Isso ainda é verdade, ou é hora de decidir por escrito entre reativar ou desistir?
3. A analista de RH e o técnico de campo veem o mesmo grid de 7 widgets, na mesma ordem, com o mesmo card de OS técnica em destaque. Faz sentido personalizar por papel?
4. Um botão pode ficar invisível em produção, nos cinco temas, sem que nenhum teste visual pegasse isso — que rede de segurança evitaria a próxima colisão `bg-surface`/`bg-primary`?
