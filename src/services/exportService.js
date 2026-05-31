import { toIsoDay } from '../utils/dateHelpers';

export const handleExportarHistoricoCSV = async (filterMonth, filterYear, showToast, adminEmail = '') => {
    try {
        showToast('Gerando CSV do histórico...', 'info');
        const params = new URLSearchParams({ mes: filterMonth, ano: filterYear });
        const res = await fetch(`/api/plantoes/historico?${params}`, {
            headers: adminEmail ? { 'x-admin-email': adminEmail } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.erro || 'Erro ao buscar histórico');

        const historico = data.historico || [];
        if (!historico.length) {
            showToast('Nenhum registro de histórico no período selecionado.', 'error');
            return;
        }

        const escapeCsv = (val) => {
            const s = val == null ? '' : String(val);
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                return '"' + s.replace(/"/g, '""') + '"';
            }
            return s;
        };

        const headers = [
            'Data do Plantão', 'Alterado Por', 'Momento da Alteração',
            'N1 Anterior', 'N2 Anterior', 'Supervisor Anterior',
            'N1 Novo', 'N2 Novo', 'Supervisor Novo'
        ];

        const rows = historico.map(h => {
            const plantaoData = h.plantao_data
                ? new Date(h.plantao_data + 'T12:00:00').toLocaleDateString('pt-BR')
                : '—';
            const alteradoEm = h.alterado_em
                ? new Date(h.alterado_em).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
                : '—';
            return [
                plantaoData,
                h.admin_nome || '—',
                alteradoEm,
                h.n1_anterior || '—',
                h.n2_anterior || '—',
                h.gerente_anterior || '—',
                h.n1_novo || '—',
                h.n2_novo || '—',
                h.gerente_novo || '—',
            ].map(escapeCsv).join(',');
        });

        const monthLabel = new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1)
            .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        const csvContent = '\uFEFF' + [
            `# Histórico de Alterações de Plantão — ${monthLabel}`,
            `# Total de registros: ${historico.length}`,
            headers.map(escapeCsv).join(','),
            ...rows
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historico-plantao-${filterYear}-${String(filterMonth).padStart(2, '0')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast(`Histórico exportado — ${historico.length} registro(s).`, 'success');
    } catch (err) {
        console.error('Erro ao exportar histórico:', err);
        showToast('Erro ao exportar histórico. Tente novamente.', 'error');
    }
};

export const handleImprimir = (filteredPlantoes, filterMonth, filterYear, filterSearch, formatarData, getDiaSemana) => {
    if (!filteredPlantoes.length) {
        alert('Não há plantões no período selecionado para imprimir.');
        return;
    }
    const win = window.open('', '_blank');
    if (!win) {
        alert('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.');
        return;
    }

    const monthLabel = new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1)
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const doc = win.document;
    doc.open();
    doc.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"></head><body></body></html>');
    doc.close();

    const titulo = `Escala de Plantão — ${monthLabel}`;
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

export const handleExportarICal = (filteredPlantoes, filterMonth, filterYear, showToast) => {
    if (!filteredPlantoes.length) {
        showToast('Não há plantões no período selecionado para exportar.', 'error');
        return;
    }

    const pad = (n) => String(n).padStart(2, '0');
    const now = new Date();
    const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

    const esc = (s) => String(s ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,');

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

    const nomes = (raw) => raw ? raw.split('|||').map(n => n.trim()).filter(Boolean).join(', ') : 'Não atribuído';
    const toTime = (raw, fallback) => {
        const m = String(raw ?? '').match(/^(\d{2}):(\d{2})(?::(\d{2}))?/);
        return m ? `${m[1]}${m[2]}${m[3] ?? '00'}` : fallback;
    };

    const monthLabel = `${String(filterMonth).padStart(2, '0')}/${filterYear}`;

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Prestek Telecom//Intranet//PT',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:Escala de Plantão Prestek — ${monthLabel}`,
        'X-WR-TIMEZONE:America/Sao_Paulo',
        'X-WR-CALDESC:Gerado automaticamente pela Intranet Prestek',
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

    filteredPlantoes
        .slice()
        .sort((a, b) => (toIsoDay(a.data) ?? '').localeCompare(toIsoDay(b.data) ?? ''))
        .forEach(p => {
            const iso = toIsoDay(p.data);
            if (!iso) return;
            const [y, mo, d] = iso.split('-');
            const dateStr = `${y}${mo}${d}`;
            const startTime = toTime(p.horario_inicio, '090000');
            const endTime = toTime(p.horario_fim, '170000');
            const uid = `plantao-${iso}-${p.id ?? crypto.randomUUID()}@prestek.intranet`;

            const n1 = nomes(p.n1_nome);
            const n2 = nomes(p.n2_nome);
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
