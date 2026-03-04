import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ServicesDirectory from './components/ServicesDirectory'

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
                {currentView === 'dashboard' ? <Dashboard /> : <ServicesDirectory />}
            </div>
        </div>
    )
}
