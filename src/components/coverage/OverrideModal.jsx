import React, { useEffect, useRef, useState } from 'react';
import MapaPicker from './MapaPicker';
import { tone } from '../../utils/tone';
import { TECNOLOGIAS, STATUS_OPCOES, VELOCIDADES, STATUS_META, TECH_META } from './constants';

const CAMPO =
    'w-full rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';

const ROTULO = 'mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted';

// Tecnologia e status têm 3 opções cada: um <select> cobra dois toques para
// escolher entre três, e esconde a cor que o mapa vai usar. Segmentado mostra
// as três de uma vez, com a cor que o marcador terá.
function Segmentado({ opcoes, valor, onChange, metaPorValor }) {
    return (
        <div className="inline-flex w-full items-center gap-1 rounded-xl bg-surface-raised p-1">
            {opcoes.map(op => {
                const ativo = valor === op;
                const meta = metaPorValor[op];
                return (
                    <button
                        key={op}
                        type="button"
                        onClick={() => onChange(op)}
                        aria-pressed={ativo}
                        className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-[12px] font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        style={ativo
                            ? { background: tone(meta.cor, 0.14), color: meta.cor, boxShadow: `inset 0 0 0 1px ${tone(meta.cor, 0.5)}` }
                            : { color: 'var(--foreground-muted)' }}
                    >
                        <span className="material-symbols-outlined text-[15px] leading-none">{meta.icon}</span>
                        {op}
                    </button>
                );
            })}
        </div>
    );
}

export default function OverrideModal({ registro, onFechar, onSalvar }) {
    const [form, setForm] = useState({
        tecnologia: registro.tecnologia || 'FTTH',
        velocidade_maxima: registro.velocidade_maxima || '100 MEGA',
        status: registro.status || 'Ativo',
        percentual_cobertura: registro.percentual_cobertura ?? 100,
        latitude: registro.latitude ?? '',
        longitude: registro.longitude ?? '',
    });
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [mapaAberto, setMapaAberto] = useState(!!(registro.latitude && registro.longitude));
    const dialogRef = useRef(null);

    // Esc fecha: antes só o X e o Cancelar fechavam, o que reprova em
    // "navegação por teclado" da WCAG 2.1 AA para diálogos.
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onFechar(); };
        document.addEventListener('keydown', onKey);
        dialogRef.current?.focus();
        return () => document.removeEventListener('keydown', onKey);
    }, [onFechar]);

    const handleChange = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

    // Locale pt-BR digita decimal com vírgula; o parseFloat só aceita ponto.
    const handleCoordChange = (campo, valor) =>
        setForm(f => ({ ...f, [campo]: String(valor).replace(',', '.') }));

    const latNum = parseFloat(String(form.latitude).replace(',', '.'));
    const lngNum = parseFloat(String(form.longitude).replace(',', '.'));
    const coordsValidas = !isNaN(latNum) && !isNaN(lngNum);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSalvando(true);
        setErro('');
        try {
            const resp = await fetch('/api/cobertura-ixc/override', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cidade_ixc_id: registro.cidade_ixc_id,
                    cidade: registro.cidade,
                    estado: registro.estado,
                    bairro: registro.bairro,
                    tecnologia: form.tecnologia,
                    velocidade_maxima: form.velocidade_maxima,
                    status: form.status,
                    percentual_cobertura: parseInt(form.percentual_cobertura),
                    latitude: form.latitude !== '' ? parseFloat(String(form.latitude).replace(',', '.')) : null,
                    longitude: form.longitude !== '' ? parseFloat(String(form.longitude).replace(',', '.')) : null,
                }),
            });
            const dados = await resp.json();
            if (!dados.sucesso) throw new Error(dados.erro || 'Erro desconhecido');
            onSalvar();
        } catch (e) {
            setErro(e.message);
        } finally {
            setSalvando(false);
        }
    };

    return (
        // z-[1100] fica acima de Header e Sidebar (ambos z-1000).
        <div
            className="fixed inset-0 z-[1100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onFechar(); }}
        >
            <div
                ref={dialogRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={`Configurar cobertura de ${registro.bairro || registro.cidade}`}
                className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl duration-200 animate-in fade-in zoom-in focus:outline-none"
            >
                <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
                    <div className="min-w-0">
                        <h3 className="text-[15px] font-bold text-foreground">Configurar cobertura</h3>
                        <p className="mt-0.5 truncate text-[12px] text-muted">
                            {registro.cidade} — {registro.bairro}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onFechar}
                        aria-label="Fechar"
                        className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-[var(--accent)]"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-4">
                    <div className="flex items-start gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5">
                        <span className="material-symbols-outlined mt-px text-[18px] text-[var(--accent)]">info</span>
                        <div className="min-w-0 text-[12px] leading-relaxed">
                            <p className="text-muted">Cidade e bairro vêm do IXC e não são editáveis aqui.</p>
                            <p className="font-semibold text-foreground">
                                {registro.total_contratos} contrato(s) ativo(s) neste bairro
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={ROTULO}>Tecnologia</label>
                            <Segmentado
                                opcoes={TECNOLOGIAS}
                                valor={form.tecnologia}
                                onChange={v => handleChange('tecnologia', v)}
                                metaPorValor={TECH_META}
                            />
                        </div>

                        <div>
                            <label className={ROTULO} htmlFor="ov-velocidade">Velocidade máxima</label>
                            <select
                                id="ov-velocidade"
                                className={CAMPO}
                                value={form.velocidade_maxima}
                                onChange={e => handleChange('velocidade_maxima', e.target.value)}
                            >
                                {VELOCIDADES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className={ROTULO}>Status da rede</label>
                            <Segmentado
                                opcoes={STATUS_OPCOES}
                                valor={form.status}
                                onChange={v => handleChange('status', v)}
                                metaPorValor={STATUS_META}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className={ROTULO} htmlFor="ov-percentual">
                                Percentual de cobertura
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    id="ov-percentual"
                                    type="range" min={0} max={100} step={1}
                                    className="h-1.5 flex-1 cursor-pointer accent-[var(--accent)]"
                                    value={form.percentual_cobertura}
                                    onChange={e => handleChange('percentual_cobertura', e.target.value)}
                                />
                                {/* Campo numérico ao lado do range: SC 2.5.7 exige
                                    alternativa sem arrasto para qualquer slider. */}
                                <input
                                    type="number" min={0} max={100} step={1}
                                    aria-label="Percentual de cobertura em número"
                                    className="w-20 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-right font-mono text-[13px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                    value={form.percentual_cobertura}
                                    onChange={e => {
                                        const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                                        handleChange('percentual_cobertura', v);
                                    }}
                                />
                                <span className="text-[13px] font-bold text-muted">%</span>
                            </div>
                        </div>
                    </div>

                    {/* ─── Localização ─── */}
                    <div className="border-t border-border pt-3.5">
                        <button
                            type="button"
                            onClick={() => setMapaAberto(v => !v)}
                            aria-expanded={mapaAberto}
                            className="mb-2.5 inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-bold text-[var(--accent)] transition-opacity hover:opacity-80"
                        >
                            <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                            Localização do bairro
                            <span className="material-symbols-outlined text-[16px]">
                                {mapaAberto ? 'expand_less' : 'expand_more'}
                            </span>
                            {/* Verde validado contra as duas superfícies (clara e
                                escura); não existe token --success no tema. */}
                            {coordsValidas && (
                                <span
                                    className="ml-1 inline-flex items-center gap-0.5 text-[11.5px] font-semibold"
                                    style={{ color: STATUS_META['Ativo'].cor }}
                                >
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                    definida
                                </span>
                            )}
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={ROTULO} htmlFor="ov-lat">Latitude</label>
                                <input
                                    id="ov-lat" type="text" inputMode="decimal" placeholder="-9.9170800"
                                    className={`${CAMPO} font-mono`}
                                    value={form.latitude}
                                    onChange={e => handleCoordChange('latitude', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={ROTULO} htmlFor="ov-lng">Longitude</label>
                                <input
                                    id="ov-lng" type="text" inputMode="decimal" placeholder="-36.5560000"
                                    className={`${CAMPO} font-mono`}
                                    value={form.longitude}
                                    onChange={e => handleCoordChange('longitude', e.target.value)}
                                />
                            </div>
                        </div>

                        {mapaAberto && (
                            <div className="mt-3 overflow-hidden rounded-xl border border-border">
                                <p className="flex items-center gap-1.5 border-b border-border bg-background px-3 py-2 text-[11.5px] text-muted">
                                    <span className="material-symbols-outlined text-[15px]">touch_app</span>
                                    Clique no mapa para definir a posição exata do bairro
                                </p>
                                <MapaPicker
                                    lat={coordsValidas ? latNum : null}
                                    lng={coordsValidas ? lngNum : null}
                                    onChange={(la, ln) => setForm(f => ({ ...f, latitude: la, longitude: ln }))}
                                />
                            </div>
                        )}
                    </div>

                    {erro && (
                        <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-[12.5px] font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                            <span className="material-symbols-outlined text-[16px]">error</span>
                            {erro}
                        </p>
                    )}

                    <div className="-mx-5 -mb-4 flex justify-end gap-3 border-t border-border bg-background px-5 py-4">
                        <button
                            type="button"
                            onClick={onFechar}
                            className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px] font-semibold text-muted transition-all hover:bg-surface-raised active:scale-[0.98]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={salvando}
                            className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#9A3412] to-[#EC7D23] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(236,125,35,0.25)] transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] active:scale-[0.98] disabled:opacity-60"
                        >
                            {salvando && <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>}
                            {salvando ? 'Salvando...' : 'Salvar configuração'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
