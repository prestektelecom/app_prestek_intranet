import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ServicesDirectory from './components/ServicesDirectory'
import Coverage from './components/Coverage'
import Directory from './components/Directory'
import Sectors from './components/Sectors'
import Schedule from './components/Schedule'
import PlantaoHistorico from './components/schedule/PlantaoHistorico'
import Processos from './components/Processos'
import Comunicados from './components/Comunicados'
import Configuracoes from './components/Configuracoes'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import TicketsList from './components/TicketsList'
import Offices from './components/Offices'
import Ti from './components/Ti'
import NotFound from './components/NotFound'

import { usePresence } from './hooks/usePresence'
import { canAccess } from './navigation'
import { HeaderActionsProvider } from './contexts/HeaderActionsContext'
import MobileBottomNav from './components/MobileBottomNav'
import MobileMoreSheet from './components/MobileMoreSheet'

const VIEWS = ['dashboard', 'services', 'coverage', 'directory', 'sectors', 'schedule', 'plantao-historico', 'processes', 'announcements', 'settings', 'tickets', 'offices', 'ti']

export default function App() {
    const [user, setUser] = useState(() => {
        const sessionUser = sessionStorage.getItem('@Stitch:user')
        if (sessionUser) {
            try { return JSON.parse(sessionUser) } catch (e) { return null }
        }

        const savedUserStr = localStorage.getItem('@Stitch:user')
        if (savedUserStr) {
            try {
                const savedUser = JSON.parse(savedUserStr)
                if (savedUser.expiry && Date.now() > savedUser.expiry) {
                    localStorage.removeItem('@Stitch:user')
                    return null
                }
                return savedUser.data || savedUser
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

    useEffect(() => {
        if (currentView !== 'login') {
            if (sessionStorage.getItem('@Stitch:user')) {
                sessionStorage.setItem('@Stitch:currentView', currentView)
            } else {
                localStorage.setItem('@Stitch:currentView', currentView)
            }
        }
    }, [currentView])

    usePresence(user) // Rastreia atividade do usuário logado

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
        return <NotFound setCurrentView={setCurrentView} user={null} />
    }

    if (currentView === 'login') {
        return <Login onLogin={(resultado) => {
            const userData = {
                ...resultado.usuario,
                funcionario: resultado.funcionario,
                nome_grupo: resultado.nome_grupo || null,
                is_admin: resultado.usuario?.is_admin || false
            }
            setUser(userData)

            if (resultado.lembrar) {
                const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 dias
                localStorage.setItem('@Stitch:user', JSON.stringify({ data: userData, expiry: expiryTime }))
                localStorage.setItem('@Stitch:currentView', 'dashboard')
            } else {
                sessionStorage.setItem('@Stitch:user', JSON.stringify(userData))
                sessionStorage.setItem('@Stitch:currentView', 'dashboard')
            }
            setCurrentView('dashboard')
        }} setCurrentView={setCurrentView} />
    }

    // Gate de papel (PRODUCT.md, princípio 4): esconder o item no menu não
    // basta, a view persistida na sessão chega aqui sem passar pelo menu.
    const permitido = canAccess(currentView, user)

    if (currentView === 'admin' && permitido) {
        return <AdminDashboard setCurrentView={setCurrentView} user={user} />
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
                <Sidebar currentView={currentView} setCurrentView={setCurrentView} user={user} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header currentView={currentView} setCurrentView={setCurrentView} user={user} />
                    {/* Abaixo de lg a barra inferior é fixa; o conteúdo reserva a altura dela. */}
                    <div className="flex-1 flex overflow-hidden pb-[var(--bottom-nav-h)] lg:pb-0">
                        {VIEWS.includes(currentView) || !permitido ? renderView() : <NotFound setCurrentView={setCurrentView} user={user} />}
                    </div>
                </div>
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
