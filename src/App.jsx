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

    // Simulador de is admin status, permitindo apenas mostrar interface de admin se selecionado
    // Tela de login — renderizada isoladamente sem Header/Sidebar
    if (currentView === 'login') {
        return <Login onLogin={(resultado) => {
            const userData = {
                ...resultado.usuario,
                funcionario: resultado.funcionario
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
        return <AdminDashboard setCurrentView={setCurrentView} />
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#1d150c] dark:text-[#f8f7f5] font-display min-h-screen flex flex-col overflow-hidden transition-colors duration-200">
            <Header currentView={currentView} setCurrentView={setCurrentView} user={user} />
            <div className="flex flex-1 overflow-hidden">
                {currentView === 'dashboard' && (
                    <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
                )}
                {/* Renderização baseada em currentView */}
                {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} user={user} />}
                {currentView === 'services' && <ServicesDirectory />}
                {currentView === 'coverage' && <Coverage />}
                {currentView === 'directory' && <Directory user={user} />}
                {currentView === 'sectors' && <Sectors />}
                {currentView === 'schedule' && <Schedule />}
                {currentView === 'processes' && <Processos />}
                {currentView === 'announcements' && <Comunicados user={user} />}
                {currentView === 'settings' && <Configuracoes user={user} />}
                {currentView === 'tickets' && <TicketsList user={user} />}
                {/* Fallback para outros menus n implementados ou páginas inexistentes */}
                {!['dashboard', 'services', 'coverage', 'directory', 'sectors', 'schedule', 'processes', 'announcements', 'settings', 'tickets'].includes(currentView) && (
                    <NotFound setCurrentView={setCurrentView} />
                )}
            </div>
        </div>
    )
}



