import React, { useState, useEffect } from 'react';
import CalendarDay from './schedule/CalendarDay';
import MultiSelectEmployee from './schedule/MultiSelectEmployee';
import ScheduleRow from './schedule/ScheduleRow';
import SelectEmployee from './schedule/SelectEmployee';
import UserAvatar from './schedule/UserAvatar';
export default function Schedule({ setCurrentView, user }) {
    const [plantoes, setPlantoes] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const d = new Date();
    const [filterMonth, setFilterMonth] = useState((d.getMonth() + 1).toString());
    const [filterYear, setFilterYear] = useState(d.getFullYear().toString());
    const [filterSearch, setFilterSearch] = useState('');

    // Admin Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({ 
        n1_ids: [], 
        n2_ids: [], 
        gerente_ids: [] 
    });
    const [existingPlantao, setExistingPlantao] = useState(null);
    const [confirmOverwriteOpen, setConfirmOverwriteOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [deletando, setDeletando] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [historico, setHistorico] = useState([]);
    const [loadingHistorico, setLoadingHistorico] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const [erroCarregamento, setErroCarregamento] = useState(null);

    const safeJson = async (res) => {
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
            const text = await res.text().catch(() => '');
            throw new Error(`Resposta não-JSON (${res.status}): ${text.slice(0, 120)}`);
        }
        return res.json();
    };

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
        } catch (err) {
            console.error("Erro ao buscar funcionários:", err);
            setFuncionarios([]);
            setErroCarregamento('Não foi possível carregar a lista de funcionários para gestão dos plantões.');
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchPlantoes();
            if (user?.is_admin) {
                await fetchFuncionarios();
            }
            setLoading(false);
        };
        init();
    }, [user]);

    // Helper interno: garante 'YYYY-MM-DD' a partir de string ou Date
    const toIsoDay = (raw) => {
        if (!raw) return null;
        if (raw instanceof Date) {
            const y = raw.getUTCFullYear();
            const m = String(raw.getUTCMonth() + 1).padStart(2, '0');
            const d = String(raw.getUTCDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        return String(raw).split('T')[0];
    };

    // Função para formatar data do banco para exibição (ex: "Fev 05")
    const formatarData = (dataStr) => {
        const iso = toIsoDay(dataStr);
        if (!iso) return '';
        const data = new Date(`${iso}T00:00:00Z`);
        return data.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit', timeZone: 'UTC' })
            .replace('.', '')
            .replace(/^\w/, (c) => c.toUpperCase());
    };

    // Função para pegar o dia da semana
    const getDiaSemana = (dataStr) => {
        const iso = toIsoDay(dataStr);
        if (!iso) return '';
        const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return dias[new Date(`${iso}T00:00:00`).getDay()];
    };

    // Função para verificar se é final de semana
    const isFimDeSemana = (dataStr) => {
        const iso = toIsoDay(dataStr);
        if (!iso) return false;
        const dia = new Date(`${iso}T00:00:00`).getDay();
        return dia === 0 || dia === 6;
    };

    // Função para verificar se é hoje
    const isHoje = (dataStr) => {
        const iso = toIsoDay(dataStr);
        if (!iso) return false;
        const hojeObj = new Date();
        const y = hojeObj.getFullYear();
        const m = String(hojeObj.getMonth() + 1).padStart(2, '0');
        const d = String(hojeObj.getDate()).padStart(2, '0');
        return iso === `${y}-${m}-${d}`;
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

    const openManagement = (dateStr) => {
        if (!user?.is_admin) return;
        
        setSelectedDate(dateStr);
        setHistorico([]);
        const existingInfo = plantoes.find(p => toIsoDay(p?.data) === dateStr);
        
        const parseIds = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            return val.split(',').filter(Boolean);
        };
        
        if (existingInfo) {
            setFormData({
                n1_ids: parseIds(existingInfo.n1_id),
                n2_ids: parseIds(existingInfo.n2_id),
                gerente_ids: parseIds(existingInfo.gerente_id)
            });
            setExistingPlantao(existingInfo);
        } else {
            setFormData({ n1_ids: [], n2_ids: [], gerente_ids: [] });
            setExistingPlantao(null);
        }
        setIsModalOpen(true);
        fetchHistorico(dateStr);
    };

    const executarSalvamento = async () => {
        setSalvando(true);
        try {
            const payload = {
                data: selectedDate,
                n1_ids: formData.n1_ids,
                n2_ids: formData.n2_ids,
                gerente_ids: formData.gerente_ids,
                admin_usuario_id: user?.id || null
            };
            const res = await fetch('/api/plantoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const data = await safeJson(res);
            if (data.sucesso) {
                await fetchPlantoes();
                setConfirmOverwriteOpen(false);
                setIsModalOpen(false);
                showToast(existingPlantao ? 'Plantão substituído com sucesso!' : 'Plantão cadastrado com sucesso!', 'success');
            } else {
                showToast('Erro ao salvar plantão: ' + (data.erro || 'desconhecido'), 'error');
            }
        } catch(err) {
            console.error('Erro ao salvar plantão:', err);
            showToast('Erro de conexão ao salvar plantão.', 'error');
        } finally {
            setSalvando(false);
        }
    };

    const executarDelecao = async () => {
        setDeletando(true);
        try {
            const payload = {
                data: selectedDate,
                admin_usuario_id: user?.id || null
            };
            const res = await fetch('/api/plantoes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const data = await safeJson(res);
            if (data.sucesso) {
                await fetchPlantoes();
                setConfirmDeleteOpen(false);
                setIsModalOpen(false);
                showToast('Plantão excluído com sucesso!', 'success');
            } else {
                showToast('Erro ao excluir plantão: ' + (data.erro || 'desconhecido'), 'error');
            }
        } catch(err) {
            console.error('Erro ao excluir plantão:', err);
            showToast('Erro de conexão ao excluir plantão.', 'error');
        } finally {
            setDeletando(false);
        }
    };

    const salvarPlantao = (e) => {
        e.preventDefault();
        if (existingPlantao) {
            setConfirmOverwriteOpen(true);
        } else {
            executarSalvamento();
        }
    };

    const closeManagement = () => {
        setIsModalOpen(false);
        setConfirmOverwriteOpen(false);
        setConfirmDeleteOpen(false);
        setExistingPlantao(null);
        setHistorico([]);
    };

    const splitNomes = (raw) => (raw ? String(raw).split('|||').filter(Boolean) : []);

    const monthLabel = () => new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1)
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const handleImprimir = () => {
        if (!filteredPlantoes.length) {
            alert('Não há plantões no período selecionado para imprimir.');
            return;
        }
        const win = window.open('', '_blank');
        if (!win) {
            alert('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.');
            return;
        }

        const doc = win.document;
        doc.open();
        doc.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"></head><body></body></html>');
        doc.close();

        const titulo = `Escala de Plantão — ${monthLabel()}`;
        doc.title = titulo;

        const style = doc.createElement('style');
        style.textContent = `
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1d150c; padding: 32px; }
            h1 { font-size: 22px; margin: 0 0 4px 0; }
            .sub { color: #a17745; font-size: 13px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eaddcd; }
            th { background: #fcfaf8; text-transform: uppercase; font-size: 11px; letter-spacing: .04em; color: #a17745; }
            tr:nth-child(even) td { background: #fcfaf8; }
            @media print { body { padding: 0; } @page { margin: 16mm; } }
        `;
        doc.head.appendChild(style);

        const h1 = doc.createElement('h1');
        h1.textContent = titulo;
        doc.body.appendChild(h1);

        const sub = doc.createElement('div');
        sub.className = 'sub';
        sub.textContent = `Total de plantões: ${filteredPlantoes.length}` +
            (filterSearch ? ` · Filtro: "${filterSearch}"` : '');
        doc.body.appendChild(sub);

        const table = doc.createElement('table');
        const thead = doc.createElement('thead');
        const headRow = doc.createElement('tr');
        ['Data', 'Dia da Semana', 'Horário', 'N1 - ATENDIMENTO/NOC', 'Suporte N2', 'Gerente ON'].forEach(h => {
            const th = doc.createElement('th');
            th.textContent = h;
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = doc.createElement('tbody');
        filteredPlantoes
            .slice()
            .sort((a, b) => (toIsoDay(a.data) || '').localeCompare(toIsoDay(b.data) || ''))
            .forEach(p => {
                const tr = doc.createElement('tr');
                const fmtHora = (h) => {
                    const m = h ? String(h).match(/^(\d{2}):(\d{2})/) : null;
                    return m ? `${m[1]}:${m[2]}` : '—';
                };
                const horario = (p.horario_inicio || p.horario_fim)
                    ? `${fmtHora(p.horario_inicio)} – ${fmtHora(p.horario_fim)}`
                    : '—';
                [
                    formatarData(p.data),
                    getDiaSemana(p.data),
                    horario,
                    p.n1_nome || '—',
                    p.n2_nome || '—',
                    p.mgr_nome || '—'
                ].forEach(val => {
                    const td = doc.createElement('td');
                    td.textContent = val;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        table.appendChild(tbody);
        doc.body.appendChild(table);

        win.focus();
        setTimeout(() => { try { win.print(); } catch (_) { /* ignore */ } }, 100);
    };

    const handleExportarICal = () => {
        if (!filteredPlantoes.length) {
            showToast('Não há plantões no período selecionado para exportar.', 'error');
            return;
        }

        // ── Helpers ──────────────────────────────────────────────
        const pad = (n) => String(n).padStart(2, '0');

        // DTSTAMP em UTC (obrigatório no RFC 5545)
        const now = new Date();
        const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth()+1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

        // Escape de caracteres especiais conforme RFC 5545 §3.3.11
        const esc = (s) => String(s ?? '')
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,');

        // Line folding: máximo 75 octetos, continuação com CRLF + SPACE
        const fold = (line) => {
            const enc = new TextEncoder();
            if (enc.encode(line).length <= 75) return line;
            const chars = [...line];
            const out = [];
            let cur = '';
            for (const ch of chars) {
                if (enc.encode(cur + ch).length > (out.length === 0 ? 75 : 74)) {
                    out.push(cur);
                    cur = ' ' + ch;
                } else {
                    cur += ch;
                }
            }
            if (cur) out.push(cur);
            return out.join('\r\n');
        };

        // Converte "|||" separator → vírgulas legíveis
        const nomes = (raw) => raw ? raw.split('|||').map(n => n.trim()).filter(Boolean).join(', ') : 'Não atribuído';

        // Extrai HHmmss de "HH:MM" ou "HH:MM:SS", com fallback
        const toTime = (raw, fallback) => {
            const m = String(raw ?? '').match(/^(\d{2}):(\d{2})(?::(\d{2}))?/);
            return m ? `${m[1]}${m[2]}${m[3] ?? '00'}` : fallback;
        };

        const monthLabel = `${String(filterMonth).padStart(2,'0')}/${filterYear}`;

        // ── VCALENDAR header ──────────────────────────────────────
        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Prestek Telecom//Intranet//PT',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            `X-WR-CALNAME:Escala de Plantão Prestek — ${monthLabel}`,
            'X-WR-TIMEZONE:America/Sao_Paulo',
            'X-WR-CALDESC:Gerado automaticamente pela Intranet Prestek',
            // ── VTIMEZONE (America/Sao_Paulo — BRT/BRST) ──────────
            'BEGIN:VTIMEZONE',
            'TZID:America/Sao_Paulo',
            'X-LIC-LOCATION:America/Sao_Paulo',
            'BEGIN:STANDARD',
            'TZOFFSETFROM:-0200',
            'TZOFFSETTO:-0300',
            'TZNAME:BRT',
            'DTSTART:19701018T000000',
            'RRULE:FREQ=YEARLY;BYDAY=3SU;BYMONTH=2',
            'END:STANDARD',
            'BEGIN:DAYLIGHT',
            'TZOFFSETFROM:-0300',
            'TZOFFSETTO:-0200',
            'TZNAME:BRST',
            'DTSTART:19701004T000000',
            'RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11',
            'END:DAYLIGHT',
            'END:VTIMEZONE',
        ];

        // ── VEVENTs ───────────────────────────────────────────────
        filteredPlantoes
            .slice()
            .sort((a, b) => (toIsoDay(a.data) ?? '').localeCompare(toIsoDay(b.data) ?? ''))
            .forEach(p => {
                const iso = toIsoDay(p.data);
                if (!iso) return;
                const [y, mo, d] = iso.split('-');
                const dateStr = `${y}${mo}${d}`;
                const startTime = toTime(p.horario_inicio, '090000');
                const endTime   = toTime(p.horario_fim,    '170000');
                const uid = `plantao-${iso}-${p.id ?? crypto.randomUUID()}@prestek.intranet`;

                const n1  = nomes(p.n1_nome);
                const n2  = nomes(p.n2_nome);
                const mgr = nomes(p.mgr_nome);

                const summary = `Plantão — ${iso.split('-').reverse().join('/')}`;
                const description = [
                    `📋 Escala de Plantão Prestek`,
                    ``,
                    `👤 Suporte N1: ${n1}`,
                    `👤 Suporte N2: ${n2}`,
                    `👔 Supervisão: ${mgr}`,
                    ``,
                    `Gerado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
                ].join('\n');

                lines.push('BEGIN:VEVENT');
                lines.push(fold(`UID:${uid}`));
                lines.push(`DTSTAMP:${dtstamp}`);
                lines.push(`DTSTART;TZID=America/Sao_Paulo:${dateStr}T${startTime}`);
                lines.push(`DTEND;TZID=America/Sao_Paulo:${dateStr}T${endTime}`);
                lines.push(fold(`SUMMARY:${esc(summary)}`));
                lines.push(fold(`DESCRIPTION:${esc(description)}`));
                lines.push('CATEGORIES:Escala,Plantão,Prestek');
                lines.push('STATUS:CONFIRMED');
                lines.push('TRANSP:OPAQUE');
                lines.push('SEQUENCE:0');
                lines.push('END:VEVENT');
            });

        lines.push('END:VCALENDAR');

        const ics = lines.join('\r\n') + '\r\n';
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `escala-plantao-${filterYear}-${String(filterMonth).padStart(2, '0')}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    // Filter Logic
    const filteredPlantoes = plantoes.filter(p => {
        const pStr = toIsoDay(p?.data);
        if (!pStr) return false;
        const [y, m] = pStr.split('-');
        if (parseInt(y) !== parseInt(filterYear) || parseInt(m) !== parseInt(filterMonth)) return false;

        if (filterSearch) {
            const term = filterSearch.toLowerCase();
            const allNomes = [
                ...(Array.isArray(p.n1_nome) ? p.n1_nome : [p.n1_nome]),
                ...(Array.isArray(p.n2_nome) ? p.n2_nome : [p.n2_nome]),
                ...(Array.isArray(p.mgr_nome) ? p.mgr_nome : [p.mgr_nome])
            ].filter(Boolean).map(n => n.toLowerCase());
            if (!allNomes.some(n => n.includes(term))) return false;
        }
        return true;
    });

    const daysInMonth = new Date(parseInt(filterYear), parseInt(filterMonth), 0).getDate();
    const firstDayOfMonth = new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1).getDay();

    return (
        <div className="flex-1 flex flex-col w-full max-w-[1920px] mx-auto px-4 md:px-8 py-8 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <main className="flex-1 flex flex-col gap-8">
                {/* Context & Breadcrumbs */}
                <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium text-secondary tracking-wide flex items-center gap-2">
                        <button onClick={() => setCurrentView('dashboard')} className="hover:text-primary transition-colors flex items-center gap-1">
                            Início
                        </button>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-on-surface lowercase">escala de plantão</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter">Visão Geral da Escala</h1>
                            <p className="text-secondary font-medium mt-1">Visualize e gerencie as atribuições de cobertura mensal.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleImprimir} className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-bold shadow-sm hover:bg-surface-container-low transition-colors">
                                <span className="material-symbols-outlined text-[20px]">print</span>
                                Imprimir
                            </button>
                            <button onClick={handleExportarICal} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-bold hover:brightness-110 transition-colors shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-[20px]">ios_share</span>
                                Exportar iCal
                            </button>
                        </div>
                    </div>
                </div>

            {erroCarregamento && (
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {erroCarregamento}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Filters & Context */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* Filtros Card */}
                    <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 shadow-sm flex flex-col gap-5 border border-surface-container-high/50 animate-in fade-in slide-in-from-left-4 duration-500 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between border-b border-surface-container-high/50 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">tune</span>
                                <h2 className="text-lg font-black text-on-surface tracking-tight">Filtros</h2>
                            </div>
                            {(filterSearch !== '' || filterMonth !== (d.getMonth() + 1).toString() || filterYear !== d.getFullYear().toString()) && (
                                <button 
                                    onClick={() => { setFilterSearch(''); setFilterMonth((d.getMonth() + 1).toString()); setFilterYear(d.getFullYear().toString()); }}
                                    className="text-[10px] uppercase font-bold tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-md"
                                    aria-label="Limpar filtros"
                                >
                                    <span className="material-symbols-outlined text-[14px]">close_small</span> Limpar
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1.5 cursor-pointer group">
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest group-focus-within:text-primary transition-colors">Mês</span>
                                    <div className="relative">
                                        <select 
                                            value={filterMonth}
                                            onChange={(e) => setFilterMonth(e.target.value)}
                                            className="w-full bg-surface-container-low border border-transparent rounded-lg py-2.5 pl-3 pr-8 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer font-bold text-sm transition-all hover:bg-surface-container-low/80"
                                            aria-label="Selecionar Mês"
                                        >
                                            <option value="1">Jan</option><option value="2">Fev</option><option value="3">Mar</option>
                                            <option value="4">Abr</option><option value="5">Mai</option><option value="6">Jun</option>
                                            <option value="7">Jul</option><option value="8">Ago</option><option value="9">Set</option>
                                            <option value="10">Out</option><option value="11">Nov</option><option value="12">Dez</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary group-focus-within:text-primary text-[18px] transition-colors">expand_more</span>
                                    </div>
                                </label>
                                <label className="flex flex-col gap-1.5 cursor-pointer group">
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest group-focus-within:text-primary transition-colors">Ano</span>
                                    <div className="relative">
                                        <select 
                                            value={filterYear}
                                            onChange={(e) => setFilterYear(e.target.value)}
                                            className="w-full bg-surface-container-low border border-transparent rounded-lg py-2.5 pl-3 pr-8 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer font-bold text-sm transition-all hover:bg-surface-container-low/80"
                                            aria-label="Selecionar Ano"
                                        >
                                            <option value="2024">2024</option>
                                            <option value="2025">2025</option>
                                            <option value="2026">2026</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary group-focus-within:text-primary text-[18px] transition-colors">expand_more</span>
                                    </div>
                                </label>
                            </div>
                            <label className="flex flex-col gap-1.5 group cursor-pointer">
                                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest group-focus-within:text-primary transition-colors block mb-0.5">Atendente</span>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg group-focus-within:text-primary transition-colors">search</span>
                                    <input 
                                        type="text"
                                        placeholder="Buscar nome..."
                                        value={filterSearch}
                                        onChange={e => setFilterSearch(e.target.value)}
                                        className="w-full bg-surface-container-low border border-transparent rounded-lg py-2.5 pl-10 pr-10 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-bold text-sm placeholder-secondary-variant/50 transition-all hover:bg-surface-container-low/80"
                                        aria-label="Buscar Atendente"
                                    />
                                    {filterSearch && (
                                        <button 
                                            onClick={(e) => { e.preventDefault(); setFilterSearch(''); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
                                            aria-label="Limpar busca"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Mini Calendar */}
                    <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-surface-container-high/50 animate-in fade-in slide-in-from-left-4 duration-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-black text-on-surface capitalize tracking-tight flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                                {new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </h3>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-3 font-black text-secondary uppercase tracking-widest opacity-80">
                            {['D','S','T','Q','Q','S','S'].map((d, i) => <div key={i}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-sm bg-surface-container-low/20 rounded-xl p-1">
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const day = i + 1;
                                const dateStr = `${filterYear}-${String(filterMonth).padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                const temPlantao = plantoes.some(p => toIsoDay(p?.data) === dateStr);
                                const ehHoje = isHoje(`${dateStr}T00:00:00Z`);
                                return (
                                    <CalendarDay 
                                        key={day} 
                                        day={day} 
                                        active={temPlantao} 
                                        isToday={ehHoje} 
                                        onClick={() => openManagement(dateStr)}
                                        isAdmin={user?.is_admin}
                                    />
                                );
                            })}
                        </div>
                        <div className="mt-5 flex gap-4 text-[10px] font-black text-secondary uppercase tracking-widest">
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm shadow-primary/20"></div> Hoje</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-primary rounded-full"></div> Plantão</div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border-l-4 border-primary animate-in fade-in slide-in-from-left-4 duration-1000 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px]">insights</span>
                                Status do Filtro
                            </div>
                            <div className="text-3xl font-black text-on-surface">
                                {filteredPlantoes.length} <span className="text-sm font-bold text-secondary uppercase tracking-widest ml-1">Plantões Filtrados</span>
                            </div>
                        </div>
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-110 duration-300">
                            <span className="material-symbols-outlined">event_available</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Data Table */}
                <div className="lg:col-span-9 flex flex-col gap-6">
                    <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden flex flex-col border border-surface-container-high/50 animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="p-6 md:p-8 flex flex-wrap justify-between items-center bg-surface-container-lowest border-b border-surface-container-low gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-on-surface tracking-tight">Escala Detalhada de Suporte</h2>
                                <p className="text-sm font-medium text-secondary mt-1">Clique nas linhas {user?.is_admin ? "ou no calendário" : ""} para ver detalhes.</p>
                            </div>
                            {user?.is_admin && (
                                <div className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-primary/20 animate-pulse">
                                    <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                                    Gestão Ativa
                                </div>
                            )}
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low/50 border-b border-surface-container-high/50">
                                        <th scope="col" className="p-4 pl-8 text-[11px] font-black text-secondary uppercase tracking-widest">DATA</th>
                                        <th scope="col" className="p-4 text-[11px] font-black text-secondary uppercase tracking-widest">DIA</th>
                                        <th scope="col" className="p-4 text-[11px] font-black text-secondary uppercase tracking-widest">N1 - ATENDIMENTO/NOC</th>
                                        <th scope="col" className="p-4 text-[11px] font-black text-secondary uppercase tracking-widest">N2 - SUPORTE/SERVIÇOS</th>
                                        <th scope="col" className="p-4 pr-8 text-[11px] font-black text-secondary uppercase tracking-widest text-right sm:text-left">SUPERVISÃO</th>
                                        {user?.is_admin && <th scope="col" className="p-4 pr-6 w-12"></th>}
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {loading ? (
                                        <tr><td colSpan={5} className="p-12 text-center text-secondary font-bold">Carregando escala...</td></tr>
                                    ) : filteredPlantoes.length === 0 ? (
                                        <tr><td colSpan={5} className="p-12 text-center text-secondary font-bold">Nenhum plantão agendado para este filtro.</td></tr>
                                    ) : (
                                        filteredPlantoes.map((p) => {
                                            const parsePessoas = (nomes, fotos) => {
                                                if (!nomes) return [{ name: 'Não atribuído', initials: '??', img: null }];
                                                const arr = nomes.split('|||');
                                                const fotosArr = (fotos || '').split('|||');
                                                return arr.filter(Boolean).map((nome, i) => ({
                                                    name: nome,
                                                    initials: (nome || '??').split(' ').map(n => n[0]).join('').slice(0, 2),
                                                    img: fotosArr[i] || null
                                                }));
                                            };
                                            return (
                                                <ScheduleRow
                                                    key={p.id ?? toIsoDay(p.data)}
                                                    date={formatarData(p.data)}
                                                    day={getDiaSemana(p.data)}
                                                    isToday={isHoje(p.data)}
                                                    isWeekend={isFimDeSemana(p.data)}
                                                    n1={parsePessoas(p.n1_nome, p.n1_foto)}
                                                    n2={p.n2_id ? parsePessoas(p.n2_nome, p.n2_foto) : [{ name: 'Não atribuído', initials: '??', img: null }]}
                                                    mgr={parsePessoas(p.mgr_nome, p.mgr_foto)}
                                                    isAdmin={user?.is_admin}
                                                    onEdit={() => openManagement(toIsoDay(p.data))}
                                                />
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Gestão */}
            {isModalOpen && user?.is_admin && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background-dark/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300" onClick={closeManagement}>
                    <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md border border-surface-container-high flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-low shrink-0 rounded-t-3xl sm:rounded-t-3xl">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">edit_calendar</span>
                                <h2 className="text-base font-black text-on-surface">Gerenciar Plantão</h2>
                            </div>
                            <button onClick={closeManagement} className="text-secondary hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <form onSubmit={salvarPlantao} className="flex flex-col overflow-y-auto flex-1 min-h-0">
                            <div className="p-3 flex flex-col gap-3">
                                <div className="flex gap-2 items-center bg-primary/10 text-primary px-3 py-2 rounded-lg font-black text-xs border border-primary/20">
                                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                    <span>Data: {selectedDate.split('-').reverse().join('/')}</span>
                                </div>

                                {existingPlantao && (
                                    <div className="flex flex-col gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-300/60 dark:border-amber-700/40 text-amber-900 dark:text-amber-200 px-3 py-2.5 rounded-lg text-xs">
                                        <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-[10px]">
                                            <span className="material-symbols-outlined text-[16px]">warning</span>
                                            Já existe um plantão cadastrado nesta data
                                        </div>
                                        <div className="flex flex-col gap-1 font-medium">
                                            <div><span className="font-black">N1:</span> {splitNomes(existingPlantao.n1_nome).join(', ') || '—'}</div>
                                            <div><span className="font-black">N2:</span> {splitNomes(existingPlantao.n2_nome).join(', ') || '—'}</div>
                                            <div><span className="font-black">Supervisão:</span> {splitNomes(existingPlantao.mgr_nome).join(', ') || '—'}</div>
                                        </div>
                                        <div className="text-[10px] opacity-80 italic">Salvar irá substituir esta escala.</div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <MultiSelectEmployee 
                                        label="N1 - ATENDIMENTO/NOC" 
                                        values={formData.n1_ids} 
                                        onChange={(vals) => setFormData({...formData, n1_ids: vals})} 
                                        options={funcionarios} 
                                    />
                                    <MultiSelectEmployee 
                                        label="N2 - SUPORTE/SERVIÇOS" 
                                        values={formData.n2_ids} 
                                        onChange={(vals) => setFormData({...formData, n2_ids: vals})} 
                                        options={funcionarios} 
                                        allowEmpty
                                    />
                                    <MultiSelectEmployee 
                                        label="SUPERVISÃO" 
                                        values={formData.gerente_ids} 
                                        onChange={(vals) => setFormData({...formData, gerente_ids: vals})} 
                                        options={funcionarios} 
                                    />
                                </div>

                                {/* Histórico de alterações */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1.5 ml-0.5">
                                        <span className="material-symbols-outlined text-[14px] text-secondary">history</span>
                                        <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Histórico de Alterações</span>
                                    </div>
                                    {loadingHistorico ? (
                                        <div className="text-xs text-secondary text-center py-3 animate-pulse">Carregando histórico...</div>
                                    ) : historico.length === 0 ? (
                                        <div className="text-xs text-secondary italic text-center py-3 bg-surface-container-low rounded-lg border border-surface-container-high/50">
                                            Nenhuma alteração registrada para esta data.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                                            {historico.map((h) => {
                                                const dt = new Date(h.alterado_em);
                                                const fmt = dt.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
                                                return (
                                                    <div key={h.id} className="bg-surface-container-low rounded-lg border border-surface-container-high/60 p-2 flex flex-col gap-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[12px] text-primary">manage_accounts</span>
                                                                <span className="text-[10px] font-black text-on-surface">{h.admin_nome || 'Desconhecido'}</span>
                                                            </div>
                                                            <span className="text-[9px] text-secondary font-medium">{fmt}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] text-secondary mt-0.5">
                                                            <div className="col-span-2 font-black text-[9px] uppercase tracking-wider text-secondary/70 mb-0.5">Antes → Depois</div>
                                                            <div><span className="font-black text-on-surface/60">N1:</span> {h.n1_anterior || '—'}</div>
                                                            <div><span className="font-black text-primary">N1:</span> {h.n1_novo || '—'}</div>
                                                            <div><span className="font-black text-on-surface/60">N2:</span> {h.n2_anterior || '—'}</div>
                                                            <div><span className="font-black text-primary">N2:</span> {h.n2_novo || '—'}</div>
                                                            <div><span className="font-black text-on-surface/60">Sup:</span> {h.gerente_anterior || '—'}</div>
                                                            <div><span className="font-black text-primary">Sup:</span> {h.gerente_novo || '—'}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer fixo */}
                            <div className="shrink-0 flex gap-2 p-3 pt-2 border-t border-surface-container-high bg-surface-container-lowest">
                                {existingPlantao && (
                                    <button 
                                        type="button" 
                                        onClick={() => setConfirmDeleteOpen(true)}
                                        disabled={salvando || deletando}
                                        className="px-3 py-2 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                        title="Excluir Plantão"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                )}
                                <button type="button" onClick={closeManagement} className="flex-1 px-3 py-2 bg-surface-container-low text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={salvando || deletando} className="flex-1 px-3 py-2 bg-primary text-white font-black rounded-xl hover:brightness-110 transition-colors shadow-md shadow-primary/30 flex items-center justify-center gap-1.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    <span>{salvando ? 'Salvando...' : 'Salvar'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmação de exclusão */}
            {confirmDeleteOpen && existingPlantao && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background-dark/70 backdrop-blur-sm p-4">
                    <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm border border-surface-container-high flex flex-col">
                        <div className="px-5 py-4 border-b border-surface-container-high flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500">delete_forever</span>
                            <h3 className="text-base font-black text-on-surface">Excluir plantão?</h3>
                        </div>
                        <div className="px-5 py-4 flex flex-col gap-3 text-sm text-on-surface">
                            <p className="font-medium">
                                Tem certeza que deseja excluir permanentemente o plantão do dia <strong className="whitespace-nowrap">{new Date(selectedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong>?
                            </p>
                            <div className="bg-surface-container-low rounded-lg p-3 text-xs flex flex-col gap-1 opacity-70">
                                <div><span className="font-black">N1:</span> {splitNomes(existingPlantao.n1_nome).join(', ') || '—'}</div>
                                <div><span className="font-black">N2:</span> {splitNomes(existingPlantao.n2_nome).join(', ') || '—'}</div>
                                <div><span className="font-black">Supervisão:</span> {splitNomes(existingPlantao.mgr_nome).join(', ') || '—'}</div>
                            </div>
                        </div>
                        <div className="flex gap-2 px-5 py-4 border-t border-surface-container-high">
                            <button
                                type="button"
                                onClick={() => setConfirmDeleteOpen(false)}
                                disabled={deletando}
                                className="flex-1 px-3 py-2 bg-surface-container-low text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-colors text-sm disabled:opacity-60"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={executarDelecao}
                                disabled={deletando}
                                className="flex-1 px-3 py-2 bg-red-500 text-white font-black rounded-xl hover:brightness-110 transition-colors shadow-md shadow-red-500/30 text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
                            >
                                {deletando && <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>}
                                {deletando ? 'Excluindo...' : 'Sim, excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmação de sobrescrita */}
            {confirmOverwriteOpen && existingPlantao && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background-dark/70 backdrop-blur-sm p-4">
                    <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm border border-surface-container-high flex flex-col">
                        <div className="px-5 py-4 border-b border-surface-container-high flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">warning</span>
                            <h3 className="text-base font-black text-on-surface">Substituir plantão?</h3>
                        </div>
                        <div className="px-5 py-4 flex flex-col gap-3 text-sm text-on-surface">
                            <p className="font-medium">
                                Esta data já tem um plantão cadastrado. Tem certeza que deseja substituir a escala atual?
                            </p>
                            <div className="bg-surface-container-low rounded-lg p-3 text-xs flex flex-col gap-1">
                                <div className="font-black uppercase tracking-wider text-[10px] text-secondary mb-1">Escala atual</div>
                                <div><span className="font-black">N1:</span> {splitNomes(existingPlantao.n1_nome).join(', ') || '—'}</div>
                                <div><span className="font-black">N2:</span> {splitNomes(existingPlantao.n2_nome).join(', ') || '—'}</div>
                                <div><span className="font-black">Supervisão:</span> {splitNomes(existingPlantao.mgr_nome).join(', ') || '—'}</div>
                            </div>
                        </div>
                        <div className="flex gap-2 px-5 py-4 border-t border-surface-container-high">
                            <button
                                type="button"
                                onClick={() => setConfirmOverwriteOpen(false)}
                                disabled={salvando}
                                className="flex-1 px-3 py-2 bg-surface-container-low text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-colors text-sm disabled:opacity-60"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={executarSalvamento}
                                disabled={salvando}
                                className="flex-1 px-3 py-2 bg-red-500 text-white font-black rounded-xl hover:brightness-110 transition-colors shadow-md shadow-red-500/30 text-sm disabled:opacity-60"
                            >
                                {salvando ? 'Substituindo...' : 'Sim, substituir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast.show && (
                <div className="fixed top-8 right-8 z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`flex items-center gap-3 rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-md border ${
                        toast.type === 'success'
                        ? 'bg-emerald-500/90 border-emerald-400 text-white'
                        : 'bg-red-500/90 border-red-400 text-white'
                    }`}>
                        <span className="material-symbols-outlined text-2xl font-bold">
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <p className="font-bold tracking-wide">{toast.message}</p>
                    </div>
                </div>
            )}

            <footer className="mt-8 pt-8 border-t border-surface-container-high pb-4 flex flex-col md:flex-row justify-between items-center text-xs text-secondary font-bold gap-4 uppercase tracking-widest">
                <p>© 2026 Prestek Intranet • Portal Interno</p>
                <div className="flex gap-6">
                    <a className="hover:text-primary transition-colors" href="#">Políticas</a>
                    <a className="hover:text-primary transition-colors" href="#">Suporte</a>
                </div>
            </footer>
        </main>
    </div>
    );
}

