# Trabalhar em outra máquina

Como colocar o projeto para rodar em um PC novo e como manter dois PCs em dia. A fonte da verdade é o GitHub (`prestektelecom/app_prestek_intranet`, privado): nada se copia por pen drive ou nuvem, tudo passa por `git`.

> Este roteiro é para **máquinas de desenvolvimento**. O servidor de produção (`201.150.48.6`) tem roteiro próprio em `PENDENCIAS_PRODUCAO.md`, seção 7, e não usa o `npm run sincronizar`.

## 1. Pré-requisitos

| Ferramenta | Versão | Para quê |
|---|---|---|
| Git | qualquer recente | clonar e sincronizar |
| Node.js | 20 ou mais novo (o servidor usa 22) | front (Vite 5) e backend |
| GitHub CLI (`gh`) | qualquer recente | login no GitHub e abrir PR |

No Windows: `winget install --id Git.Git`, `winget install --id OpenJS.NodeJS.LTS` e `winget install --id GitHub.cli`. Depois **feche e abra o terminal** para o PATH atualizar. Confira com `git --version`, `node -v` e `gh --version`.

## 2. Primeira vez

```
gh auth login
```
Escolha `GitHub.com`, `HTTPS`, `Yes` (autenticar o Git) e `Login with a web browser`. **Entre com uma conta que tenha acesso à organização `prestektelecom`**; o repositório é privado e, com a conta errada, o GitHub responde "Repository not found". Confira com `gh auth status`.

```
git clone https://github.com/prestektelecom/app_prestek_intranet.git
cd app_prestek_intranet
npm run sincronizar
```

O `npm run sincronizar` instala as dependências da raiz e do `backend/` (com `npm ci`, porque ainda não existe `node_modules`) e avisa se faltar o `.env`.

> **Pasta sincronizada por outro programa** (Obsidian Sync, OneDrive, Google Drive): não clone o projeto dentro dela, ou exclua `node_modules/`, `dist/` e `.git/` da sincronização. Dois sistemas mexendo na mesma pasta corrompem o repositório. O Git já é o sincronizador.

## 3. O arquivo `.env` (o único que não vem do Git)

`backend/.env` guarda as credenciais e **nunca** vai para o repositório. Duas formas de ter um na máquina nova:

1. **Copiar da máquina que já funciona**, por um canal seguro (pen drive, gerenciador de senhas). Nunca por e-mail, chat ou nuvem aberta.
2. **Criar do zero** com as variáveis abaixo, pedindo os valores a quem administra o IXC e o banco.

| Variável | Obrigatória | O que é |
|---|---|---|
| `IXC_HOST`, `IXC_USER_ID`, `IXC_TOKEN_SECRET` | sim | acesso à API do IXC |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | sim | PostgreSQL (`DB_PRIMARY_HOST`/`DB_REPLICA_HOST` podem substituir `DB_HOST`) |
| `PORT` | sim | porta do backend (`3001`) |
| `JWT_SECRET` | sim | assina as sessões (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `CORS_ORIGENS` | sim | origens do front, separadas por vírgula e sem espaço (em dev, `http://localhost:5000`, que também é o padrão) |
| `IXC_SENHA_PADRAO_COLABORADOR` | sim | senha padrão usada em rotas de colaboradores |
| `HOST` | não | `127.0.0.1` restringe o backend a esta máquina (padrão `0.0.0.0`) |
| `CACHE_TTL_*`, `CACHE_STW_COBERTURA` | não | tempos de cache; sem eles valem os padrões |

> **O `.env` de desenvolvimento aponta para o banco e o IXC de PRODUÇÃO.** Não existe staging: subir o backend local já é produção. Teste com leitura primeiro e só escreva no IXC ou no banco com autorização do Felix. Ver `MEMORIA.md`, seção Ambiente.

## 4. Rodar

```
npm run dev
```
Sobe o backend (porta `3001`), espera o `/api/health` responder e então sobe o front (Vite). Abra o endereço que o Vite mostrar no terminal.

## 5. No dia a dia: manter os dois PCs iguais

**Ao começar a trabalhar**, em qualquer máquina:
```
npm run sincronizar
```
O script baixa a `main` (só avança, nunca sobrescreve), reinstala dependências se o `package-lock.json` mudou, confere o `.env` e avisa se entraram migrations novas. Se houver alteração não commitada, ele **não mexe na branch** e só avisa.

**Ao terminar**, sempre deixe o trabalho no GitHub para a outra máquina ver:
```
git add <arquivos>
git commit -m "feat(escopo): o que mudou"
git push -u origin <sua-branch>
```

**Continuar na outra máquina um trabalho em andamento:**
```
git fetch
git switch <sua-branch>
```

O fluxo completo (branches `feat/`, `fix/`, `docs/`, PR, merge por squash, releases) está no `CLAUDE.md`, seção "Git e GitHub".

## 6. Claude Code na máquina nova

- O `CLAUDE.md`, o `MEMORIA.md` e as skills em `.claude/skills/` vêm no clone, então o Claude já abre sabendo as regras do projeto.
- O `.claude/settings.local.json` **não é versionado**: as permissões não viajam. Para o Claude poder enviar branches e abrir PR, recrie as regras de permissão do Bash (`git push` das branches `feat/*`, `fix/*`, `docs/*`, `chore/*`, `hotfix/*`, e `gh pr create*`), mantendo `git push origin main*`, `--force`, `--tags` e `--delete` negados. A lista está na conversa de configuração e na seção "Git e GitHub" do `CLAUDE.md`.
- Nunca coloque senhas dentro de regras de permissão. Já aconteceu e está registrado em `PENDENCIAS_PRODUCAO.md`, seção 8.

## 7. Problemas comuns

| Sintoma | Causa e saída |
|---|---|
| `Repository not found` | conta errada no `gh`/Git. `gh auth status` e `gh auth login` com a conta da organização; no Windows, apague `git:https://github.com` do Gerenciador de Credenciais |
| `403` ao dar push | a conta não tem escrita no repositório. Peça acesso **Write** a um dono da organização |
| `git pull` recusa (não é fast-forward) | a `main` local divergiu. **Não use `--force`.** Veja `git status` e `git log origin/main..main` e peça ajuda |
| `LF will be replaced by CRLF` | aviso normal no Windows, sem efeito no conteúdo |
| `npm ci` falha em um pacote nativo | Node muito antigo ou versão diferente. Use Node 20+ e rode `npm ci` de novo |
| `Cannot find module` depois de um pull | dependência nova. Rode `npm run sincronizar` |
