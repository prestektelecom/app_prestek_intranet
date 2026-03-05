import { useState } from 'react'
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
import AdminDashboard from './components/AdminDashboard'

// Componente raiz que monta a estrutura principal da aplicação
export default function App() {
    const [currentView, setCurrentView] = useState('dashboard')

    // Simulador de is admin status, permitindo apenas mostrar interface de admin se selecionado
    if (currentView === 'admin') {
        return <AdminDashboard setCurrentView={setCurrentView} />
    }

    return (
        <div className="bg-background-light text-[#1d150c] font-display min-h-screen flex flex-col overflow-hidden">
            <Header currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex flex-1 overflow-hidden">
                {currentView === 'dashboard' && (
                    <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
                )}
                {/* Renderização baseada em currentView */}
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'services' && <ServicesDirectory />}
                {currentView === 'coverage' && <Coverage />}
                {currentView === 'directory' && <Directory />}
                {currentView === 'sectors' && <Sectors />}
                {currentView === 'schedule' && <Schedule />}
                {currentView === 'processes' && <Processos />}
                {currentView === 'announcements' && <Comunicados />}
                {currentView === 'settings' && <Configuracoes />}
                {/* Fallback para outros menus n implementados, exibe ServicesDirectory apenas como placeholder se nao for nenhuma das acimas */}
                {!['dashboard', 'services', 'coverage', 'directory', 'sectors', 'schedule', 'processes', 'announcements', 'settings'].includes(currentView) && <ServicesDirectory />}
            </div>
        </div>
    )
}



