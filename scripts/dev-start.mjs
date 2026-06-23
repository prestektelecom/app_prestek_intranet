// Script de desenvolvimento: inicia o backend, aguarda /api/health
// e só então inicia o frontend. Evita o erro 500 no primeiro login
// causado pelo frontend ficar pronto antes do backend.

import { spawn } from 'child_process'

const BACKEND_PORT = process.env.BACKEND_PORT || 3001
const HEALTH_URL = `http://localhost:${BACKEND_PORT}/api/health`
const MAX_WAIT_MS = 60000
const POLL_INTERVAL_MS = 500

function startBackend() {
    return spawn('npm', ['run', 'dev:backend'], {
        stdio: 'inherit',
        shell: true,
    })
}

function startFrontend() {
    return spawn('npm', ['run', 'dev:frontend'], {
        stdio: 'inherit',
        shell: true,
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForBackend() {
    const start = Date.now()
    while (Date.now() - start < MAX_WAIT_MS) {
        try {
            const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(1000) })
            if (res.ok) {
                const body = await res.json().catch(() => ({}))
                if (body.status === 'ok') {
                    console.log('✅ Backend pronto. Iniciando frontend...')
                    return
                }
            }
        } catch {
            // backend ainda não está ouvindo
        }
        await sleep(POLL_INTERVAL_MS)
    }
    throw new Error(`Backend não ficou pronto em ${MAX_WAIT_MS}ms`)
}

function shutdown(backends, frontends) {
    backends.forEach(p => p.kill())
    frontends.forEach(p => p.kill())
}

async function main() {
    const backends = []
    const frontends = []

    const onSignal = () => {
        shutdown(backends, frontends)
        process.exit(0)
    }

    process.on('SIGINT', onSignal)
    process.on('SIGTERM', onSignal)

    try {
        // Se já houver um backend rodando, reaproveita e só sobe o frontend.
        try {
            const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(1000) })
            if (res.ok) {
                console.log('✅ Backend já está rodando. Iniciando frontend...')
                frontends.push(startFrontend())
                return
            }
        } catch {
            // nenhum backend respondendo, segue para iniciar um novo
        }

        console.log('🚀 Iniciando backend...')
        backends.push(startBackend())

        await waitForBackend()

        console.log('🚀 Iniciando frontend...')
        frontends.push(startFrontend())
    } catch (err) {
        console.error('❌', err.message)
        shutdown(backends, frontends)
        process.exit(1)
    }
}

main()
