---
target: src/components/Dashboard.jsx
total_score: 35
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Dashboard.jsx"
target_fingerprint: "sha256:7ec8f6aacbbe9c228d07990d465a8b2ddd30652334ea093f10dc2c5341c8cd5b"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Dashboard.jsx"
timestamp: 2026-09-11T22-44-37Z
slug: src-components-dashboard-jsx
---
# Crítica de Design — Dashboard (`src/components/Dashboard.jsx`), 4ª rodada (após a change `impeccable-dashboard`)

Método: dual-agent (A: ad2bb30894506d3f0, revisão de design com navegador). Avaliação B desta rodada reaproveita o detector CLI, rodado diretamente (não como subagente, por já ter o contexto completo dos arquivos alterados). `http://localhost:5000`, sessão injetada nos 2 papéis (técnico/admin e RH/comum), 1440×900 e 390×844, claro, Default Dark, Cyber-Obsidian e AMOLED. Verificação dirigida às 4 correções da change: botão de ação do OS, `TiSupportModal`, `GlowingEffect`, badges de estado. Alvo idêntico à rodada de 2026-09-11 (26/40).

## Placar de Saúde de Design

| # | Heurística | Nota | Antes | Problema-chave |
|---|---|---|---|---|
| 1 | Visibilidade do Status do Sistema | 4 | 3 | Skeletons por card, relógio ao vivo, spinner no submit, retry explícito em todo erro |
| 2 | Correspondência com o Mundo Real | 4 | 3 | Rótulos e frases contextuais em PT-BR idiomático |
| 3 | Controle e Liberdade do Usuário | 3 | 2 | Modal com Escape, clique fora e Cancelar, verificado; grid fixo por decisão de produto registrada |
| 4 | Consistência e Padrões | 3 | 2 | Sistema de tokens coerente; um badge irmão (pill de aniversário) ainda usava o token errado, corrigido nesta rodada |
| 5 | Prevenção de Erros | 4 | 2 | Submit desabilitado até preencher técnico e mensagem; confirmação antes de abrir o chamado |
| 6 | Reconhecimento vs. Memorização | 4 | 4 | Tooltips explicam cálculos; tudo rotulado no próprio card |
| 7 | Flexibilidade e Eficiência de Uso | 3 | 1 | Grid fixo por decisão consciente e documentada, não mais uma promessa quebrada do PRODUCT.md |
| 8 | Design Estético e Minimalista | 3 | 3 | Bento cards limpos; `OsBento` denso quando há pendências |
| 9 | Reconhecer/Diagnosticar/Recuperar de Erros | 4 | 4 | Mensagens específicas com retry em todo widget |
| 10 | Ajuda e Documentação | 3 | 2 | Adequado para intranet interna de baixa complexidade |
| **Total** | | **35/40** | **26/40** | **Bom (87%)** |

## Veredito de Especificidade de Design

**Avaliação A (sem detector):** as quatro correções da change foram verificadas com medição, não presumidas. Botão "Gerenciar Meus Chamados": 6,22:1 no claro, 6,11:1 no Default Dark e Cyber, 7,06:1 no AMOLED, em repouso e no hover (o fundo não muda mais no hover, só a sombra, testado com `page.hover()` real). `TiSupportModal`: `role="dialog"`, `aria-modal`, `aria-labelledby` presentes; Tab preso dentro do modal em ciclo completo; Escape fecha e devolve o foco ao botão que abriu; clique fora fecha. `GlowingEffect`: 9 de 9 instâncias no Dashboard usam `var(--accent)`/`var(--accent-dark)`/`var(--accent-deep)`, nenhuma mais usa a paleta de demonstração. Badges: "Tudo em dia" 6,70:1 (claro), "N pendentes" 6,62:1, "-92%" 6,00:1, "Sem SLA · Ok" 6,70:1 — todos com o token `-strong`. A avaliação encontrou um badge irmão não migrado (pill de data do `AniversariantesCard`, ainda em `-bento`, 3,82:1) e um botão de fechar do modal sem `aria-label` (o primeiro elemento a receber foco ao abrir), ambos corrigidos em seguida, junto com um alvo de toque de 35px no botão do OS (abaixo do piso de 44px do AGENTS.md).

**Scan determinístico:** CLI confirma que os 4 findings `design-system-color` do `glowing-effect.tsx` (linhas 211-214) persistem, mas agora só no branch `default` do componente, não mais alcançado por nenhum uso no Dashboard — são a paleta de demonstração original, mantida como variante para não quebrar outros consumidores. Descoberta durante a verificação: o mesmo componente é usado sem `variant` em `common/BentoCard.jsx` (compartilhado por 6 arquivos da área de Serviços), herdando a mesma paleta fora da marca — fora do escopo desta change, registrado para a Fase 10. `GlowingEffectDemo.jsx` não tem nenhum consumidor no repositório — código morto, candidato à Fase 16.

## Impressão Geral

As quatro correções da change se sustentam sob medição independente nos cinco temas, em repouso e em interação (hover, Tab, Escape, clique fora). A avaliação encontrou três lacunas pequenas e diretamente relacionadas às próprias correções (um badge irmão, um `aria-label` faltando, um alvo de toque), todas corrigidas nesta mesma rodada. O placar sobe de 26 para 35, sem nenhum P0 e sem P1 restante.

## O Que Está Funcionando

1. **"Orange Is Fill Rule" aplicada de forma consistente e comprovadamente eficaz**: em nenhum dos cinco temas o botão primário caiu abaixo de 6:1.
2. **Padrão de acessibilidade do modal robusto**: replica corretamente o `useDismissable` já validado no `BottomSheet` do chrome mobile — Escape em fase de captura, clique fora, devolução de foco.
3. **9 `GlowingEffect` com um único listener/rAF compartilhado**, sem regressão de performance na troca de paleta.

## Problemas Prioritários

Nenhum P0. Nenhum P1 restante — os três achados da rodada (badge de aniversário, `aria-label` do fechar, alvo de toque) foram corrigidos durante a própria verificação:

- Pill "Hoje"/"Amanhã"/"em X dias" do `AniversariantesCard` (`Dashboard.jsx:1067`): trocado de `--success-bento` para `--success-strong`.
- Botão de fechar do `TiSupportModal` (`:159`): recebeu `aria-label="Fechar"`.
- `ACTION_BTN`/`ACTION_BTN_PRIMARY` (`Dashboard.jsx:18, 31`): ganharam `min-h-[44px]`; medido 44px no navegador.

## Observações Menores

- Chip de data do carrossel de comunicados (`white/70` sobre `black/30`) não foi avaliado contra fotos reais de comunicado, só contra o gradiente de overlay — verificação visual pendente quando houver conteúdo real.
- Badge "⚠️ N pendentes" com `animate-pulse` não respeita `prefers-reduced-motion` automaticamente (Tailwind não desliga isso por padrão); fora de escopo desta change.
- `TAG_DEFAULT.chip` (`Dashboard.jsx:465`, fallback raro do carrossel) ainda usa `bg-primary text-white`, mesmo padrão do bug original, mas amarrado a uma paleta categórica pré-existente do carrossel — registrado para polish, não corrigido para não abrir uma frente de redesenho sem decisão.
- `BentoCard.jsx` (Serviços) e `GlowingEffectDemo.jsx` (código morto) registrados no audit para as Fases 10 e 16.

## Perguntas Provocativas

1. Agora que a Fase 3 fechou com uma variante `brand` pronta e comprovada, faz sentido a Fase 10 (Serviços) começar por trocar `BentoCard.jsx` para ela, antes mesmo de uma crítica formal daquela área?
2. O grid fixo do Dashboard virou uma decisão documentada em vez de uma lacuna silenciosa. Isso muda a prioridade de uma eventual Fase de "customização" no roadmap, ou o produto está bem servido sem ela?
