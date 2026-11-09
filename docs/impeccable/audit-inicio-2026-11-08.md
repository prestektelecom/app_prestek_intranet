# Audit técnico — Início (Dashboard) e correções

Data: 2026-11-08 · Alvo: `src/components/Dashboard.jsx` (tela Início) e o que ela chama no backend.
Evidência: `impeccable detect --json` (9 avisos de fonte, exit 0), medições no navegador (Playwright, API simulada, nada tocou a produção), axe-core 4.9.1, leitura do IXC e do banco só em modo leitura, contraste calculado a partir dos tokens do `index.css`.

Este audit abriu 8 Pull Requests (#9 a #16) e foi fechado com um polish. **Nenhum estava mesclado quando esta nota foi escrita**, então a `main` ainda tem o código antigo; a reauditoria foi feita sobre o **conjunto dos PRs juntos** (merge local descartável, conflitos resolvidos à mão), que é o código que a `main` terá depois do merge. Nota anterior da tela: ver [[audit-dashboard-2026-09-11]] (12/20).

## Placar

| # | Dimensão | Antes | Depois (medido no conjunto) | O que mudou |
|---|---|---|---|---|
| 1 | Acessibilidade | 2 | 4 | carrossel sem controle aninhado e com pausa, contraste, títulos nos cards; axe em 0 nos 5 temas |
| 2 | Desempenho | 3 | 4 | 19 → 11 requisições, aba oculta não consulta, chunk do Início de 122,5 para 61,4 KB (gzip 36,2 → 17,6) |
| 3 | Temas | 3 | 4 | texto usa tokens `-strong`, novo `--info-strong`, 122 textos medidos nos 5 temas sem falha |
| 4 | Responsivo | 2 | 3 | grade CSS de altura automática, nada cortado nem truncado em 17 larguras de 320 a 1366 px; fica em 3 porque os pontos do carrossel têm 32 px de largura e toque real não foi testado |
| 5 | Integridade | 2 | 3 | data do plantão, id do plantão, links mortos, versão inventada, emojis; sobram decisões de produto |
| | **Total** | **12/20** | **18/20** | faixa Excelente (18 a 20). Rodar `/impeccable audit inicio` na `main` depois do merge deve dar o mesmo |

## Achados e onde foram corrigidos

| Sev. | Achado | PR |
|---|---|---|
| P1 | Plantão: `LIKE '%1%'` casava o funcionário 1 com 12, 21 etc. e com id vazio devolvia o plantão de qualquer um; data podia sair um dia antes (só se o servidor serializar a data em UTC) | #9 |
| P1 | Fileira de 3 KPIs espremida a ~150 px por card a 1366 px, "+3%" cortado; `react-grid-layout` com altura fixa e breakpoint pela largura do contêiner | #10 |
| P1 | Chips e rótulos pequenos com tokens de preenchimento como texto (2,5:1 a 4,1:1) | #11 |
| P1 | Carrossel: `role="button"` com botões dentro, pontos de 8×8 px, sem botão de pausa | #12 |
| P1 | Rodapé com `href="#"` e selo "v1.0.0" que não existia (o `package.json` está em 0.1.0) | #13 |
| P2 | Laranja da marca em 8 grupos, 7 emojis no lugar de ícone, pulso infinito | #14 |
| P2 | Fontes de 9 a 10 px, 12 tamanhos soltos | #15 |
| P2 | Início baixava a lista de 169 funcionários (60 KB, com a data de nascimento completa) para mostrar 3 aniversariantes, e as listas de setores eram pedidas 10 vezes | #16 |
| P2 | Saudação "Olá, FELIX", usuário sem vínculo via "⚠️ null pendentes", KPIs "–%" e "Ok" sem dado | #13 |
| P3 | Polish: título do banner em 3 linhas, selo quebrando, "Sem cobertura ativa", alvos de 20 e 32 px, título de comunicado com 52 px no celular, cards sem título | #10, #12, #13, #14, #15 |
| P2 | Reauditoria do conjunto: com o texto a 11 px, o rótulo "Encaminhadas" era cortado a 360 e 390 px (e a 320 px, o critério de reflow do WCAG); "Ver todos" quebrava em duas linhas a 320 px | #14, #15 |

## Medições antes e depois

| | Antes | Depois |
|---|---|---|
| Requisições ao abrir o Início (build de produção, API simulada) | 19 | 11 |
| Cartão de aniversariantes, dados reais | 60,1 KB (169 pessoas, com ano) | 372 bytes (2 pessoas, sem ano) |
| Ida ao IXC | a cada abertura de qualquer usuário (0,8 a 4,6 s) | 1 vez a cada 10 min no servidor; em cache 4 ms |
| Consultas com a aba oculta por 125 s | 4 ciclos de cada | 0 |
| Emojis no Início | 7 | 0 |
| Laranja da marca em repouso | ~25 elementos em 8 grupos | 3 (botão de Chamados, "Ver todos" e a seta) |
| Menor fonte | 9 px | 11 px |
| Chunk do Início (produção) | 122,5 KB (gzip 36,2) | 61,4 KB (gzip 17,6) |
| Larguras testadas sem corte, truncamento de rótulo nem rolagem horizontal | falhava a 1366 px | 17, de 320 a 1366 px |
| axe-core (5 temas, WCAG 2.2 AA + boas práticas) | não medido | 0 violações |
| Textos abaixo do contraste (5 temas) | vários (valores calculados) | 0 de 109 a 122 (varia com o estado da tela) |

## Decisões que continuam com o Felix

1. **Fileira de KPIs do setor para quem não é técnico no IXC.** Mostra "N/A / – / –" em três cartões altos e vazios, e a maior parte da empresa cai nesse caso. Pode sumir, virar uma linha compacta ou ficar?
2. **Atalhos "Em breve"** (Holerite, Ponto Eletrônico, Férias): 3 dos 7 atalhos. Sem eles sobram 4, uma linha cheia.
3. **Número do WhatsApp da Reservar Sala** fixo no código do front.

## Ordem de merge e implantação

Ordem que dá menos conflito: #9, #10, #11, #12, #13, #14, #15, #16. O `CHANGELOG.md` conflita em vários (manter as duas linhas). No `Dashboard.jsx` os conflitos são poucos e estão descritos em cada PR; ao juntar #13 e #14 no selo "N pendentes", manter `!semDados` e as classes do #14, **sem** `animate-pulse`.

Implantação: o #10 remove duas dependências (`npm ci`) e o #16 cria a rota `GET /api/aniversariantes`, então **reiniciar o backend (`pm2 restart prestek-backend`) antes de publicar o novo build do front**. Nenhum PR tem migration nem variável nova no `.env`.

## Limites

- Sem leitor de tela real (NVDA, VoiceOver), sem toque real e sem Safari.
- Fora do escopo do Início, visto na reauditoria a 320 px: os rótulos da barra inferior do celular ("Comunicados" e "Chamados") se encostam. É do `MobileBottomNav`, não do Início.
- O corpo da rota `/api/aniversariantes` em `server.js` só passou por `node --check`: o serviço atrás dela foi testado ao vivo contra o IXC e o banco reais (`node scripts/testar-aniversariantes.mjs --ao-vivo`), mas o servidor não foi subido (inicia tarefas que gravam no banco e não há staging).
- Os pontos do carrossel têm 32 px de largura (44 de altura): passa o WCAG 2.5.8, fica abaixo da convenção de 44×44 do `AGENTS.md`.
- Informações só em `title` (explicação da variação, data completa de um comunicado) continuam sem alternativa para toque.
- Diretório e Configurações ainda buscam cargos e departamentos por conta própria; podem adotar `utils/referenciaSetores.js`.
- As requisições de rede foram medidas com API simulada; os tamanhos reais, no IXC e no banco.
