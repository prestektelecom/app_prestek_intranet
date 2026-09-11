import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Fontes auto-hospedadas via @fontsource (sem dependência externa do Google Fonts)
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import '@fontsource/plus-jakarta-sans/800.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import '@fontsource/jetbrains-mono/700.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/700.css'
import '@fontsource/manrope/800.css'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'

// Injeta o token de sessão (JWT) em toda chamada a /api — atalho para não
// reescrever ~22 pontos de `fetch('/api/...')' espalhados pelo app. O backend
// exige `Authorization: Bearer <token>` em tudo sob /api, exceto login/health.
const fetchOriginal = window.fetch.bind(window)

// Sessões salvas antes desta mudança (sem token) ou um token expirado voltam
// 401 em toda rota. Sem isto o usuário via a tela travada com widgets vazios,
// sem nenhum caminho de volta ao login — /api/login fica de fora porque um
// 401 ali é "senha incorreta", tratado pela própria tela de login.
function encerrarSessaoExpirada() {
    for (const storage of [localStorage, sessionStorage]) {
        storage.removeItem('@Stitch:user')
        storage.removeItem('@Stitch:currentView')
        storage.removeItem('@Stitch:token')
    }
    window.location.reload()
}

window.fetch = async (entrada, init = {}) => {
    const urlBruta = typeof entrada === 'string' ? entrada : entrada?.url || ''
    // Alguns componentes montam a URL com um host absoluto (`VITE_API_URL` ou
    // o fallback `http://localhost:3001`) em vez do caminho relativo `/api/...`
    // que passa pelo proxy do Vite — comparar pelo pathname cobre os dois casos.
    let caminho
    try {
        caminho = new URL(urlBruta, window.location.origin).pathname
    } catch {
        caminho = urlBruta
    }
    if (!caminho.startsWith('/api')) return fetchOriginal(entrada, init)

    const token = sessionStorage.getItem('@Stitch:token') || localStorage.getItem('@Stitch:token')
    let requisicao = entrada
    let opcoes = init
    if (token) {
        const cabecalhos = new Headers(init.headers || (typeof entrada !== 'string' ? entrada.headers : undefined))
        if (!cabecalhos.has('Authorization')) cabecalhos.set('Authorization', `Bearer ${token}`)
        opcoes = { ...init, headers: cabecalhos }
    }

    const resposta = await fetchOriginal(requisicao, opcoes)
    if (resposta.status === 401 && !caminho.startsWith('/api/login')) {
        encerrarSessaoExpirada()
    }
    return resposta
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </StrictMode>,
)
