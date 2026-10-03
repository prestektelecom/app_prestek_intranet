## 1. Tokens de tema

- [x] 1.1 `useBentoTheme.js` — `BENTO_LIGHT` para a escala laranja LIGHT
- [x] 1.2 `useBentoTheme.js` — `BENTO_DARK_CYBER` para a escala escura
- [x] 1.3 `useBentoTheme.js` — `BENTO_DARK_AMOLED` para a escala escura
- [x] 1.4 `useBentoTheme.js` — `BENTO_DARK_AURORA` (roxo mantido em fundo e estrutura)
- [x] 1.5 `index.css` — bloco `:root`
- [x] 1.6 `index.css` — bloco `.dark` (fallback default, escala do Cyber)
- [x] 1.7 `index.css` — bloco `.dark-cyber`
- [x] 1.8 `index.css` — bloco `.dark-aurora`
- [x] 1.9 `index.css` — bloco `.dark-amoled`
- [x] 1.10 `index.css` — comentário de cabeçalho (linha 27-28)
- [x] 1.11 `index.css` — os 11 valores fora dos blocos: `login-pulse`, `.layout.is-editing`, `glow-pulse`, o `conic-gradient` de `.bento-hover-border::before`, `.widget-editable:hover`

## 2. `warning` vira amarelo

- [x] 2.1 `useBentoTheme.js` — 4 objetos: `#CA8A04` no claro, `#FACC15` nos escuros
- [x] 2.2 `index.css` — `--warning-bento` / `--warning-soft` nos 5 blocos

## 3. Os 382 hex de marca

- [x] 3.1 Aplicar o mapeamento em 33 arquivos (script mecânico + regra dupla do D4)
- [x] 3.2 `ThemeSwitcher.tsx` — as amostras de tema não podem herdar o mapeamento cego: mostravam a conversão do valor *antigo* em vez do accent novo. Cyber e AMOLED corrigidos para `#F97316`, Aurora para `#FB923C`
- [x] 3.3 `Login/Icons.jsx` — `PrestekMark` adota o laranja da marca
- [x] 3.4 `Login.jsx` / `NotFound.jsx` — sem identidade própria
- [x] 3.5 Varredura de azuis órfãos fora da lista de marca — 14 hex encontrados, 12 legítimos (categóricos por D5, ou estruturais: roxo do Aurora, navy do `ink`). Dois eram accent disfarçado e foram corrigidos:
  - `NotFound.jsx:92` — `hover:bg-[#3B8EE0]` num botão que virou laranja → `#C2410C`
  - `AdminDashboard.jsx:261` — `iconCor: '#187B91'` (teal escuro) pareado com `stripe: C.cyan`, que agora é laranja → `#9A3412`
- [x] 3.6 Normalizar espaçamento dos `rgba` — o mapeamento gerou `rgba(236, 125, 35,` com espaços, e **valores arbitrários do Tailwind não aceitam espaços**; 12 classes `to-[...]` / `shadow-[...]` ficaram quebradas. 16 ocorrências normalizadas para `rgba(236,125,35,`

## 4. Verificação

- [x] 4.1 `npm run build`
- [x] 4.2 Varredura: nenhum `#4A9EF5|#1F5BA8|#2D7BD4|#7FD4E8|#00F2FE|#EAF4FF` nem `rgba(74,158,245`/`rgba(31,91,168` restante em `src/`
- [x] 4.3 **Browser** — 5 temas (2026-10-03, API simulada): Dashboard, Serviços, Cobertura, Plantão, Processos, Escritórios, Configurações e Login renderizam nos 5 temas, sem tela branca nem overflow horizontal
- [x] 4.4 **Browser** — hero de Serviços com profundidade (gradiente laranja com realces, não chapado), em claro e Aurora
- [x] 4.5 **Browser** — `Logo_P` laranja combina com a Sidebar em claro, Cyber e Aurora
- [ ] 4.6 **Browser** — Login e NotFound sem resquício de identidade própria — Login visto em Aurora e sem resquício de identidade própria (2026-10-03); **NotFound ainda não visto**
- [ ] 4.7 **Browser** — ThemeSwitcher: as amostras batem com o que cada tema mostra
- [ ] 4.8 **Browser** — `warning` amarelo lê como aviso, distinto do laranja de destaque (Coverage, badges de status)
- [x] 4.9 **Browser** — Aurora e Cyber vistos em Dashboard, Serviços, Configurações e Login. Achado e corrigido: gradiente com tom pêssego (`accentDark`) sob texto branco nos temas escuros, em Configuracoes, AdminComunicados e AdminDashboard (2026-10-03)
- [ ] 4.10 **Browser** — telas densas: Schedule, Coverage, Processos, Offices, Rankings

## Pendências para changes futuros

- Token `--accent-ink` por tema, para as ~15 ocorrências de `background: C.accent` + `color: 'white'` (2.8:1, abaixo de AA)
- Substituir o `PrestekMark` inventado do Login pelo `Logo.webp` real, que não é importado em lugar nenhum
- `DESIGN.md` descreve a paleta âmbar legada e está desatualizado desde a migração "Bento Blue"
