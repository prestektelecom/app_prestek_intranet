import StatCard from './StatCard'
import AnnouncementsList from './AnnouncementsList'
import QuickShortcuts from './QuickShortcuts'
import TeamAvailability from './TeamAvailability'
import { useState, useEffect } from 'react'
import { resolveNomeSetor } from '../utils/resolveSetor'

// Página principal do Dashboard
export default function Dashboard({ setCurrentView, user }) {
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [cargoName, setCargoName] = useState('');
    const [osCount, setOsCount] = useState(0);
    const [osStatusCount, setOsStatusCount] = useState(null);
    const [osLoading, setOsLoading] = useState(true);
    const [proximoPlantao, setProximoPlantao] = useState(null);
    const [plantaoLoading, setPlantaoLoading] = useState(true);
    const [eficiencia, setEficiencia] = useState(null);
    const [eficienciaLoading, setEficienciaLoading] = useState(true);

    const func = user?.funcionario ?? {};
    const safeRole = func.id_funcao || 'Colaborador';
    const safeDepto = func.id_departamento || '';
    const funcId = func.id || user?.id; // Fallback para user.id se func.id estiver vazio

    useEffect(() => {
        resolveNomeSetor(safeDepto, safeRole, user?.nome_grupo)
            .then(setCargoName)
            .catch(err => console.error("Erro ao resolver setor no dashboard", err));
    }, [safeDepto, safeRole, user?.nome_grupo]);

    useEffect(() => {
        const fetchOsCount = async () => {
            setOsLoading(true);
            if (!funcId) {
                setOsLoading(false);
                return;
            }
            try {
                const res = await fetch(`/api/os-chamados/${funcId}`);
                const data = await res.json();
                if (data.sucesso) {
                    setOsCount(data.quantidade);
                    setOsStatusCount(data.statusCount);
                }
            } catch (err) {
                console.error("Erro ao buscar quantidade de OS:", err);
            } finally {
                setOsLoading(false);
            }
        };

        fetchOsCount();
    }, [funcId]);

    useEffect(() => {
        const fetchProximoPlantao = async () => {
            if (!user?.id) return;
            setPlantaoLoading(true);
            try {
                const res = await fetch(`/api/plantoes/meu-proximo/${user.id}`);
                const data = await res.json();
                if (data.sucesso && data.proximo) {
                    setProximoPlantao(data.proximo);
                }
            } catch (err) {
                console.error("Erro ao buscar próximo plantão:", err);
            } finally {
                setPlantaoLoading(false);
            }
        };

        fetchProximoPlantao();
    }, [user?.id]);

    useEffect(() => {
        const fetchEficiencia = async () => {
            if (!funcId) { setEficienciaLoading(false); return; }
            setEficienciaLoading(true);
            try {
                const res = await fetch(`/api/eficiencia/${funcId}`);
                const data = await res.json();
                if (data.sucesso) setEficiencia(data);
            } catch (err) {
                console.error('Erro ao buscar eficiência:', err);
            } finally {
                setEficienciaLoading(false);
            }
        };
        fetchEficiencia();
    }, [funcId]);

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
    // Monta badge de eficiência dinamicamente
    const eficienciaBadge = (() => {
        if (eficienciaLoading) return { texto: 'Calculando...', icon: 'autorenew', classe: 'text-[#635c55] dark:text-gray-400' };
        if (!eficiencia || eficiencia.sem_dados) return { texto: 'Sem OS este mês', icon: 'info', classe: 'text-[#635c55] dark:text-gray-400' };
        if (eficiencia.variacao !== null) {
            const sinal = eficiencia.variacao >= 0 ? '+' : '';
            const icone = eficiencia.variacao > 0 ? 'trending_up' : eficiencia.variacao < 0 ? 'trending_down' : 'trending_flat';
            const cor = eficiencia.variacao > 0 ? 'text-green-600 dark:text-green-400' : eficiencia.variacao < 0 ? 'text-red-500 dark:text-red-400' : 'text-[#635c55] dark:text-gray-400';
            return { texto: `${sinal}${eficiencia.variacao}% vs mês anterior`, icon: icone, classe: cor };
        }
        // Sem mês anterior para comparar — exibe eficiência absoluta
        return { texto: `${eficiencia.eficiencia_atual}% Eficiência`, icon: 'pie_chart', classe: 'text-green-600 dark:text-green-400' };
    })();

    const stats = [
        {
            icon: 'pie_chart',
            label: 'Meu Setor',
            value: cargoName,
            tooltip: eficiencia ? (
                <div className="flex flex-col gap-1.5 text-[0.8rem] min-w-[170px]">
                    <p className="font-bold border-b border-gray-700 pb-1.5 mb-1 text-gray-200">Eficiência — {eficiencia.periodo}</p>
                    {eficiencia.sem_dados ? (
                        <p className="text-gray-400 italic">Sem OS fechadas este mês</p>
                    ) : (<>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">OS avaliadas:</span>
                            <span className="font-semibold">{eficiencia.total_os_mes}{eficiencia.os_sem_prazo > 0 ? ` de ${eficiencia.total_os_mes + eficiencia.os_sem_prazo}` : ''}</span>
                        </div>
                        {eficiencia.os_sem_prazo > 0 && (
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-gray-400">Sem SLA definido:</span>
                                <span className="font-semibold text-yellow-400">{eficiencia.os_sem_prazo}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">No prazo:</span>
                            <span className="font-semibold text-green-400">{eficiencia.no_prazo_mes} OS</span>
                        </div>
                        <div className="flex justify-between items-center gap-4 border-t border-gray-700 pt-1.5 mt-0.5">
                            <span className="text-gray-400">Eficiência atual:</span>
                            <span className={`font-bold ${eficiencia.eficiencia_atual >= 80 ? 'text-green-400' : eficiencia.eficiencia_atual >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{eficiencia.eficiencia_atual}%</span>
                        </div>
                        {eficiencia.eficiencia_anterior !== null && (
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-gray-400">Mês anterior:</span>
                                <span className="font-semibold">{eficiencia.eficiencia_anterior}%</span>
                            </div>
                        )}
                        <p className="text-[0.7rem] text-gray-500 mt-1 border-t border-gray-700 pt-1.5">SLA calculado por horas úteis (seg–sex)</p>
                    </>)}
                </div>
            ) : null,
            badge: (
                <>
                    <span className="material-symbols-outlined text-sm mr-1">{eficienciaBadge.icon}</span>
                    {eficienciaBadge.texto}
                </>
            ),
            badgeClassName: eficienciaBadge.classe,
        },
        {
            icon: 'event_available',
            label: 'Próximo Plantão',
            value: plantaoLoading ? '...' : (proximoPlantao ? new Date(proximoPlantao.data).toLocaleDateString('pt-BR') : 'Nenhum Agendado'),
            badge: proximoPlantao ? `${(proximoPlantao.horario_inicio || '09:00').slice(0, 5)} - ${(proximoPlantao.horario_fim || '17:00').slice(0, 5)}` : (plantaoLoading ? '' : 'Sem cobertura'),
            badgeClassName: 'text-[#635c55] dark:text-gray-300',
        },
        {
            icon: 'construction',
            label: 'OS no meu nome',
            value: osLoading ? '...' : osCount,
            tooltip: osStatusCount && (
                <div className="flex flex-col gap-1.5 text-[0.8rem] min-w-[140px]">
                    <p className="font-bold border-b border-gray-700 pb-1.5 mb-1 text-gray-200">Status das OS</p>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Aberto:</span> <span className="font-semibold">{osStatusCount.A || 0}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Agendado:</span> <span className="font-semibold">{osStatusCount.AG || 0}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Assumido:</span> <span className="font-semibold">{osStatusCount.AS || 0}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Encaminhada:</span> <span className="font-semibold">{osStatusCount.EN || 0}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Análise:</span> <span className="font-semibold">{osStatusCount.AN || 0}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Execução:</span> <span className="font-semibold">{(osStatusCount.EX || 0) + (osStatusCount.OUTROS || 0)}</span></div>
                </div>
            ),
            badge: (
                <>
                    {osCount > 0 ? (
                        <>
                            <span className="material-symbols-outlined text-sm mr-1">priority_high</span>
                            Você tem OS pendentes
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                            Tudo em dia
                        </>
                    )}
                </>
            ),
            badgeClassName: osCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400',
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
                    <AnnouncementsList setCurrentView={setCurrentView} />


                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-[#1d150c] dark:text-[#f8f7f5] transition-colors">Atalhos Rápidos</h2>
                        <QuickShortcuts setCurrentView={setCurrentView} user={user} />
                        <TeamAvailability user={user} />
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
