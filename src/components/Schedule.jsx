import React, { useState, useEffect } from 'react';
import LottieAvatar from './common/LottieAvatar';

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
    const [salvando, setSalvando] = useState(false);
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
        ['Data', 'Dia da Semana', 'Horário', 'Suporte N1', 'Suporte N2', 'Gerente ON'].forEach(h => {
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
                    <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 shadow-sm flex flex-col gap-5 border border-surface-container-high/50 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center gap-2 border-b border-surface-container-high/50 pb-4">
                            <span className="material-symbols-outlined text-secondary">tune</span>
                            <h2 className="text-lg font-bold text-on-surface">Filtros</h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Mês</span>
                                    <select 
                                        value={filterMonth}
                                        onChange={(e) => setFilterMonth(e.target.value)}
                                        className="w-full bg-surface-container-low border-none rounded-md py-2.5 px-3 text-on-surface focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer font-bold text-sm"
                                    >
                                        <option value="1">Jan</option><option value="2">Fev</option><option value="3">Mar</option>
                                        <option value="4">Abr</option><option value="5">Mai</option><option value="6">Jun</option>
                                        <option value="7">Jul</option><option value="8">Ago</option><option value="9">Set</option>
                                        <option value="10">Out</option><option value="11">Nov</option><option value="12">Dez</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Ano</span>
                                    <select 
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                        className="w-full bg-surface-container-low border-none rounded-md py-2.5 px-3 text-on-surface focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer font-bold text-sm"
                                    >
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                    </select>
                                </label>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-2">Atendente</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">search</span>
                                    <input 
                                        type="text"
                                        placeholder="Buscar nome..."
                                        value={filterSearch}
                                        onChange={e => setFilterSearch(e.target.value)}
                                        className="w-full bg-surface-container-low border-none rounded-md py-2.5 pl-10 pr-4 text-on-surface focus:ring-2 focus:ring-primary focus:outline-none font-bold text-sm placeholder-secondary-variant/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mini Calendar */}
                    <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-surface-container-high/50 animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-on-surface capitalize">
                                {new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </h3>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-2 font-black text-secondary uppercase tracking-tighter">
                            {['D','S','T','Q','Q','S','S'].map((d, i) => <div key={i}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-sm">
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
                        <div className="mt-4 flex gap-4 text-[10px] font-bold text-secondary">
                            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-primary rounded-sm shadow-sm shadow-primary/20"></div> Hoje</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-secondary rounded-full"></div> Plantão</div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border-l-4 border-primary animate-in fade-in slide-in-from-left-4 duration-1000">
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Status do Filtro</div>
                        <div className="text-3xl font-black text-on-surface">
                            {filteredPlantoes.length} <span className="text-sm font-bold text-secondary">Plantões Filtrados</span>
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
                                        <th className="p-4 pl-8 text-[11px] font-black text-secondary uppercase tracking-widest">DATA</th>
                                        <th className="p-4 text-[11px] font-black text-secondary uppercase tracking-widest">DIA</th>
                                        <th className="p-4 text-[11px] font-black text-secondary uppercase tracking-widest">N1 - ATENDIMENTO</th>
                                        <th className="p-4 text-[11px] font-black text-secondary uppercase tracking-widest">N2 - SUPORTE/SERVIÇOS</th>
                                        <th className="p-4 pr-8 text-[11px] font-black text-secondary uppercase tracking-widest text-right sm:text-left">SUPERVISÃO</th>
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
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background-dark/60 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm border border-surface-container-high flex flex-col max-h-[92vh] sm:max-h-[85vh]">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-surface-container-high flex justify-between items-center bg-surface-container-low shrink-0 rounded-t-2xl sm:rounded-t-2xl">
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
                                        label="SUPORTE N1" 
                                        values={formData.n1_ids} 
                                        onChange={(vals) => setFormData({...formData, n1_ids: vals})} 
                                        options={funcionarios} 
                                    />
                                    <MultiSelectEmployee 
                                        label="SUPORTE N2" 
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
                                <button type="button" onClick={closeManagement} className="flex-1 px-3 py-2 bg-surface-container-low text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-colors text-sm">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={salvando} className="flex-1 px-3 py-2 bg-primary text-white font-black rounded-xl hover:brightness-110 transition-colors shadow-md shadow-primary/30 flex items-center justify-center gap-1.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    <span>{salvando ? 'Salvando...' : 'Salvar'}</span>
                                </button>
                            </div>
                        </form>
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

// Subcomponentes Redesenhados

function MultiSelectEmployee({ label, values, onChange, options, allowEmpty }) {
    const toggleValue = (val) => {
        if (values.includes(val)) {
            onChange(values.filter(v => v !== val));
        } else {
            onChange([...values, val]);
        }
    };
    
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between ml-0.5">
                <span className="text-[10px] font-black uppercase text-secondary tracking-widest">
                    {label}
                </span>
                {allowEmpty && values.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onChange([])}
                        className="text-[10px] text-red-500 font-bold hover:underline"
                    >
                        Limpar
                    </button>
                )}
            </div>
            <div className="rounded-lg border border-surface-container-high bg-surface-container-low p-1.5 max-h-28 overflow-y-auto">
                <div className="flex flex-col gap-0.5">
                    {options.map(func => (
                        <label key={func.funcionario_id} className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 px-1.5 py-1 rounded-md transition-colors">
                            <input
                                type="checkbox"
                                checked={values.includes(String(func.funcionario_id))}
                                onChange={() => toggleValue(String(func.funcionario_id))}
                                className="w-4 h-4 rounded border-surface-container-high text-primary focus:ring-primary shrink-0"
                            />
                            <span className="font-medium text-on-surface text-xs leading-tight">{func.funcionario_nome}</span>
                        </label>
                    ))}
                </div>
            </div>
            {values.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                    {values.map(val => {
                        const func = options.find(o => String(o.funcionario_id) === val);
                        return func ? (
                            <span key={val} className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">
                                {func.funcionario_nome.split(' ')[0]}
                            </span>
                        ) : null;
                    })}
                </div>
            )}
        </div>
    );
}

function SelectEmployee({ label, value, onChange, options, allowEmpty }) {
    return (
        <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-[10px] font-black uppercase text-secondary tracking-widest flex items-center gap-1.5 ml-1">
                {label} {allowEmpty && <span className="text-[8px] opacity-60 font-medium">(Opcional)</span>}
            </span>
            <div className="relative group">
                <select 
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-surface-container-high bg-surface-container-low px-3 py-3 sm:px-4 sm:py-3.5 pr-10 text-on-surface text-sm sm:text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer font-bold transition-all shadow-sm group-hover:bg-white dark:group-hover:bg-surface-container-lowest"
                >
                    <option value="">-- Não Atribuído --</option>
                    {options.map(func => (
                        <option key={func.funcionario_id} value={func.funcionario_id}>
                            {func.funcionario_nome}
                        </option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary transition-transform group-hover:translate-y-[-40%] group-hover:text-primary">expand_more</span>
            </div>
        </label>
    );
}

function CalendarDay({ day, isToday, active, onClick, isAdmin }) {
    let classes = "w-full aspect-square flex flex-col items-center justify-center text-xs rounded-lg font-bold transition-all relative group ";
    
    if (isAdmin) {
        classes += "cursor-pointer hover:scale-105 active:scale-95 ";
    } else {
        classes += "cursor-default ";
    }

    if (isToday) {
        classes += "bg-primary text-white shadow-lg shadow-primary/30 z-10 ";
    } else if (active) {
        classes += "text-on-surface hover:bg-surface-container-low border border-surface-container-high/30 ";
    } else {
        classes += "text-on-surface/40 hover:text-on-surface hover:bg-surface-container-low ";
    }

    return (
        <button onClick={onClick} className={classes}>
            {day}
            {active && !isToday && (
                <div className="w-1.5 h-1.5 bg-secondary rounded-full absolute bottom-1.5 left-1/2 -translate-x-1/2 shadow-sm"></div>
            )}
        </button>
    );
}

function ScheduleRow({ date, day, isToday, isWeekend, n1, n2, mgr, isAdmin, onEdit }) {
    const isArray = (val) => Array.isArray(val);
    
    return (
        <tr 
            className={`border-b border-surface-container-low/30 hover:bg-primary/5 transition-all duration-300 group cursor-pointer ${isToday ? 'bg-primary/[0.03]' : ''}`}
            onClick={isAdmin ? onEdit : undefined}
        >
            <td className={`p-4 pl-8 font-black relative ${isToday ? 'text-primary' : 'text-on-surface'}`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isToday ? 'bg-primary' : 'group-hover:bg-primary/40 bg-transparent'}`}></div>
                {date}
            </td>
            <td className={`p-4 font-bold ${isWeekend ? 'text-secondary opacity-70' : 'text-on-surface-variant'}`}>{day}</td>
            <td className="p-4">
                {isArray(n1) ? (
                    <div className="flex flex-col gap-2">
                        {n1.map((u, i) => <UserAvatar key={i} user={u} />)}
                    </div>
                ) : <UserAvatar user={n1} />}
            </td>
            <td className="p-4">
                {isArray(n2) ? (
                    <div className="flex flex-col gap-2">
                        {n2.map((u, i) => <UserAvatar key={i} user={u} allowEmpty />)}
                    </div>
                ) : <UserAvatar user={n2} allowEmpty />}
            </td>
            <td className="p-4 pr-8 text-right sm:text-left">
                <div className="flex flex-col gap-2 items-end sm:items-start">
                    {isArray(mgr) ? mgr.map((u, i) => (
                        <div key={i} className="flex items-center gap-2 bg-secondary-container/30 rounded-full pl-1.5 pr-3 py-1 border border-secondary/10">
                            <UserAvatar user={u} hideName className="!gap-0 !size-8" />
                            <span className="font-bold text-on-surface text-[11px] whitespace-nowrap">{u.name}</span>
                        </div>
                    )) : (
                        <div className="flex items-center gap-2 bg-secondary-container/30 rounded-full pl-1.5 pr-3 py-1 border border-secondary/10">
                            <UserAvatar user={mgr} hideName className="!gap-0" />
                            <span className="font-bold text-on-surface text-[11px] whitespace-nowrap">{mgr.name}</span>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}

function UserAvatar({ user, allowEmpty, hideName, className }) {
    if (!user && allowEmpty) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                 <div className="size-8 rounded-full bg-surface-container-low border border-surface-container-high/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] text-secondary">person_off</span>
                 </div>
                 {!hideName && <span className="text-[11px] font-bold text-secondary opacity-50 italic">Pendente</span>}
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className={`flex items-center gap-3 group/avatar ${className}`}>
            {user.img ? (
                <div className="relative">
                    <LottieAvatar 
                        src={user.img}
                        className="size-9 rounded-full border-2 border-surface-container-high shadow-sm shrink-0 group-hover/avatar:border-primary/50 transition-colors"
                    />
                </div>
            ) : (
                <div className="size-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-black text-[11px] border-2 border-secondary/10 shadow-sm shrink-0 uppercase group-hover/avatar:border-primary/30 transition-colors">
                    {user.initials}
                </div>
            )}
            {!hideName && (
                <div className="flex flex-col -gap-1">
                    <span className="font-black text-on-surface whitespace-nowrap tracking-tight group-hover/avatar:text-primary transition-colors">{user.name}</span>
                    <span className="text-[9px] text-secondary font-bold uppercase tracking-wider opacity-0 group-hover/avatar:opacity-100 transition-opacity">Visualizar Perfil</span>
                </div>
            )}
        </div>
    );
}
