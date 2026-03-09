import StatCard from './StatCard'
import AnnouncementsList from './AnnouncementsList'
import QuickShortcuts from './QuickShortcuts'
import TeamAvailability from './TeamAvailability'
import { useState, useEffect } from 'react'

// Página principal do Dashboard
export default function Dashboard({ setCurrentView, user }) {
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [cargoName, setCargoName] = useState('Comercial');

    const func = user?.funcionario ?? {};
    const safeRole = func.id_funcao || 'Colaborador';
    const safeDepto = func.id_departamento || '';

    useEffect(() => {
        const fetchCargoESetor = async () => {
            let nomeFinal = safeRole;
            try {
                // Busca tanto departamentos quanto cargos para encontrar o nome do setor
                const [resDept, resCargo] = await Promise.all([
                    fetch('http://localhost:3001/api/departamentos').catch(() => null),
                    fetch('http://localhost:3001/api/cargos').catch(() => null)
                ]);

                let departamentos = [];
                let cargos = [];

                if (resDept?.ok) {
                    const data = await resDept.json();
                    if (data.sucesso) departamentos = data.departamentos || [];
                }
                if (resCargo?.ok) {
                    const data = await resCargo.json();
                    if (data.sucesso) cargos = data.cargos || [];
                }

                // Tenta achar pelo departamento primeiro (igual ao Configuracoes.jsx)
                let deptoName = 'N/D';
                if (safeDepto) {
                    const foundDept = departamentos.find(d => String(d.id).trim() === String(safeDepto).trim());
                    const foundCargo = cargos.find(c => String(c.id).trim() === String(safeDepto).trim());
                    deptoName = foundDept?.setor || foundCargo?.setor || safeDepto;
                }

                // Se encontrou o departamento, usa ele; senão, cai para id_funcao
                if (deptoName !== 'N/D' && deptoName !== '') {
                    nomeFinal = deptoName;
                } else if (safeRole && safeRole !== 'Colaborador') {
                    const foundRole = cargos.find(c => String(c.id).trim() === String(safeRole).trim());
                    if (foundRole?.setor) nomeFinal = foundRole.setor;
                }

                setCargoName(nomeFinal);
            } catch (err) {
                console.error("Erro ao buscar cargos/departamentos no dashboard", err);
            }
        };

        fetchCargoESetor();
    }, [safeDepto, safeRole]);

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();

            let diaSemana = new Intl.DateTimeFormat('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                weekday: 'long'
            }).format(now);
            diaSemana = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

            let data = new Intl.DateTimeFormat('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).format(now);
            data = data.replace(/ de /g, ' ').replace(/\./g, '');
            const partesData = data.split(' ');
            if (partesData.length >= 2) {
                partesData[1] = partesData[1].charAt(0).toUpperCase() + partesData[1].slice(1);
            }
            data = partesData.join(' ');

            const hora = new Intl.DateTimeFormat('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                hour: '2-digit',
                minute: '2-digit'
            }).format(now);

            setCurrentDateTime(`Hoje é ${diaSemana}, ${data} às ${hora}`);
        };

        updateDateTime();
        const intervalId = setInterval(updateDateTime, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const safeName = func.funcionario || user?.nome || 'Usuário';
    const firstName = safeName.split(' ')[0] || 'Usuário';

    // Dados dos cards de estatísticas do topo reativos
    const stats = [
        {
            icon: 'pie_chart',
            label: 'Meu Setor',
            value: cargoName,
            badge: (
                <>
                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                    +12% Eficiência
                </>
            ),
            badgeClassName: 'text-green-600',
        },
        {
            icon: 'event_available',
            label: 'Próximo Plantão',
            value: '01/03/2025',
            badge: '09:00 - 17:00',
            badgeClassName: 'text-[#635c55] dark:text-gray-300',
        },
        {
            icon: 'folder_open',
            label: 'Contratos Ativos',
            value: '45',
            badge: (
                <>
                    <span className="material-symbols-outlined text-sm mr-1">priority_high</span>
                    3 Necessitam de Revisão
                </>
            ),
            badgeClassName: 'text-orange-600',
        },
    ];

    return (
        <main className="flex-1 overflow-y-auto w-full bg-background-light dark:bg-background-dark p-6 md:p-10 transition-colors duration-200">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Saudação + Data */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-[#1d150c] dark:text-[#f8f7f5] mb-2 transition-colors">
                            Bem-vindo de volta, {firstName}!
                        </h1>
                        <p className="text-[#635c55] dark:text-gray-400 transition-colors">
                            Aqui está o que está acontecendo no seu setor hoje.
                        </p>
                    </div>
                    <div className="text-sm text-[#635c55] dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-[#eaddcd] dark:border-gray-700 shadow-sm flex items-center gap-2 transition-colors">
                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                        <span>{currentDateTime || "Carregando..."}</span>
                    </div>
                </div>

                {/* Cards de estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </div>

                {/* Comunicados + Atalhos */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <AnnouncementsList />

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-[#1d150c] dark:text-[#f8f7f5] transition-colors">Atalhos Rápidos</h2>
                        <QuickShortcuts setCurrentView={setCurrentView} />
                        <TeamAvailability />
                    </div>
                </div>

                {/* Rodapé */}
                <div className="border-t border-[#eaddcd] dark:border-gray-800 pt-6 flex justify-between items-center text-xs text-[#635c55] dark:text-gray-400 transition-colors">
                    <p>© 2026 Prestek Inc. Portal Interno. Confidencial.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-primary">Política de Privacidade</a>
                        <a href="#" className="hover:text-primary">Diretrizes Internas</a>
                    </div>
                </div>

            </div>
        </main>
    )
}
