## Why

O Login é a primeira tela de todo dia de trabalho e hoje é a pior do portal: crítica 16/40 e audit 6/20 (2026-09-10). Um e-mail que não existe devolve `Erro interno no servidor: Cannot read properties of undefined (reading '0')`, o formulário não tem nome para leitor de tela nem `autocomplete` para o navegador, "Lembrar senha" grava a senha em claro no `localStorage`, a tela ignora os cinco temas, e a copy afirma coisas que o produto não é ("Prestek Inc.", "SSO · SAML 2.0", links "Status" e "Docs" que caem no 404). O NotFound passou na Fase 1, mas a animação do 404 é preta e some no escuro, e o chrome contradiz a tela de sem-permissão (header "Painel Admin", "Mais" aceso). A Fase 2 do programa Impeccable (`programa-impeccable`, tarefas 2.4 a 2.6) fecha as duas telas.

Referências: `docs/impeccable/audit-login-2026-09-10.md` (backlog consolidado, 9 blocos) e `.impeccable/critique/2026-09-10T22-34-37Z__src-components-login-jsx.md`.

## What Changes

- **Backend `/api/login`**: e-mail inexistente vira 401 "Usuário não encontrado." (comparação numérica de `total` e checagem de `registros`); o `catch` devolve texto fixo e loga o detalhe, nunca `erro.message`. O front só faz retry em 5xx.
- **Formulário acessível**: `type="email"`, `id`/`name`/`autocomplete`/`inputMode`, `label htmlFor`, `autoFocus` no e-mail, checkbox real, botão do olho com nome e 44px, validação de formato antes do submit; banner de erro com `role="alert"`, `aria-invalid` e foco no campo após o erro.
- **BREAKING (comportamento)**: "Lembrar senha" vira "Manter conectado". A chave `@Stitch:creds` (e-mail + senha em claro) deixa de existir e é apagada no primeiro load; quem tinha senha salva faz login uma vez. A sessão de 7 dias que o `App.jsx` já controla continua.
- **Tema e contraste**: o Login passa a ler `useBentoTheme` e as variáveis CSS como o resto do portal; fundo `bg`, card `surface`, botão `accent` + `onAccent`, inputs sobre `surface` com borda `line` e o anel de foco do sistema; sem bege, sem sombra em repouso; verificado nos cinco temas.
- **Copy honesta**: "Entrar na Intranet", "Prestek Telecom", "Use o mesmo usuário e senha do IXC", "E-mail do IXC" em label, placeholder e erro; "Fale com a TI para recuperar o acesso." como texto sem link; removidos "Status", "Docs", "Suporte", "SSO · SAML 2.0", "painel 3D" e a tagline; `<title>` da aba por view.
- **Painel da marca**: `LoginIllustration` vira um painel estático com o `Logo.webp` real, o gradiente do hero e os anéis de sinal (`ui/heroGradiente.js`); o Lottie `2997674.json` (14 MB) sai do repositório e do bundle.
- **NotFound no escuro**: a animação do 404 é substituída por um SVG com tokens (`ink`/`accent`); o JSON não é mais importado na variante sem-permissão; o header mostra "Página não encontrada" / "Acesso restrito" e a barra inferior não acende "Mais" nesses estados.
- **Mobile**: padding do formulário `p-6 md:p-10 lg:p-14`, `h1` menor abaixo de `md`, sem `min-height` no celular; "Aguardando servidor..." ganha texto e botão "Tentar agora" depois de duas falhas.
- **Polish**: `transition` específica no botão, raios da escala, tamanhos na rampa, `favicon.ico`.

## Capabilities

### New Capabilities
- `login-screen`: a tela de entrada do portal: formulário acessível e com autofill, mensagens de erro na língua da casa, estado de servidor indisponível, "Manter conectado" só com sessão, painel da marca, tokens dos cinco temas, layout no celular.
- `login-api`: contrato da rota `POST /api/login`: códigos por causa (401 usuário não encontrado / senha incorreta, 403 inativo, 502 IXC fora, 500 com texto fixo), sem detalhes internos na resposta; retry do cliente só em 5xx.
- `not-found-screen`: as duas variantes do `NotFound` (`nao-encontrado`, `sem-permissao`), ilustração que respeita o tema, ação de voltar coerente com o estado de sessão.

### Modified Capabilities
- `chrome-header-context`: o título do header passa a refletir o que foi renderizado, não a view pedida: "Acesso restrito" quando a view existe mas o papel não permite, "Página não encontrada" quando a view não existe.
- `mobile-bottom-navigation`: o slot "Mais" não fica ativo quando a view atual não é acessível ao papel do usuário nem quando a view não existe.

## Impact

- `backend/server.js` (rota `/api/login`), `src/services/auth.js` (política de retry).
- `src/components/Login.jsx`, `Login/LoginForm.jsx`, `Login/LoginIllustration.jsx`, `Login/Icons.jsx`, `src/hooks/useLogin.js`.
- `src/components/NotFound.jsx`, `src/components/Header.jsx`, `src/components/MobileBottomNav.jsx`, `src/navigation.js` (título por estado), `index.html` (`<title>`), `src/App.jsx` (título por view, limpeza de `@Stitch:creds`).
- Assets: remove `src/image/icons/2997674.json` (14 MB) e `lottieflow-404-12-4-000000-easey.json` (72 KB); adiciona um SVG de 404 e um painel de marca em código. `lottie-react` pode deixar de ser dependência se nenhuma outra tela a usar (conferir antes de remover).
- Sem migração de dados: só limpeza de uma chave de `localStorage` no cliente.
