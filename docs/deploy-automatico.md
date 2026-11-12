# Deploy automático

O servidor se atualiza sozinho: de tempos em tempos ele pergunta ao GitHub se a `main`
tem commit novo e, se tiver, aplica. Nenhuma credencial de produção sai do servidor
(ele usa a chave de deploy de leitura que já existe), então não há CI com acesso a
produção. Decisão do Felix em 2026-11-12: gatilho a cada merge na `main`.

Quem faz o trabalho é o `scripts/deploy.sh`, agendado no `cron` do usuário `antonio`.

## O que o script faz

1. Pega uma trava (`flock`) para não rodar duas vezes ao mesmo tempo.
2. **Para sem mexer em nada** se houver alteração local em arquivo rastreado no servidor,
   se o `git fetch` falhar, ou se a `main` não descender do commit atual do servidor.
3. Se o commit é o mesmo, sai em silêncio. Se o commit já falhou antes, também espera um
   commit novo em vez de tentar de novo a cada rodada.
4. Avança com `git merge --ff-only` e olha **quais arquivos mudaram**:
   - `package-lock.json` (raiz ou `backend/`) mudou: `npm ci` naquela pasta.
   - `src/`, `public/`, `index.html`, `package*.json` ou config do Vite/Tailwind/PostCSS
     mudaram: refaz o build do front em `dist.new` e só troca o `dist/` se o build der
     certo, então o site nunca fica sem `dist/`. A URL da API entra no build
     (`VITE_API_URL=https://intranet.prestek.com.br`).
   - Qualquer coisa em `backend/` mudou: `pm2 restart prestek-backend` e espera o
     `/api/health` responder (qualquer resposta HTTP serve; 503 significa banco fora, o
     que não é culpa do deploy).
5. Se npm, build ou restart falharem, **reverte** o código para o commit anterior,
   devolve o `dist/` antigo, reinicia o backend e registra o commit com problema.
6. Escreve tudo em `~/.prestek-deploy/deploy.log`.

## O que ele NÃO faz

- **Migration nunca é automática.** O `migrations/run.js` reexecuta todos os `.sql` e engole
  erros. Se o deploy traz arquivo novo em `backend/migrations/`, o código sobe e o log
  grava `ATENÇÃO: ... migration(s) que NÃO foram aplicadas`. Aplique só o arquivo novo, via
  `pg`, e **antes** de mesclar um PR que dependa dela, quando o código novo precisar da
  tabela ou coluna.
- **Variável nova no `.env` também é manual.** O script não mexe no `.env`.
- Não substitui staging. Ele reverte falha de build e de inicialização do backend, mas não
  defeito de lógica: um PR com bug de lógica vai para produção. O merge é a aprovação.

## Instalação (uma vez, no servidor)

Depois que este PR for mesclado:

```bash
# 1) Puxar uma última vez à mão, com as variáveis de git do MEMORIA.md
cd /home/antonio/app_prestek_intranet
git pull origin main

# 2) Ensaio: mostra o que faria, sem alterar nada
DRY_RUN=1 bash scripts/deploy.sh
cat ~/.prestek-deploy/deploy.log

# 3) Confirmar que o cron está disponível para o usuário
crontab -l

# 4) Agendar a cada 5 minutos
crontab -e
#   */5 * * * * /bin/bash /home/antonio/app_prestek_intranet/scripts/deploy.sh >/dev/null 2>&1
```

O cron não carrega o ambiente do login. O script refaz o `PATH` do `git`/`pm2` em
`~/local` e carrega o `nvm` se existir. Se `node`/`npx` não for achado quando rodar pelo cron,
o `deploy.log` mostra o erro; o ajuste é incluir a pasta do Node no `PATH` dentro do script.

Se o `crontab` não existir para o usuário, alternativa sem root: deixar o `pm2` agendar
(`pm2 start scripts/deploy.sh --name prestek-deploy --interpreter bash --cron "*/5 * * * *" --no-autorestart`).

## Operar

| Preciso de... | Faça |
|---|---|
| Ver o que aconteceu | `tail -50 ~/.prestek-deploy/deploy.log` |
| Pausar o deploy automático | comentar a linha no `crontab -e` |
| Rodar agora, sem esperar 5 min | `bash scripts/deploy.sh` |
| Ensaiar sem alterar | `DRY_RUN=1 bash scripts/deploy.sh` |
| Voltar a uma versão antiga | pausar o cron, `git reset --hard <commit>` (ou `git checkout <tag>`), refazer o build, `pm2 restart prestek-backend` |
| Tentar de novo um commit que falhou | `rm ~/.prestek-deploy/failed-commit` |

Anote em `PENDENCIAS_PRODUCAO.md` o commit anterior antes de um deploy arriscado, como
antes: com o automático, o "voltar" é o `git reset --hard` acima.
