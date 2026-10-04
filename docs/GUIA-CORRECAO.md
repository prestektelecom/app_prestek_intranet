# Guia de Correção — Segurança Prestek Intranet
**Fonte:** campanha Mantis read-only 11/09/2026 · alvo `235d0de2` · estado DEV local (sem exposição)
**Onde executar:** notebook Prestek, no diretório do repositório `prestek_intranet` (PowerShell ou Git Bash)

---

## O que vamos corrigir (6 achados)

| # | problema | risco |
|---|----------|-------|
| G1 | Nenhuma das 88 rotas `/api/*` exige login | qualquer um na rede lê funcionários/colaboradores e usa o backend de proxy do IXC |
| G5 | Rotas admin confiam no header `x-admin-email` vindo do cliente | **qualquer usuário se declara admin** trocando o header (bypass de autorização) |
| G3 | `/api/login` sem limite de tentativas | força bruta de senha de funcionário |
| G4 | CORS reflete qualquer origem | qualquer site visita a intranet logada |
| G6 | Senha salva em texto puro no `localStorage` (`@Stitch:creds`) | quem abre o navegador do funcionário tem a senha |
| G2 | Dumps com PII versionados no git (`funcionario-detailed.json` = CPF, celular, endereço; `client_681.json`, `nomes.txt`, `func.json`) | PII de terceiro no histórico do repo |

Ordem abaixo = dependência real (auth primeiro, porque o resto se apoia nele).

---

## PASSO 0 — Sincronizar e abrir branch de segurança
```bash
cd C:/caminho/para/prestek_intranet    # ajuste ao seu caminho
git pull origin main
git checkout -b fix/seguranca-mantis
```
> O clone da VPS está 15 commits atrás do remoto — por isso o guia é pra rodar AÍ, no código atual. Se algum arquivo citado mudou de linha, o contexto do trecho (`app.use(cors...`) continua sendo o ponto de ancoragem.

---

## PASSO 1 — G1: middleware de autenticação (o conserto central)

**Decisão de design que já tomei por você:** o login já entrega `acesso_token` (que vem do IXC) e o backend guarda tudo em `usuarios_perfil` no Postgres. Em vez de inventar JWT novo, o token de sessão será **assinado pelo próprio backend** com um segredo local — simples, sem dependência externa, e sobrevive à rotação do `acesso_token` do IXC.

### 1a. Instalar a lib de sessão assinada
```bash
cd backend
npm install jsonwebtoken
```

### 1b. Criar `backend/middleware/auth.js` (arquivo novo, conteúdo completo)
```js
import jwt from 'jsonwebtoken';

const SEGRED = process.env.JWT_SECRET;
if (!SEGRED) throw new Error('JWT_SECRET ausente no .env — recusei subir inseguro');

// exceções: rotas que podem ser anônimas
const PUBLICAS = new Set(['/api/login', '/api/health']);

export function assinarToken(usuario) {
    return jwt.sign(
        { sub: String(usuario.usuario_id), email: usuario.usuario_email, admin: !!usuario.is_admin },
        SEGRED,
        { expiresIn: '12h' }
    );
}

export function requireAuth(req, res, next) {
    if (PUBLICAS.has(req.path)) return next();
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ sucesso: false, erro: 'Não autenticado.' });
    try {
        req.usuario = jwt.verify(token, SEGRED);   // payload vira fonte confiável p/ admin (passo 2)
        next();
    } catch {
        return res.status(401).json({ sucesso: false, erro: 'Sessão expirada. Faça login novamente.' });
    }
}
```

### 1c. Editar `backend/server.js` — três pontos:

**Ponto A** — logo após `app.use(express.json())` (linha ~24), adicionar:
```js
import { requireAuth, assinarToken } from './middleware/auth.js';
app.use('/api', requireAuth);
```
> Se o import do topo já existir em outro formato, coloque `requireAuth`/`assinarToken` junto. `app.use('/api', ...)` ANTES das rotas é o que garante cobertura das 88 (e das futuras).

**Ponto B** — na resposta do `/api/login` (~linha 213, onde já monta o objeto com `acesso_token`), adicionar o token de sessão. Localize o trecho que retorna os dados do usuário e inclua o campo:
```js
        token_sessao: assinarToken({
            usuario_id: usuario.id,
            usuario_email: usuario.email,
            is_admin: usuario.is_admin,
        }),
```
> O objeto retornado já tem `acesso_token: usuario.acesso_token` — é ao lado dele. Se `is_admin` não estiver no objeto `usuario` nesse ponto, use o valor que a função de sincronização já retorna (`result.rows[0]?.is_admin`).

**Ponto C** — gerar o segredo UMA vez e registrar no `.env` do backend (NUNCA commitar):
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))" >> backend/.env
```
E no `backend/.env copy.example`, adicionar a linha `JWT_SECRET=` (vazia, só a chave).

### 1d. Editar o FRONTEND para enviar o token
O login hoje joga fora o que receberia. Em `src/hooks/useLogin.js` (ou `src/services/auth.js`, onde o `fetch('/api/login')` processa a resposta — linha ~18), após o sucesso salvar:
```js
localStorage.setItem('@Stitch:token', dados.token_sessao)   // 'dados' = json da resposta; ajuste ao nome da variável local
```
E criar `src/services/apiFetch.js` (arquivo novo) — wrapper que toda chamada usa:
```js
export function apiFetch(url, opts = {}) {
    const token = localStorage.getItem('@Stitch:token')
    return fetch(url, {
        ...opts,
        headers: { ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
}
```
Substituir os `fetch('/api...` dos 22 arquivos por `apiFetch('/api...` é mecânico mas trabalhoso. **Atalho honesto para hoje:** em `src/main.jsx` (ou `index` raiz do app), monkey-patch único:
```js
// Sessão: injeta Bearer em toda chamada /api (ver apiFetch.js p/ migração limpa depois)
const _fetch = window.fetch.bind(window)
window.fetch = (url, opts = {}) => {
    const t = localStorage.getItem('@Stitch:token')
    if (t && String(url).startsWith('/api')) {
        opts = { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${t}` } }
    }
    return _fetch(url, opts)
}
```
> Marque um TODO pra migrar pro `apiFetch` explícito — o patch funciona, mas esconde a dependência.

### 1e. Testar G1 (dev ligado)
```bash
# sem token → 401
curl -i http://localhost:PORTA_BACKEND/api/funcionarios | head -1
# com login → 200
curl -s -X POST http://localhost:PORTA_BACKEND/api/login -H "Content-Type: application/json" -d '{"email":"SEU_EMAIL","senha":"SUA_SENHA"}' | findstr token_sessao
curl -i -H "Authorization: Bearer <token_copiado>" http://localhost:PORTA_BACKEND/api/funcionarios | head -1
```
Esperado: 401 / token presente / 200. E o app no navegador continua logando normalmente.

---

## PASSO 2 — G5: admin de verdade (matar o header forjável)

As rotas admin (~5 pontos, linhas 3944–4363 do clone VPS) fazem:
```js
const adminEmail = String(req.headers['x-admin-email'] || '').trim();
```
Trocar cada ponto por:
```js
const adminEmail = req.usuario?.email || '';
```
E onde existe checagem de "é admin?" comparando com lista/env, usar `req.usuario.admin` (o flag assinado no token). No frontend, apagar `cabecalhoAdmin` de `src/components/ti/cadastro/api.js` e seus usos (o header não é mais necessário — o token carrega a identidade).

> **Por que importa:** hoje qualquer funcionário logado (ou qualquer um, antes do passo 1) vira admin escrevendo `-H "x-admin-email: chefao@prestek.com"`. O token assinado é a única fonte que o servidor pode confiar.

Teste: logado como não-admin, chamar rota admin → 403. Logado como admin → 200.

---

## PASSO 3 — G3: limite de tentativas no login
```bash
cd backend && npm install express-rate-limit
```
Em `server.js`, antes da rota `/api/login`:
```js
import rateLimit from 'express-rate-limit';
const limiteLogin = rateLimit({ windowMs: 60_000, max: 5, standardHeaders: true, legacyHeaders: false });
app.post('/api/login', limiteLogin, async (req, res) => {   // ← só adicionou o limiteLogin no meio
```
Teste: 6 logins errados em 1 min → resposta 429.

---

## PASSO 4 — G4: CORS fechado
Linha 23, trocar `app.use(cors({ origin: true }))` por:
```js
const ORIGENS = (process.env.CORS_ORIGENS || 'http://localhost:5173').split(',');
app.use(cors({ origin: ORIGENS }));
```
E no `.env`: `CORS_ORIGENS=http://localhost:5173` (quando publicar, acrescenta o domínio real separado por vírgula). Em DEV com proxy do Vite o CORS nem é exercitado, mas isso fecha a porta do dia do deploy.

---

## PASSO 5 — G6: tirar a senha do localStorage
`src/hooks/useLogin.js` guarda `{email, senha, expiry}` em `@Stitch:creds` pra "lembrar de mim". Trocar o conceito: lembrar **só o e-mail** e usar o token de sessão (12h) como credencial de permanência.
1. `lerCredenciasSalvas()` → ler apenas `email` de `@Stitch:email`; se houver `@Stitch:token` válido, já entrar (chamar `/api/health` autenticado pra validar).
2. No login com `lembrar=true`: salvar `@Stitch:email` + `@Stitch:token`; **nunca** a senha.
3. Migrar usuários existentes: na primeira leitura, se `@Stitch:creds` existir, apagar (`localStorage.removeItem(CHAVE_CREDS)`).

> O token expira em 12h e não abre a senha nem o acesso ao IXC direto — é o downgrade correto de "senha salva" pra "sessão salva".

---

## PASSO 6 — G2: PII fora do git
```bash
cd C:/caminho/para/prestek_intranet
git rm --cached backend/funcionario-detailed.json backend/client_681.json backend/func.json backend/nomes.txt backend/audit_results.json backend/os-data.json backend/os_data.json backend/ticket-data.json backend/ticket_data.json backend/ticket-success.json backend/wfl_data.json wfl_data.json
```
Adicionar ao `.gitignore` (raiz):
```
# dumps de debug com dados reais — NUNCA versionar
backend/*.json
!backend/package.json
!backend/package-lock.json
wfl_data.json
```
> `git rm --cached` mantém os arquivos no disco (pode continuar usando) e só os tira do versionamento futuro. O histórico antigo continua com eles — aceitável enquanto o repo for privado; se um dia ficar público/espelhado, aí precisa de `git filter-repo` (avisa antes, é outro procedimento).

---

## PASSO 7 — Conferência final + entrega
```bash
cd backend && npm run dev    # sobe sem erro?
# roda os testes 1e, 2, 3 acima
cd .. && git add -A && git commit -m "fix(seg): auth em todas rotas /api, admin via token assinado, rate-limit login, CORS whitelist, senha fora do localStorage, dumps PII fora do git (Mantis 11/09)"
git push origin fix/seguranca-mantis
```
Depois me avisa — eu reviso o branch pelo diff (leitura, sem tocar) e confirmo que os 6 achados fecharam. Se preferir, abro eu mesmo o PR de `fix/seguranca-mantis` → `main` via gh quando o push acontecer.

---

## Ordem de importância se faltar tempo hoje
1. **Passo 1** (auth) — sem ele nada importa
2. **Passo 2** (admin forjável) — é o pior bug de lógica
3. **Passo 6** (PII fora do git) — 2 minutos, faz já
4. Passos 3, 4, 5 — fecham o pacote antes do primeiro deploy

Qualquer erro que aparecer no meio (linha que não bate, import que quebra), me manda o texto do erro que eu ajusto o passo — o guia foi escrito contra o commit da VPS, o seu main pode ter divergido.
