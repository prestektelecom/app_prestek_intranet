---
target: src/components/Login.jsx (tela de Login)
total_score: 31
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Login.jsx"
target_fingerprint: "sha256:e91e313c8bd4554c80358a37249412178d7f200b77081057bc86f18f47625f21"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Login.jsx"
timestamp: 2026-09-10T23-42-23Z
slug: src-components-login-jsx
---
# Crítica de Design — Tela de Login, 2ª rodada (após a change `impeccable-login`)

Método: dual-agent (A: ab05075c002238599, revisão de design com navegador · B: a4684bcee2a8ecbe2, detector CLI + overlay injetado + medições). Rodadas em sequência para dividir um único navegador Playwright, isoladas uma da outra. `http://localhost:5000` sem sessão; 1440×900, 390×844, 390×540 (teclado aberto), 720×600 (zoom 200%); claro, Default Dark, Cyber-Obsidian e AMOLED; fluxo de erro real contra o backend, servidor fora (health bloqueado), Tab, Espaço no checkbox, Enter no olho. Overlay em 3 vistas (`critB-login2-*.png`); 17 capturas da revisão (`critA-login2-*.png`). Alvo idêntico à rodada de 2026-09-10 pela manhã (16/40).

## Placar de Saúde de Design

| # | Heurística | Nota | Antes | Problema-chave |
|---|---|---|---|---|
| 1 | Visibilidade do Status do Sistema | 3 | 2 | "Tentar agora" não respondia ao clique (botão e banner idênticos antes e 3 s depois) |
| 2 | Correspondência com o Mundo Real | 4 | 1 | Vocabulário do IXC, placeholder com o domínio real; nada a apontar |
| 3 | Controle e Liberdade do Usuário | 3 | 2 | O erro não some ao editar o campo apontado; fica até o próximo Enter |
| 4 | Consistência e Padrões | 2 | 1 | Campo de texto focado não desenhava o anel do sistema; checkbox de 20px com raio 8 lia como rádio |
| 5 | Prevenção de Erros | 3 | 2 | Validação antes do envio; senha limpa quando errada. Uma falha isolada do health check travava o botão |
| 6 | Reconhecimento vs. Memorização | 4 | 3 | `autocomplete` correto, rótulos e placeholders certos |
| 7 | Flexibilidade e Eficiência de Uso | 3 | 1 | Autofocus, Enter em qualquer campo, Tab em 5 paradas |
| 8 | Design Estético e Minimalista | 4 | 2 | Dois campos, um botão; "Intranet" no painel repete o `h1` |
| 9 | Reconhecer/Diagnosticar/Recuperar de Erros | 3 | 1 | Mensagem aponta o campo, marca `aria-invalid`, foca; erro e aviso amarelo podiam empilhar |
| 10 | Ajuda e Documentação | 2 | 1 | "Fale com a TI para recuperar o acesso." sem ramal, e-mail ou link (decisão do Felix: sem contato oficial por enquanto) |
| **Total** | | **31/40** | **16/40** | **Bom (78%)** |

## Veredito de Especificidade de Design

**Avaliação A (sem detector):** é a porta desta empresa, no desktop. O painel da marca reutiliza o gesto dos heroes (rampa `accentDeep → #C2410C → accent` com anéis de sinal), o logo Prestek em branco, e o formulário fala a língua da casa ("E-mail do IXC", "Use o mesmo usuário e senha do IXC"). Nada de tagline, nada de Lottie de estoque, nada de "Bem-vindo de volta". Tokens do tema em tudo: a tela muda de temperatura nos cinco temas sem mudar de lugar. No celular, antes desta síntese, virava um template: o painel não monta e com ele sumia o único logo. (Corrigido em seguida: o logo passou a aparecer acima do `h1` abaixo de `lg`; B mediu `img[alt="Prestek Telecom"]` 48×32 visível.)

**Scan determinístico (B):** CLI **0 findings** (eram 9) nos seis arquivos do Login. Overlay: 2 findings, ambos falsos positivos com justificativa: `low-contrast` "1,0:1" em "Intranet" do painel (o detector subiu até o card branco porque o painel só tem `background-image`; sobre a rampa real o branco rende 4,8 a 6,0:1) e `layout-transition` no `body` (nenhum elemento montado transiciona `width`; vem de regras globais do react-grid-layout e de Cobertura). Medições: `#email` `type=email name=username autocomplete=username inputMode=email labels=1`; `#senha` `type=password autocomplete=current-password labels=1`; `#lembrar` é `input[type=checkbox]` real com label de 44px; `[role=alert][aria-live=assertive]` presente e vazio no estado inicial; `activeElement` ao carregar `#email` e após o erro `#email` com `aria-invalid`. Contrastes: "Entrar" 6,22:1 (claro), 6,11 (Default Dark e Cyber); placeholder 7,69 / 5,69; borda do campo 3,01 / 5,69; banner de erro 6,00 (claro), 5,03 (Default Dark), **5,29 (Cyber, com o `dangerStrong` já corrigido para `#FF5C7A`)**; "Manter conectado" 17,35. Sem overflow em nenhum viewport; fonte mínima 13px. Celular: `Logo.webp` 316 KB para um logo de 48×32, e nenhum `2997674` ou Lottie no DOM ou na rede. Onde A e B concordam: **foco invisível nos campos de texto**, o `outline: none` inline no input com a regra `.login-field:focus-within` prometida no comentário e ausente do CSS. Onde B corrige A: o texto de erro no Cyber já media 5,29:1 no momento da medição de B (A mediu 4,37:1 antes do ajuste do token).

**Overlays visuais:** `.playwright-mcp/critB-login2-desktop.png`, `critB-login2-desktop-erro.png`, `critB-login2-mobile.png`, mais `critB-login2-desktop-focus-email.png`, `critB-login2-desktop-erro-defaultDark.png`, `critB-login2-desktop-erro-cyber.png`. Live-server parado, aba fechada.

## Impressão Geral

De 16 para 31 em um dia. O que era mentira ("Prestek Inc.", "SSO · SAML 2.0", "Docs", "Status") sumiu; o que era crash (e-mail inexistente) virou "Usuário não encontrado." em 0,4 s com o foco no campo; o que era invisível (tema, leitor de tela, autofill) passou a existir. Sobrou uma lacuna que eu mesmo abri nesta change, o anel de foco dos campos, e três incômodos de borda: um health check que travava cedo demais, um "Tentar agora" mudo, e o celular sem logo. Todos pequenos, todos corrigidos logo após esta leitura.

## O Que Está Funcionando

1. **Semântica de formulário acima da média**: `role="alert"` permanente antes do conteúdo, `aria-invalid` + `aria-describedby` só quando há erro, foco movido para o campo apontado com `erroSeq` para erros repetidos, checkbox real em `sr-only` com o anel no label, olho com `aria-pressed`. Verificado no teclado: Tab em 5 paradas, Espaço alterna, Enter no olho mostra e oculta.
2. **Disciplina de tokens**: todo contraste passa nos quatro temas medidos; botão `accent`/`onAccent` 6,1 a 7,1:1; placeholder em `ink2`; borda do campo em `muted`.
3. **Backend e serviço alinhados com a tela**: `campo` na resposta 401, retry só em 5xx, exceção nunca chega ao usuário, credenciais antigas em claro apagadas no load.

## Problemas Prioritários

**[P1] Foco invisível nos campos de texto (WCAG 2.4.7)** — `LoginForm.jsx` (input com `outline: 'none'` inline; wrapper sem `:focus-within`)
Por que importa: quem navega por Tab não sabe em qual campo está; é o controle mais usado da tela e o único sem indicador. O botão e o olho ganham o anel corretamente.
Fix: `.login-field:focus-within { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent) }` no `index.css`; o input mantém `outline: none` para não desenhar dois anéis.
Comando: `/impeccable harden`

**[P1] Texto de erro no Cyber-Obsidian em 4,37:1** — `useBentoTheme.js`, `BENTO_DARK_CYBER.dangerStrong`
Por que importa: é a mensagem que o usuário mais precisa ler quando algo deu errado; o tema é escolha permanente do produto.
Fix: `dangerStrong: '#FF5C7A'` (5,3:1 sobre o `dangerSoft` composto no vidro), mantendo `danger` e `dangerFill`. (Aplicado antes da medição de B, que já leu 5,29:1.)
Comando: `/impeccable colorize`

**[P2] Uma falha do health check travava o botão** — `useLogin.js`
Por que importa: com timeout de 2,5 s, um RTT de 3G lento declarava a intranet fora do ar e desabilitava "Entrar" sem explicação por 3 a 6 s; `loginUsuario` já cobre 5xx com retry.
Fix: só travar o botão com `servidorFora` (duas falhas seguidas); timeout 6 s, intervalo 5 s.
Comando: `/impeccable harden`

**[P2] "Tentar agora" não respondia e "Fale com a TI" não leva a lugar nenhum** — `LoginForm.jsx`
Por que importa: os dois existem para o momento em que a pessoa está travada.
Fix: "Verificando..." com `disabled` e `aria-busy` enquanto verifica; o contato da TI fica pendente de decisão (registrado na memória do projeto).
Comando: `/impeccable clarify`

**[P2] No celular a porta não tinha marca** — `Login.jsx`, `LoginBrandPanel.jsx`
Por que importa: é a tela de identidade mais vista pelo pessoal de campo, que entra pelo celular.
Fix: `Logo.webp` de 32px acima do `h1` abaixo de `lg` (branco por filtro nos temas escuros), sem custo além do próprio logo; e o logo servido em 480px (16 KB) em vez de 1616px (316 KB).
Comando: `/impeccable layout`

**[P3]** checkbox com raio 8 lia como rádio (→ 6, exceção registrada); CSS morto do Login antigo (`.login-card`, `.login-btn`, `login-pulse`) removido; "Manter conectado" sem dizer por quanto tempo (→ "por 7 dias"); erro vermelho e aviso amarelo podiam empilhar (→ o aviso limpa o erro); "Intranet" no painel repete o `h1`.

## Sinais de Alerta por Persona

**Jordan (primeiro dia):** entende "Use o mesmo usuário e senha do IXC" se já recebeu o acesso; se não recebeu, "Usuário não encontrado." e "Fale com a TI" sem dizer quem. Vai perguntar a alguém do lado.

**Sam (leitor de tela / teclado):** com leitor de tela, a tela é boa: rótulos reais, alert anunciado antes do foco mover, checkbox de verdade, olho com estado. Com teclado e visão, os campos de texto não mostravam o foco (P1, corrigido).

**Casey (celular, uma mão, 3G):** sem Lottie e sem painel, a carga é só o formulário; alvos de 44px; botão alcançável com o polegar e visível com o teclado aberto. Riscos que existiam: o health check travar o botão cedo (corrigido) e não ver a marca (corrigido).

## Observações Menores

- Backend respondia "Email é obrigatório." sem hífen (→ "E-mail é obrigatório.", com `campo`).
- O 401 distingue "Usuário não encontrado." de "Senha incorreta." (enumeração de e-mails): aceitável numa intranet, mas é uma escolha; registrada como decisão.
- Autofocus no e-mail abre o teclado no celular ao carregar: decisão consciente para uma tela que só tem isso a fazer.
- Card no Default Dark quase não se destaca do fundo (1,15:1 vs. página); dentro da Tonal Dark Rule, no limite do visível.

## Perguntas Provocativas

1. O health check a cada 5 s existe para quê, se `loginUsuario` já faz retry em 5xx e a mensagem genérica já existe? Protege o usuário ou o log do servidor?
2. "Fale com a TI" é a resposta para conta inexistente, usuário inativo e senha esquecida. Três problemas com três donos; uma frase resolve os três?
3. O painel diz "Intranet", o `h1` diz "Entrar na Intranet", a aba diz "Entrar · Prestek Intranet". Qual dos três o usuário lê de verdade?
