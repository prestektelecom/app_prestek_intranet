#!/usr/bin/env bash
# Deploy automático da Prestek Intranet — roda NO SERVIDOR, não na máquina de desenvolvimento.
#
# O servidor consulta o GitHub com a chave de deploy (somente leitura). Se a `main`
# tem commit novo, o script puxa, refaz o build do front só se precisar e reinicia o
# backend só se precisar. Nenhuma credencial de produção sai do servidor.
#
# Uso (ver docs/deploy-automatico.md):
#   scripts/deploy.sh             # aplica, se houver commit novo
#   DRY_RUN=1 scripts/deploy.sh   # só diz o que faria, sem alterar nada
#
# Variáveis opcionais: APP_DIR, VITE_API_URL, PM2_APP, HEALTH_URL, STATE_DIR.

# Todo o corpo está numa função e o arquivo termina em `exit`: o `git merge` pode
# trocar este próprio script no meio da execução, e o bash lê o arquivo aos poucos.
main() {
    set -u

    APP_DIR="${APP_DIR:-$HOME/app_prestek_intranet}"
    VITE_API_URL="${VITE_API_URL:-https://intranet.prestek.com.br}"
    PM2_APP="${PM2_APP:-prestek-backend}"
    HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3001/api/health}"
    STATE_DIR="${STATE_DIR:-$HOME/.prestek-deploy}"
    LOG="$STATE_DIR/deploy.log"
    FAILED_FILE="$STATE_DIR/failed-commit"
    DRY_RUN="${DRY_RUN:-0}"

    mkdir -p "$STATE_DIR"

    log() { printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "$LOG"; }

    # Cron não carrega o ambiente do login: refaz o que o servidor precisa
    # (git extraído de .deb e pm2 em ~/local, e o Node via nvm, se houver).
    export PATH="$HOME/local/usr/bin:$HOME/local/bin:$PATH"
    export GIT_EXEC_PATH="$HOME/local/usr/lib/git-core"
    export GIT_TEMPLATE_DIR="$HOME/local/usr/share/git-core/templates"
    export GIT_SSH_COMMAND="ssh -i $HOME/.ssh/prestek_deploy2 -o IdentitiesOnly=yes -o BatchMode=yes"
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        # shellcheck disable=SC1091
        . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
    fi

    # Uma execução por vez (build + restart levam minutos).
    exec 9>"$STATE_DIR/lock"
    if ! flock -n 9; then
        echo "Outro deploy está rodando; saindo."
        return 0
    fi

    cd "$APP_DIR" || { log "ERRO: pasta $APP_DIR não existe."; return 1; }

    # Alteração local no servidor: não sobrescrever, avisar e parar.
    if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
        log "PARADO: há alteração local em arquivo rastreado; nada foi feito."
        return 1
    fi

    if ! git fetch --quiet origin main; then
        log "ERRO: git fetch falhou (rede ou chave de deploy); nada foi feito."
        return 1
    fi

    OLD="$(git rev-parse HEAD)"
    NEW="$(git rev-parse origin/main)"
    [ "$OLD" = "$NEW" ] && return 0     # nada novo: silêncio, para não encher o log

    if [ -f "$FAILED_FILE" ] && [ "$(cat "$FAILED_FILE")" = "$NEW" ]; then
        return 0                        # este commit já falhou; espera um commit novo
    fi

    # Só avança em linha reta. Se o histórico divergiu, parar e olhar.
    if ! git merge-base --is-ancestor "$OLD" "$NEW"; then
        log "PARADO: origin/main não descende do commit do servidor ($OLD); decidir à mão."
        return 1
    fi

    CHANGED="$(git diff --name-only "$OLD" "$NEW")"
    precisa_deps_raiz=0;    echo "$CHANGED" | grep -qx 'package-lock.json'         && precisa_deps_raiz=1
    precisa_deps_backend=0; echo "$CHANGED" | grep -qx 'backend/package-lock.json' && precisa_deps_backend=1
    precisa_front=0
    echo "$CHANGED" | grep -qE '^(src/|public/|index\.html$|package(-lock)?\.json$|vite\.config\.js$|tailwind\.config\.js$|postcss\.config\.js$)' && precisa_front=1
    precisa_backend=0
    echo "$CHANGED" | grep -qE '^backend/' && precisa_backend=1
    migrations="$(echo "$CHANGED" | grep -E '^backend/migrations/.*\.sql$' || true)"

    log "Novo commit: $(git rev-parse --short "$OLD") -> $(git rev-parse --short "$NEW") ($(echo "$CHANGED" | grep -c .) arquivos)"
    log "Plano: deps raiz=$precisa_deps_raiz deps backend=$precisa_deps_backend build front=$precisa_front reiniciar backend=$precisa_backend"

    # Migration NUNCA é automática (o migrations/run.js reexecuta tudo e engole erro).
    # O código sobe, mas o aviso fica no log para o Felix aplicar só o arquivo novo.
    if [ -n "$migrations" ]; then
        log "ATENÇÃO: este deploy traz migration(s) que NÃO foram aplicadas e exigem ação manual:"
        echo "$migrations" | while read -r f; do log "  - $f"; done
    fi

    if [ "$DRY_RUN" = "1" ]; then
        log "DRY_RUN: nada foi alterado."
        return 0
    fi

    git merge --ff-only --quiet "$NEW" || { log "ERRO: git merge --ff-only falhou."; return 1; }

    voltar() {   # desfaz o código e registra o commit que falhou
        log "REVERTENDO para $(git rev-parse --short "$OLD"): $1"
        echo "$NEW" > "$FAILED_FILE"
        git reset --hard --quiet "$OLD"
        if [ -d dist.prev ]; then rm -rf dist; mv dist.prev dist; fi
        if [ "$precisa_backend" = "1" ]; then pm2 restart "$PM2_APP" >/dev/null 2>&1; fi
        return 1
    }

    if [ "$precisa_deps_raiz" = "1" ]; then
        log "npm ci (raiz)"
        npm ci --no-audit --no-fund >>"$LOG" 2>&1 || { voltar "npm ci da raiz falhou"; return 1; }
    fi
    if [ "$precisa_deps_backend" = "1" ]; then
        log "npm ci (backend)"
        (cd backend && npm ci --no-audit --no-fund) >>"$LOG" 2>&1 || { voltar "npm ci do backend falhou"; return 1; }
    fi

    if [ "$precisa_front" = "1" ]; then
        log "Build do front (VITE_API_URL=$VITE_API_URL)"
        rm -rf dist.new dist.prev
        # Gera ao lado e só troca se der certo: o site nunca fica sem dist/.
        if ! VITE_API_URL="$VITE_API_URL" npx vite build --outDir dist.new --emptyOutDir >>"$LOG" 2>&1; then
            rm -rf dist.new
            voltar "build do front falhou"; return 1
        fi
        [ -d dist ] && mv dist dist.prev
        mv dist.new dist
    fi

    if [ "$precisa_backend" = "1" ]; then
        log "Reiniciando $PM2_APP"
        pm2 restart "$PM2_APP" >>"$LOG" 2>&1 || { voltar "pm2 restart falhou"; return 1; }
        ok=0
        for _ in 1 2 3 4 5 6 7 8 9 10; do
            sleep 2
            # Qualquer resposta HTTP conta (503 = banco fora, problema que não é do deploy).
            code="$(curl -s -o /dev/null -m 5 -w '%{http_code}' "$HEALTH_URL" || true)"
            if [ -n "$code" ] && [ "$code" != "000" ]; then ok=1; break; fi
        done
        [ "$ok" = "1" ] || { voltar "backend não respondeu em $HEALTH_URL depois do restart"; return 1; }
    fi

    rm -rf dist.prev
    rm -f "$FAILED_FILE"
    log "OK: servidor em $(git rev-parse --short HEAD)"
    return 0
}

main "$@"
exit $?
