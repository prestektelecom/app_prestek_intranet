---
target: src/components/Login.jsx (tela de Login)
total_score: 16
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 4
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Login.jsx"
target_fingerprint: "sha256:5d0e364a1aabd42c0c3679ff39b7599bf1d11d5b481866d453251cca04a3b093"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Login.jsx"
timestamp: 2026-09-10T22-34-37Z
slug: src-components-login-jsx
---
# Crítica de Design — Tela de Login (`src/components/Login.jsx`)

Método: dual-agent (A: a3cbe18be329a5297, revisão de design com navegador · B: a970ae01bd99e33da, detector CLI + overlay injetado + medições). Rodadas em sequência para dividir um único navegador Playwright, isoladas uma da outra. `http://localhost:5000` sem sessão, 1440×900, 390×844 e 720×600 (zoom 200%), claro, Default Dark e AMOLED; fluxo de erro com credencial inválida, campos vazios, mostrar/ocultar senha, Tab, `prefers-reduced-motion` emulado. Overlay injetado em 3 vistas (`critB-login-*.png`); 10 capturas da revisão (`critA-login-*.png`). Alvo: `Login.jsx`, `Login/LoginForm.jsx`, `Login/LoginIllustration.jsx`, `Login/Icons.jsx`, `hooks/useLogin.js`; o P0 leva a `backend/server.js` e `services/auth.js`.

## Placar de Saúde de Design

| # | Heurística | Nota | Problema-chave |
|---|---|---|---|
| 1 | Visibilidade do Status do Sistema | 2 | "Entrando..." e inputs desabilitados ok; "Aguardando servidor..." gira sem explicar nem oferecer ação (`LoginForm.jsx:128-135`); banner de erro sem `role="alert"` (`:57`) |
| 2 | Correspondência com o Mundo Real | 1 | "Prestek Inc.", "SSO · SAML 2.0", "Docs", "Status", "painel 3D": vocabulário que não é da empresa. Label "E-mail", placeholder "Seu usuário IXC", erro "Informe seu email.": três nomes para um campo |
| 3 | Controle e Liberdade do Usuário | 2 | "Status" e "Docs" levam a views que não existem (404 para quem está deslogado); "Problemas ao acessar?" é `href="#"` (`LoginForm.jsx:114`) |
| 4 | Consistência e Padrões | 1 | Única tela sem tokens do tema; input de 50px vs 40px do sistema; borda 1,5px; `p-14`; sombra laranja de 100px em repouso (viola "Flat At Rest"); marca diferente da Sidebar e do NotFound; bege `#FFF7ED` que o DESIGN.md diz que "não volta" |
| 5 | Prevenção de Erros | 2 | E-mail `type="text"` sem validação nem `inputmode`; "Lembrar senha" grava a senha em claro no `localStorage` por 7 dias (`useLogin.js:85-86`) |
| 6 | Reconhecimento vs. Memorização | 3 | Layout canônico, labels visíveis; perde pela ambiguidade e-mail vs usuário IXC |
| 7 | Flexibilidade e Eficiência de Uso | 1 | Sem `autocomplete`, `name` ou `id`: autofill e gerenciadores de senha não funcionam (o Chrome avisa no console); sem `autofocus`; checkbox fora do Tab |
| 8 | Design Estético e Minimalista | 2 | Dois padrões de pontos, três blobs, tagline de marketing, rodapé mono e três links sem destino ao redor de dois campos |
| 9 | Reconhecer/Diagnosticar/Recuperar de Erros | 1 | E-mail inexistente mostra `Erro interno no servidor: Cannot read properties of undefined (reading '0')`; depois do erro o foco cai no `body`; banner a 4,41:1 |
| 10 | Ajuda e Documentação | 1 | "Problemas ao acessar?" não leva a nada; "Suporte" abre o site público; nenhum ramal ou e-mail da TI |
| **Total** | | **16/40** | **Pobre (40%)** |

## Veredito de Especificidade de Design

**Avaliação A (sem detector):** um template de login vestido de laranja, não a porta da Prestek Telecom. O logo real (`Logo.webp`, que a Sidebar já usa) não aparece; o painel esquerdo usa um "PrestekMark" de três quadrados inventado (`Login/Icons.jsx:1-9`) e o header só a palavra "Prestek". A empresa vira "Prestek Inc." no `h1` e no rodapé. A ilustração Lottie é um stock isométrico de "equipe com calendário e gráficos", e a tagline "Uma plataforma para cada fluxo de trabalho..." é copy de landing page. "Segurança garantida com SSO · SAML 2.0" (`LoginForm.jsx:155`) é falso: o backend compara e-mail e senha em SHA-256 contra o IXC; não há SAML nem SSO. O tema é ignorado por completo: `html.dark` e `html.dark-amoled` renderizam a mesma tela clara, pixel a pixel, porque tudo é hex fixo e a raiz pinta o próprio gradiente. O que sobra do sistema é a tipografia (Manrope no `h1`, Plus Jakarta no corpo).

**Scan determinístico (B):** CLI exit 0, **9 advisories**, todos `design-system-font-size` (9, 12, 15 e 22px fora da rampa), um deles em código comentado (falso positivo, `LoginIllustration.jsx:58`). Overlay no navegador, idêntico nas três vistas: **6 findings, 5 warnings**: `low-contrast` no botão "Entrar" (branco sobre `#EC7D23`, **2,8:1**), `low-contrast` no rodapé (2,3:1), `undersized-ui-text` "PORTAL INTERNO" a 9px, `nested-cards` (painel branco dentro do card duplo), `layout-transition` (`transition-all` no card, nos inputs e no botão, fora da exceção do config, que só cobre a Sidebar), mais `gpt-thin-border-wide-shadow` (advisory) no card. Nenhum cai nas exceções. Onde A e B concordam: botão em 2,8:1, rodapé, tema ignorado. Onde B mediu o que A estimou: placeholder 2,38:1, borda do input **1,14:1**, checkbox 2,50:1, banner de erro 4,41:1; botão do olho 22×22 sem nome; `labels.length = 0` nos dois inputs; nenhum `input[type=checkbox]` no DOM; nenhuma região `aria-live`; foco no `body` após o erro; **chunk do Lottie com 14,16 MB transferidos também no celular**, onde a ilustração está `display: none`; e o Lottie continua animando com `prefers-reduced-motion: reduce` e mesmo invisível.

**Overlays visuais:** `.playwright-mcp/critB-login-desktop.png`, `critB-login-desktop-erro.png`, `critB-login-celular.png`. Live-server parado, aba fechada.

## Impressão Geral

A estrutura do formulário está certa (labels acima, ícone de foco, botão com estado de carregamento, health check antes do submit) e o resto está errado na direção mais cara: a tela mente sobre a empresa e sobre a segurança, não conhece os temas nem a marca, e no caminho de erro mais comum, um e-mail que não existe, devolve uma exceção de JavaScript. A maior oportunidade é tratar o Login como a primeira tela do sistema, e não como uma landing page: dois campos, um botão, o logo de verdade, os cinco temas, uma linha honesta de ajuda, e o erro na língua da casa.

## O Que Está Funcionando

1. **Estrutura do formulário**: labels visíveis, ícone que acende no foco, botão de 52px com "Entrando..." e inputs desabilitados durante o submit (`LoginForm.jsx:66-151`). O anel de foco laranja global da Fase 1 funciona em todos os controles focáveis.
2. **Health check antes do submit** (`useLogin.js:34-60`): não deixa a pessoa digitar e clicar num backend morto. Falta só a mensagem.
3. **Lottie em `import()` dinâmico com skeleton** (`LoginIllustration.jsx:27`): o formulário nunca espera os 14 MB. Hierarquia `h1` → traço laranja → subtítulo, legível.

## Problemas Prioritários

**[P0] E-mail inexistente devolve uma exceção crua do servidor** — `backend/server.js:143-146, 222-227`, `services/auth.js` (3 tentativas em 500), `LoginForm.jsx:57`
Por que importa: `dados.total === 0` é estrito e o IXC devolve `"0"` em texto, então `dados.registros[0]` explode e o `catch` manda `Erro interno no servidor: ${erro.message}` para a tela. Todo e-mail errado, o erro mais comum de um colaborador novo, aparece como crash; o front ainda tenta três vezes (2,4 s). Depois, o foco vai para o `body` e nada é anunciado.
Fix: `Number(dados.total) === 0 || !dados.registros?.length` → 401 "Usuário não encontrado."; nunca expor `erro.message` (texto fixo + log); no front, `role="alert"` no banner, `aria-invalid` e `aria-describedby` no campo, `focus()` no campo de senha após o erro, texto do banner em `vermelho-alerta-texto` (4,41 → 6:1).
Comando: `/impeccable harden`

**[P1] Formulário invisível para autofill, gerenciadores de senha e leitor de tela** — `LoginForm.jsx:8, 20-29, 84-90, 95-113`
Por que importa: WCAG 1.3.1, 1.3.5, 2.1.1, 4.1.2. Inputs sem `id`, `name` e `autocomplete`; `<label>` sem `htmlFor` (`labels.length = 0`); e-mail `type="text"` sem `inputmode`; botão do olho sem nome e com 22×22; "Lembrar senha" é um `span` dentro de `label onClick`, sem `input`, invisível ao Tab e ao leitor de tela.
Fix: `<input type="email" id="email" name="username" autocomplete="username" inputMode="email">`, `<input type="password" id="senha" name="password" autocomplete="current-password">`, `htmlFor`, checkbox real em `sr-only` com o quadrado como irmão, `aria-label="Mostrar senha"` + `aria-pressed` no olho com 44×44.
Comando: `/impeccable harden`

**[P1] "Lembrar senha" grava a senha em claro no `localStorage` por 7 dias** — `useLogin.js:6-19, 84-89`
Por que importa: qualquer pessoa com acesso ao navegador lê a senha do IXC, que é a fonte de verdade da empresa. Quando a senha muda no IXC, a cópia velha continua sendo preenchida.
Fix: virar "Manter conectado" persistindo só a sessão (o `App.jsx` já faz isso com `@Stitch:user` e `expiry`); apagar `@Stitch:creds` no próximo load e nunca mais gravar senha.
Comando: `/impeccable harden`

**[P1] A tela ignora os cinco temas e o contraste** — `Login.jsx:10, 22-23, 59, 67`, `LoginForm.jsx` inteiro, `LoginIllustration.jsx`
Por que importa: PRODUCT.md, princípio 5; DESIGN.md manda verificar todo componente nos cinco temas. Medido: `html.dark` e `html.dark-amoled` renderizam a mesma tela branca. E no claro: botão "Entrar" 2,8:1 no topo do gradiente (WCAG 1.4.3), placeholder 2,38:1, borda do input 1,14:1 (1.4.11), rodapé 2,36:1, checkbox 2,50:1.
Fix: tokens `C.*`/variáveis CSS em tudo; fundo `--bg` (azul-gelo no claro) sem o bege `#FFF7ED`; botão sólido `accent` com `onAccent` (6,2:1) ou `accentDark` com branco (5,2:1), sem sombra em repouso; placeholder e ícones em `ink2`; borda `line` sobre `surface` branca (não sobre `surfaceSoft`), com o anel de foco do sistema.
Comando: `/impeccable colorize`

**[P1] Copy e navegação fabricadas** — `LoginForm.jsx:50, 114-116, 155`, `Login.jsx:33-52, 75`, `LoginIllustration.jsx:93-98`
Por que importa: "Prestek Inc." erra o nome da empresa (é Prestek Telecom); "SSO · SAML 2.0" é uma alegação de segurança falsa, o que o PRODUCT.md proíbe; "Status" e "Docs" caem no 404; "Problemas ao acessar?" é `#`; "Suporte" é o site público; "Carregando painel 3D..." promete o que não vem.
Fix: `h1` "Entrar na Intranet", rodapé "Prestek Telecom", linha de rodapé do form "Use o mesmo usuário e senha do IXC", remover Status/Docs, "Problemas ao acessar?" vira uma linha real com ramal ou e-mail da TI (`mailto:`), unificar label/placeholder/erro em "E-mail do IXC".
Comando: `/impeccable clarify`

**[P2] Ilustração de 14 MB baixada e animada até onde ninguém vê** — `Login.jsx:62`, `LoginIllustration.jsx:27, 81-85`
Por que importa: `hidden lg:block` esconde mas monta o componente, que faz o `import()`: no celular 14,16 MB transferidos (medido) e o SVG anima em `display: none`; com `prefers-reduced-motion: reduce` continua animando (o CSS global não alcança o `lottie-web`). O conteúdo é genérico.
Fix: montar `LoginIllustration` só acima de `lg` (`matchMedia`); `autoplay` desligado com movimento reduzido; melhor ainda, trocar por um painel estático com o logo real e os anéis de sinal do sistema (`ui/heroGradiente.js`).
Comando: `/impeccable optimize`

**[P3] Espaçamento e escala fora do sistema no celular** — `LoginForm.jsx:48`, `Login.jsx:26-54`
`p-14` (56px) fixo deixa o formulário com 229px de largura em 390px; `h1` de 30px em duas linhas; header com alvos de 20px; `min-height: 600px`. Fix: `p-6 md:p-10 lg:p-14`, `text-2xl` abaixo de `md`, header removido no celular.
Comando: `/impeccable adapt`

## Sinais de Alerta por Persona

**Jordan (primeiro dia):** lê "Prestek Inc." e estranha; vê "E-mail" com placeholder "Seu usuário IXC" e não sabe qual dos dois; digita algo, recebe `Cannot read properties of undefined (reading '0')` e conclui que o sistema caiu; "Problemas ao acessar?" não faz nada, "Docs" dá 404, "Suporte" abre o site público. Vai perguntar no WhatsApp, exatamente o que o portal existe para eliminar.

**Sam (leitor de tela / teclado):** Tab passa por Status → Docs → Suporte antes do formulário; chega em "edit text" sem nome; botão sem nome ao lado da senha; "Lembrar senha" é pulado pelo Tab; submete com Enter e o erro não é anunciado; foco no `body`.

**Casey (celular, uma mão, 3G):** baixa 14 MB que nunca vai ver; teclado errado no campo de e-mail; sem autofill, digita a senha inteira; o olho de 22×22 está no canto oposto ao polegar; com o teclado aberto o botão "Entrar" fica abaixo da dobra; "Aguardando servidor..." não diz se é a rede dela ou o sistema; tela branca se estava no AMOLED.

## Observações Menores

- `<title>` da aba é "Prestek Intranet Dashboard" no Login; deveria ser "Entrar · Prestek Intranet". `favicon.ico` 404.
- `transition-all` no botão anima também o `outline-color`: o anel de foco entra em fade.
- Dois `<pattern id>` inline (`dots-bg`, `dots-panel`) com IDs globais.
- Raios fora da escala: `rounded-tl-[80px]`, `rounded-[5px]`; `cursor-wait` em vez de `not-allowed`.
- Blocos comentados de "Sistemas operacionais" e "99.99% uptime" (`LoginIllustration.jsx:57-62, 100-115`): apagar.
- 13,5px e 14,5px em vários textos (o detector só pega `text-[Npx]` literal, mas também estão fora da rampa).
- O `NotFound` para quem está deslogado aparece ao clicar em "Status"/"Docs"; corrigir na mesma change (a Fase 2 cobre os dois).

## Perguntas Provocativas

1. O que um técnico de campo, às 6h, no celular com 3G, precisa ver nesta tela além de dois campos e um botão? Tudo o que sobra está pagando aluguel?
2. Se o Login é a única tela sem o chrome, por que é também a única fora do sistema de temas e sem o logo que a Sidebar já usa?
3. Quem responde "Problemas ao acessar?" na Prestek de verdade? A resposta cabe em uma linha e substitui três links vazios.
4. "Lembrar senha" guarda a senha; o IXC é a fonte de verdade. Quando a pessoa troca a senha no IXC, o que a intranet faz com a cópia velha?
