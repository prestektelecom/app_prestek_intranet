import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ServicesDirectory from './components/ServicesDirectory'
import Coverage from './components/Coverage'
import Directory from './components/Directory'

// Componente raiz que monta a estrutura principal da aplicação
export default function App() {
    const [currentView, setCurrentView] = useState('dashboard')

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
                {/* Fallback para outros menus n implementados, exibe ServicesDirectory apenas como placeholder se nao for coverage/dashboard/directory */}
                {!['dashboard', 'services', 'coverage', 'directory'].includes(currentView) && <ServicesDirectory />}
            </div>
        </div>
    )
}


