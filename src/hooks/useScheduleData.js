import { useState, useEffect } from 'react';

const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
        const text = await res.text().catch(() => '');
        throw new Error(`Resposta não-JSON (${res.status}): ${text.slice(0, 120)}`);
    }
    return res.json();
};

export function useScheduleData(user) {
    const [plantoes, setPlantoes] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [colaboradoresNoc, setColaboradoresNoc] = useState([]);
    const [colaboradoresSuporteN2, setColaboradoresSuporteN2] = useState([]);
    const [todosColaboradores, setTodosColaboradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState(null);
    const [historico, setHistorico] = useState([]);
    const [loadingHistorico, setLoadingHistorico] = useState(false);

    const fetchPlantoes = async () => {
        try {
            const res = await fetch('/api/plantoes');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await safeJson(res);
            if (data.sucesso && Array.isArray(data.plantoes)) {
                setPlantoes(data.plantoes);
                setErroCarregamento(null);
            } else {
                setPlantoes([]);
                throw new Error(data?.erro || 'Resposta inesperada da API de plantões.');
            }
        } catch (err) {
            console.error("Erro ao buscar plantões:", err);
            setPlantoes([]);
            setErroCarregamento('Não foi possível carregar a escala de plantão. Tente novamente em instantes.');
        }
    };

    const fetchFuncionarios = async () => {
        try {
            const res = await fetch('/api/funcionarios');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await safeJson(res);
            if (data.sucesso && Array.isArray(data.funcionarios)) {
                setFuncionarios(data.funcionarios);
            } else {
                setFuncionarios([]);
                throw new Error(data?.erro || 'Resposta inesperada da API de funcionários.');
            }

            const resColab = await fetch('/api/colaboradores?all=true');
            if (resColab.ok) {
                const dataColab = await safeJson(resColab);
                if (dataColab.sucesso && Array.isArray(dataColab.colaboradores)) {
                    setTodosColaboradores(dataColab.colaboradores);
                    const filtrarAtivos = (depto) => dataColab.colaboradores.filter(c => {
                        const nome = (c.funcionario_nome || '').trim();
                        const d = String(c.id_departamento || '');
                        const ativo = !nome.startsWith('(INATIVO') && !nome.startsWith('(FERIAS');
                        return ativo && depto.includes(d);
                    }).map(c => ({
                        funcionario_id: c.funcionario_id || c.id,
                        funcionario_nome: c.funcionario_nome,
                        foto_perfil: c.foto_perfil || null,
                        id_departamento: c.id_departamento,
                    }));
                    setColaboradoresNoc(filtrarAtivos(['13', '49']));
                    setColaboradoresSuporteN2(filtrarAtivos(['15', '21']));
                }
            }
        } catch (err) {
            console.error("Erro ao buscar funcionários:", err);
            setFuncionarios([]);
            setErroCarregamento('Não foi possível carregar a lista de funcionários para gestão dos plantões.');
        }
    };

    const fetchHistorico = async (dateStr) => {
        setLoadingHistorico(true);
        try {
            const res = await fetch(`/api/plantoes/historico/${dateStr}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await safeJson(res);
            if (data.sucesso) {
                setHistorico(data.historico || []);
            } else {
                setHistorico([]);
            }
        } catch (err) {
            console.error('Erro ao buscar histórico:', err);
            setHistorico([]);
        } finally {
            setLoadingHistorico(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchPlantoes();
            await fetchFuncionarios();
            setLoading(false);
        };
        init();
    }, [user]);

    return {
        plantoes,
        funcionarios,
        colaboradoresNoc,
        colaboradoresSuporteN2,
        todosColaboradores,
        loading,
        erroCarregamento,
        historico,
        loadingHistorico,
        fetchPlantoes,
        fetchHistorico,
        setHistorico,
    };
}
