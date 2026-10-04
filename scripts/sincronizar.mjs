// Sincroniza esta máquina com o GitHub: baixa a main, instala dependências se
// mudaram e confere o backend/.env. Só avança (fast-forward) e nunca descarta
// trabalho local: com alterações não commitadas ou fora da main, só avisa.
//
// Uso: npm run sincronizar     (não serve para o servidor de produção)

import { execFileSync } from 'child_process'
import { existsSync } from 'fs'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const npm = (cwd, ...args) =>
    execFileSync('npm', [...args, '--no-audit', '--no-fund'], { cwd, stdio: 'inherit', shell: true })

function instalar(pasta, rotulo, mudou) {
    if (!existsSync(`${pasta}/package.json`)) return
    if (!existsSync(`${pasta}/node_modules`)) {
        console.log(`→ ${rotulo}: node_modules não existe, instalando (npm ci)`)
        npm(pasta, 'ci')
    } else if (mudou) {
        console.log(`→ ${rotulo}: dependências mudaram, atualizando (npm install)`)
        npm(pasta, 'install')
    } else {
        console.log(`✓ ${rotulo}: dependências em dia`)
    }
}

console.log('→ git fetch')
git('fetch', '--prune', '--tags')

const ramo = git('branch', '--show-current')
const sujo = git('status', '--porcelain') !== ''
const antes = git('rev-parse', 'HEAD')

if (sujo) {
    console.log(`! Há alterações não commitadas em "${ramo}": não vou mexer na branch. Commite ou guarde (git stash) e rode de novo.`)
} else if (ramo === 'main') {
    console.log('→ git pull --ff-only origin main')
    git('pull', '--ff-only', 'origin', 'main')
} else {
    const atras = git('rev-list', '--count', `${ramo}..origin/main`)
    console.log(`✓ Você está em "${ramo}", a main não foi alterada (a branch está ${atras} commit(s) atrás da origin/main).`)
    console.log('  Para voltar à main: git switch main && npm run sincronizar')
}

const depois = git('rev-parse', 'HEAD')
const mudou = (arquivo) =>
    antes !== depois && git('diff', '--name-only', antes, depois, '--', arquivo) !== ''

instalar('.', 'raiz', mudou('package-lock.json'))
instalar('backend', 'backend', mudou('backend/package-lock.json'))

if (!existsSync('backend/.env')) {
    console.log('! backend/.env não existe. Ele nunca vai para o Git: veja docs/SETUP_NOVA_MAQUINA.md (seção "O arquivo .env").')
} else {
    console.log('✓ backend/.env presente (atenção: aponta para o banco e o IXC de PRODUÇÃO)')
}

const migrations = antes !== depois && git('diff', '--name-only', antes, depois, '--', 'migrations') !== ''
if (migrations) {
    console.log('! Entraram migrations novas. Elas NÃO são aplicadas sozinhas: aplique só o arquivo novo, nunca migrations/run.js inteiro.')
}

console.log(`\nPronto. Commit atual: ${git('rev-parse', '--short', 'HEAD')} (${ramo})`)
