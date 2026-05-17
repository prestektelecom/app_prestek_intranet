import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ServicesDirectory from './components/ServicesDirectory'
import Coverage from './components/Coverage'
import Directory from './components/Directory'
import Sectors from './components/Sectors'
import Schedule from './components/Schedule'
import Processos from './components/Processos'
import Comunicados from './components/Comunicados'
import Configuracoes from './components/Configuracoes'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import TicketsList from './components/TicketsList'
import Offices from './components/Offices'
import NotFound from './components/NotFound'
import { useTheme } from './hooks/useTheme'
import { usePresence } from './hooks/usePresence'

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

    useEffect(() => {
        if (currentView !== 'login') {
            if (sessionStorage.getItem('@Stitch:user')) {
                sessionStorage.setItem('@Stitch:currentView', currentView)
            } else {
                localStorage.setItem('@Stitch:currentView', currentView)
            }
        }
    }, [currentView])

    useTheme() // Initialize theme globally
    usePresence(user) // Rastreia atividade do usuário logado

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

    // Simulador de is admin status, permitindo apenas mostrar interface de admin se selecionado
    // Tela de login — renderizada isoladamente sem Header/Sidebar
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
        }} />
    }

    if (currentView === 'admin') {
        return <AdminDashboard setCurrentView={setCurrentView} user={user} />
    }

    return (
        <div className="bg-background text-foreground font-display h-screen flex flex-col transition-colors duration-200">
            <Header currentView={currentView} setCurrentView={setCurrentView} user={user} />
            <div className="flex flex-1 overflow-hidden">
                {currentView === 'dashboard' && (
                    <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
                )}
                {/* Renderização baseada em currentView */}
                {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} user={user} />}
                {currentView === 'services' && <ServicesDirectory setCurrentView={setCurrentView} user={user} />}
                {currentView === 'coverage' && <Coverage user={user} setCurrentView={setCurrentView} />}
                {currentView === 'directory' && <Directory user={user} setCurrentView={setCurrentView} />}
                {currentView === 'sectors' && <Sectors user={user} setCurrentView={setCurrentView} />}
                {currentView === 'schedule' && <Schedule user={user} setCurrentView={setCurrentView} />}
                {currentView === 'processes' && <Processos setCurrentView={setCurrentView} />}
                {currentView === 'announcements' && <Comunicados user={user} setCurrentView={setCurrentView} />}
                {currentView === 'settings' && <Configuracoes user={user} setCurrentView={setCurrentView} />}
                {currentView === 'tickets' && <TicketsList user={user} setCurrentView={setCurrentView} />}
                {currentView === 'offices' && <Offices user={user} setCurrentView={setCurrentView} />}
                {/* Fallback para outros menus n implementados ou páginas inexistentes */}
                {!['dashboard', 'services', 'coverage', 'directory', 'sectors', 'schedule', 'processes', 'announcements', 'settings', 'tickets', 'offices'].includes(currentView) && (
                    <NotFound setCurrentView={setCurrentView} />
                )}
            </div>
        </div>
    )
}



