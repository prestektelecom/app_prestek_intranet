## 1. Banco e permissão

- [x] 1.1 Criar `backend/migrations/025_sugestoes.sql` (idempotente, sem seed)
- [x] 1.2 Acrescentar `sugestoes` em `CAPACIDADES` (`backend/middleware/permissoes.js`) e em `src/constants/permissoes.js`

## 2. Backend

- [x] 2.1 `POST /api/sugestoes` com validação de tipo/título/descrição e limite de 5 por 24 h
- [x] 2.2 `GET /api/sugestoes/minhas`
- [x] 2.3 `GET /api/sugestoes` (filtros status/tipo) e `PATCH /api/sugestoes/:id` com `gate('sugestoes')`
- [x] 2.4 Auditoria `sugestao_status` / `sugestao_resposta`
- [x] 2.5 Teste das regras (`node scripts/testar-sugestoes.mjs`, 18 casos) e SQL rodado no banco real em 2026-10-05, após aplicar a 025: leituras ok e INSERT com limite (5 gravam, o 6º é barrado) dentro de transação desfeita. Isso pegou um bug que o teste com `pool` falso não pega: `inconsistent types deduced for parameter $1`, corrigido com casts

## 3. Frontend

- [x] 3.1 `SugestaoButton.jsx` (canto inferior direito): botão + popup com formulário e confirmação (substitui a view `Sugestoes`, removida)
- [x] 3.2 ~~Aba "Todas" para gestores~~ cortada (opção A): gestão só por e-mail; rotas seguem no backend sem interface
- [x] 3.3 Rótulo da capacidade no Painel Admin (item de menu removido)
- [x] 3.4 Textos em português; lista em cards (sem lista nem filtros); alvos de toque ≥ 44px

## 4. Impeccable e fechamento

- [x] 4.1 `/impeccable audit` da tela (contraste nos 5 temas, alvos de toque, tipografia, foco) e `critique`; corrigir P0/P1 e registrar o resultado
  - Resultado (2026-10-05, só leitura de código + contraste calculado nos 5 temas, sem navegador): texto passa 4,5:1 em todos os temas. Corrigidos: borda de campo com 1,2:1 (agora `ink2`, ≥5:1), radios feitos à mão (agora `<input type=radio>` nativo, setas funcionam), abas inativas fora do Tab, `border-l-4` apontado pelo detector, fonte 16px nos campos no celular (sem zoom do iOS), foco no primeiro campo inválido, título de seção para leitor de tela. Sem P0/P1 abertos. Pendente: conferência visual no navegador
- [x] 4.2 Atualizar `CHANGELOG.md` ([Unreleased]) e `PENDENCIAS_PRODUCAO.md` (aplicar só a migration 025)
- [ ] 4.3 Branch `feat/suggestion-box`, PR para a `main` com descrição em português e resultado do Impeccable; merge é do Felix
- [ ] 4.4 Após o deploy: `/opsx:archive` e registrar a decisão em `MEMORIA.md`
  - Revisão 2026-10-05 (popup): contraste dos tokens reutilizados já calculado nos 5 temas; detector limpo; faltam conferência no navegador (botão não cobre a barra inferior, foco ao abrir/fechar) e o `audit` visual do botão flutuante.
  - Animação de atenção (2026-10-07, 2ª versão: a 1ª, só anéis, ficou discreta demais): rajada de ~6 s com o botão pulando como bola (30 px, só sobe e desce: o achatamento deformava botão e balão e foi removido), lâmpada balançando, leque de 5 raios pelo topo, 2 anéis de pulso e balão "Tem uma ideia?". 1,5 s após carregar e a cada 25 s com a aba visível, só até a pessoa abrir o popup (`localStorage`, com try/catch). Só transform/opacity. Verificado no navegador com o CSS gerado em página isolada (pulo, achatamento e capturas no pico). Com `prefers-reduced-motion` a regra global deixa tudo no estado final (balão parado e legível, resto invisível). Falta ver no app real, nos 5 temas e no celular.
  - Movido para o Header (2026-10-07): o botão no canto da tela ficava longe do olhar; agora mora ao lado do sino. Animação adaptada ao Header de 64 px: quique de 8 px, raios e balão descem pela base, anéis até 1,8×. Verificado no navegador em Header simulado com o CSS gerado, em 375 px (balão de 37 a 309 px, cabe) e no desktop. Falta ver no app real, com os outros itens do Header (avatar no celular, ações da página).
  - Tamanhos (2026-10-07, pedido do Felix): o "Sugerir" virou um círculo laranja de 32 px, só com o ícone (área de toque de 44 px via `after`), e o sino de notificações cresceu de 44 para 48 px com ícone de 24 px, para o sino ser o elemento principal do Header. Popup movido para portal no `body` (o `backdrop-filter` do Header o cortava). Verificado no app real com a API simulada, no desktop e a 390 px. Falta o app com dados reais.
  - Animação própria do ícone (2026-10-07): a cada 8 s a lâmpada balança e um brilho laranja abre atrás dela (~1 s de movimento, o resto parado), sempre, inclusive depois de a pessoa já ter aberto o popup. Só transform/opacity; com `prefers-reduced-motion` a regra global a deixa parada. Verificado no app real com a API simulada (pico do brilho e repouso).
  - Loop contínuo (2026-10-07, pedido do Felix): o efeito completo (quique, lâmpada, raios, anéis e balão) roda em loop infinito, ciclo de 3 s com respiro (balão visível ~5 s a cada 9 s), sem parar depois do primeiro clique; some a lógica de rajadas, timers e `localStorage`. Verificado no app real: todas as animações com `iterations: Infinity` e quique a cada 3 s. Contrapartida a vigiar: movimento permanente cansa quem usa o dia todo (WCAG 2.2.2); com `prefers-reduced-motion` o ícone fica parado. Se incomodar, voltar às rajadas é um commit.
  - Posição lateral (2026-10-07, pedido do Felix: "mudar a posição para baixo", escolhida a borda direita no meio da altura): sai do Header, fixo na borda direita a 50% da altura (camada 50). Balão e raios saem para a esquerda; o balão só aparece de `sm` para cima (no celular cobriria o conteúdo). Quique de 14 px (sem a folga curta do Header). Verificado no app real com a API simulada, a 1366 e 390 px. Falta o app com dados reais.
  - Balão menor (2026-10-07, pedido do Felix): texto encurtado para "Tem uma ideia?", fonte de 14 para 12 px, altura de 40 para 28 px; caiu de ~270 para 113 px de largura. Verificado no app real com a API simulada.
  - Afastado da barra de rolagem (2026-10-07): `right-3` (12 px) encostava na barra de 15 px; agora `right-5` e `lg:right-10` (40 px da borda da tela, 25 px da barra no desktop). Medido no app real: o anel no pico ainda para a 9 px da barra.
  - De volta ao canto inferior direito (2026-10-07, pedido do Felix: "é melhor ficar embaixo mesmo"): 40 px da borda e 32 px de baixo no desktop (25 px de folga até a barra de rolagem), `--bottom-nav-h` + 16 px no celular (27 px acima da barra inferior, medido). Verificado no app real com a API simulada, a 1366 e 390 px.
