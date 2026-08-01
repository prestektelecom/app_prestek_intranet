import React from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import HeroSearchInput from '../ui/HeroSearchInput';

// Os KPIs são de CONTRATOS, não dos planos listados abaixo — o rótulo
// "Contratos do mês" deixa isso explícito em vez de sugerir que 385 é a
// quantidade de planos do catálogo.
const KPI_SECUNDARIOS = [
    { key: 'ativo', label: 'Ativo', icon: 'check_circle' },
    { key: 'inativo', label: 'Inativo', icon: 'power_off' },
    { key: 'pre', label: 'Pré-contratos', icon: 'schedule' },
    { key: 'negativado', label: 'Negativados', icon: 'gpp_maybe' },
    { key: 'desistiu', label: 'Desistiu', icon: 'cancel' },
];

export default function ServicesHero({ counts, total, isLoading, busca, onBuscaChange }) {
    const C = useBentoTheme();

    // Zeros não informam nada e roubavam metade da faixa.
    const visiveis = KPI_SECUNDARIOS.filter(k => (counts[k.key] || 0) > 0);
    const semDados = !isLoading && total === 0;

    return (
        <div
            className="relative overflow-hidden rounded-[24px] p-6 sm:p-8 lg:px-9 text-white"
            style={{
                background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accentDark} 50%, ${C.accent} 100%)`,
                boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
            }}
        >
            <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
                <defs>
                    <pattern id="svc-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#svc-grid)" />
            </svg>
            <div aria-hidden="true" style={{ position: 'absolute', top: -120, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div aria-hidden="true" style={{ position: 'absolute', bottom: -100, right: 120, width: 220, height: 220, borderRadius: '50%', background: tone(C.cyan, 0.30), filter: 'blur(30px)', pointerEvents: 'none' }} />

            <div className="relative flex flex-col gap-5">
                <div>
                    <h1 className="m-0 text-[26px] sm:text-[30px] lg:text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white">
                        Diretório de Serviços Internos
                    </h1>
                    <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-white/80">
                        Consulte planos de internet, serviços técnicos e pacotes de streaming.
                    </p>
                </div>

                <HeroSearchInput
                    value={busca}
                    onChange={onBuscaChange}
                    placeholder="Buscar plano, velocidade ou valor..."
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/70">
                            Contratos do mês
                        </div>
                        <div className="text-[32px] font-extrabold leading-none tracking-tight text-white">
                            {isLoading ? '···' : total}
                        </div>
                    </div>

                    {semDados ? (
                        <p className="text-[12.5px] text-white/70">Sem contratos registrados neste mês.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {(isLoading ? KPI_SECUNDARIOS : visiveis).map(kpi => (
                                <div
                                    key={kpi.key}
                                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-white"
                                    style={{
                                        background: 'rgba(255,255,255,0.18)',
                                        backdropFilter: 'blur(6px)',
                                        border: '1px solid rgba(255,255,255,0.25)',
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[16px] leading-none">{kpi.icon}</span>
                                    <span className="text-[15px] font-bold">{isLoading ? '···' : counts[kpi.key]}</span>
                                    <span className="font-mono text-[11.5px] tracking-[0.06em] opacity-80">{kpi.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
