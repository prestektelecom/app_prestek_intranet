import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Login from './components/Login'

import { usePresence } from './hooks/usePresence'
import { canAccess, viewTitleFor } from './navigation'
import { useProfileDisplay } from './hooks/useProfileDisplay'
import { HeaderActionsProvider } from './contexts/HeaderActionsContext'
import MobileBottomNav from './components/MobileBottomNav'
import SugestaoFab from './components/SugestaoFab'
import MobileMoreSheet from './components/MobileMoreSheet'
import { normalizarUsuario } from './constants/permissoes'

// As 13 telas do switch abaixo, mais AdminDashboard e NotFound, só uma por vez
// está de fato na tela — eram 100% do bundle principal (1,6MB) mesmo assim.
// Login fica de fora do code-splitting de propósito: é a PRIMEIRA tela que
// qualquer visitante não autenticado vê, e adiar seu chunk atrás de uma
// requisição extra pioraria o caminho mais comum em vez de melhorá-lo.
const Dashboard = lazy(() => import('./components/Dashboard'))
const ServicesDirectory = lazy(() => import('./components/ServicesDirectory'))
const Coverage = lazy(() => import('./components/Coverage'))
const Directory = lazy(() => import('./components/Directory'))
const Sectors = lazy(() => import('./components/Sectors'))
const Schedule = lazy(() => import('./components/Schedule'))
const PlantaoHistorico = lazy(() => import('./components/schedule/PlantaoHistorico'))
const Processos = lazy(() => import('./components/Processos'))
const Comunicados = lazy(() => import('./components/Comunicados'))
const Configuracoes = lazy(() => import('./components/Configuracoes'))
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const TicketsList = lazy(() => import('./components/TicketsList'))
const Offices = lazy(() => import('./components/Offices'))
const Ti = lazy(() => import('./components/Ti'))
const NotFound = lazy(() => import('./components/NotFound'))

// Mesma linguagem visual do spinner já usado dentro das telas (ex.: Coverage.jsx
// enquanto busca regiões no IXC): ícone girando na cor de marca sobre o fundo
// do tema. Só aparece na troca de aba se o chunk ainda não estiver em cache.
function ViewLoading() {
    return (
        <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-3 bg-background" role="status" aria-live="polite">
            <span className="material-symbols-outlined animate-spin text-3xl text-[var(--accent)]" aria-hidden="true">autorenew</span>
            <p className="text-[13px] font-semibold text-faint">Carregando...</p>
        </div>
    )
}

export default function App() {
    const [user, setUser] = useState(() => {
        const sessionUser = sessionStorage.getItem('@Stitch:user')
        if (sessionUser) {
            try { return normalizarUsuario(JSON.parse(sessionUser)) } catch (e) { return null }
        }

        const savedUserStr = localStorage.getItem('@Stitch:user')
        if (savedUserStr) {
            try {
                const savedUser = JSON.parse(savedUserStr)
                if (savedUser.expiry && Date.now() > savedUser.expiry) {
                    localStorage.removeItem('@Stitch:user')
                    return null
                }
                return normalizarUsuario(savedUser.data || savedUser)
            } catch (e) { return null }
        }
        return null
    })

    const [currentView, setCurrentView] = useState(() => {
        const savedView = sessionStorage.getItem('@Stitch:currentView') || localStorage.getItem('@Stitch:currentView')

        let validUser = false;
        if (sessionStorage.getItem('@Stitch:user')) validUser = true;
        if (!validUser) {
            const savedUserStr = localStorage.getItem('@Stitch:user')
            if (savedUserStr) {
                try {
                    const savedUser = JSON.parse(savedUserStr)
                    if (!savedUser.expiry || Date.now() <= savedUser.expiry) validUser = true;
                } catch (e) { }
            }
        }

        if (validUser && savedView) return savedView
        return 'login'
    })

    const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)

    // "Pular para o conteúdo" (WCAG 2.4.1): a Sidebar tem 16 paradas de Tab
    // antes da página. Ao trocar de view o foco vai para o wrapper do
    // conteúdo, assim o leitor de tela anuncia a página nova e o teclado
    // começa nela, não no topo da Sidebar. Não move no primeiro render.
    const conteudoRef = useRef(null)
    const viewAnterior = useRef(currentView)
    useEffect(() => {
        // Compara com a view anterior (e não com um "primeiro render"): o
        // StrictMode roda o efeito duas vezes no dev e um flag booleano
        // roubava o foco na carga inicial.
        if (viewAnterior.current !== currentView && currentView !== 'login') {
            conteudoRef.current?.focus({ preventScroll: true })
        }
        viewAnterior.current = currentView
    }, [currentView])

    useEffect(() => {
        if (currentView !== 'login') {
            if (sessionStorage.getItem('@Stitch:user')) {
                sessionStorage.setItem('@Stitch:currentView', currentView)
            } else {
                localStorage.setItem('@Stitch:currentView', currentView)
            }
        }
    }, [currentView])

    // Título da aba por view (dez abas abertas eram todas "Prestek Intranet Dashboard").
    useEffect(() => {
        const titulo = currentView === 'login' ? 'Entrar' : viewTitleFor(currentView, user)
        document.title = titulo ? `${titulo} · Prestek Intranet` : 'Prestek Intranet'
    }, [currentView, user])

    usePresence(user) // Rastreia atividade do usuário logado
    const profile = useProfileDisplay(user) // nome curto, cargo e avatar para Sidebar e Header

    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        setSearchQuery('')
    }, [currentView])

    useEffect(() => {
        localStorage.removeItem('stitch_profile_0000');
    }, [])

    // Sincroniza avatar do localStorage para o banco ao iniciar sessão
    useEffect(() => {
        if (!user) return;
        const safeId = user.funcionario?.id ?? user.id;
        const safeEmail = user.funcionario?.email || user.email;
        if (!safeId || !safeEmail) return;

        const localKey = `stitch_profile_${safeId}`;
        try {
            const saved = localStorage.getItem(localKey);
            if (!saved) return;
            const parsed = JSON.parse(saved);
            let avatarVal = parsed.avatarUrl;
            if (!avatarVal) return;

            // Se for objeto Lottie (não compactado), descartar — não enviamos JSON gigante ao banco
            if (typeof avatarVal === 'object') return;
            // Se for string de índice compacto ou base64/url, enviar normalmente
            if (typeof avatarVal !== 'string') return;
            // Descartar paths de build inválidos
            if (avatarVal.startsWith('/src/image/')) return;

            fetch(`/api/configuracoes/${safeId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: safeEmail, chave: 'avatarUrl', valor: avatarVal })
            }).catch(() => {});
        } catch (_) {}
    }, [user?.id, user?.funcionario?.id])

    // Tela de login — renderizada isoladamente sem Header/Sidebar
    if (!user && currentView !== 'login') {
        return <Suspense fallback={<ViewLoading />}><NotFound setCurrentView={setCurrentView} user={null} /></Suspense>
    }

    if (currentView === 'login') {
        return <Login onLogin={(resultado) => {
            const userData = normalizarUsuario({
                ...resultado.usuario,
                funcionario: resultado.funcionario,
                nome_grupo: resultado.nome_grupo || null,
                is_admin: resultado.usuario?.is_admin || false
            })
            setUser(userData)

            if (resultado.lembrar) {
                const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 dias
                localStorage.setItem('@Stitch:user', JSON.stringify({ data: userData, expiry: expiryTime }))
                localStorage.setItem('@Stitch:currentView', 'dashboard')
                if (resultado.token_sessao) localStorage.setItem('@Stitch:token', resultado.token_sessao)
            } else {
                sessionStorage.setItem('@Stitch:user', JSON.stringify(userData))
                sessionStorage.setItem('@Stitch:currentView', 'dashboard')
                if (resultado.token_sessao) sessionStorage.setItem('@Stitch:token', resultado.token_sessao)
            }
            setCurrentView('dashboard')
        }} />
    }

    // Gate de papel (PRODUCT.md, princípio 4): esconder o item no menu não
    // basta, a view persistida na sessão chega aqui sem passar pelo menu.
    const permitido = canAccess(currentView, user)

    if (currentView === 'admin' && permitido) {
        return <Suspense fallback={<ViewLoading />}><AdminDashboard setCurrentView={setCurrentView} user={user} /></Suspense>
    }

    const renderView = () => {
        if (!permitido) return <NotFound setCurrentView={setCurrentView} user={user} variant="sem-permissao" />
        switch (currentView) {
            case 'dashboard': return <Dashboard setCurrentView={setCurrentView} user={user} />
            case 'services': return <ServicesDirectory setCurrentView={setCurrentView} user={user} searchQuery={searchQuery} />
            case 'coverage': return <Coverage user={user} setCurrentView={setCurrentView} />
            case 'directory': return <Directory user={user} setCurrentView={setCurrentView} />
            case 'sectors': return <Sectors user={user} setCurrentView={setCurrentView} />
            case 'schedule': return <Schedule user={user} setCurrentView={setCurrentView} />
            case 'plantao-historico': return <PlantaoHistorico user={user} setCurrentView={setCurrentView} />
            case 'processes': return <Processos user={user} setCurrentView={setCurrentView} />
            case 'announcements': return <Comunicados user={user} setCurrentView={setCurrentView} />
            case 'settings': return <Configuracoes user={user} setCurrentView={setCurrentView} />
            case 'tickets': return <TicketsList user={user} setCurrentView={setCurrentView} />
            case 'offices': return <Offices user={user} setCurrentView={setCurrentView} />
            case 'ti': return <Ti user={user} setCurrentView={setCurrentView} />
            default: return <NotFound setCurrentView={setCurrentView} user={user} />
        }
    }

    return (
        <HeaderActionsProvider>
            <div className="bg-background text-foreground font-jakarta h-screen h-dvh flex transition-colors duration-200">
                <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
                <Sidebar currentView={currentView} setCurrentView={setCurrentView} user={user} profile={profile} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header currentView={currentView} setCurrentView={setCurrentView} user={user} profile={profile} />
                    {/* Abaixo de lg a barra inferior é fixa; o conteúdo reserva a altura dela. */}
                    <div
                        id="conteudo"
                        ref={conteudoRef}
                        tabIndex={-1}
                        className="flex-1 flex overflow-hidden pb-[var(--bottom-nav-h)] lg:pb-0 outline-none"
                    >
                        <Suspense fallback={<ViewLoading />}>{renderView()}</Suspense>
                    </div>
                </div>
                <SugestaoFab />
                <MobileBottomNav
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    isMoreSheetOpen={isMoreSheetOpen}
                    setIsMoreSheetOpen={setIsMoreSheetOpen}
                    user={user}
                />
                <MobileMoreSheet
                    isOpen={isMoreSheetOpen}
                    onClose={() => setIsMoreSheetOpen(false)}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    user={user}
                />
            </div>
        </HeaderActionsProvider>
    )
}
