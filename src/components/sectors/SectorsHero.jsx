import React from 'react';
import { HeroShell, HeroKpiTile, HeroKpiSkeleton, HERO_LABEL_MONO } from '../ui/HeroShell';

/**
 * Hero da aba Setores, sobre os primitivos compartilhados (fundoHero).
 *
 * A versão anterior reintroduzia os mesmos bugs que o DirectoryHero documenta:
 * `C.accentDark` como parada do meio (pêssego nos temas escuros, 1,71:1 sob o
 * branco), orb pintando `C.cyan`, KPIs em pílulas rgba(255,255,255,0.18) que
 * clareiam o fundo sob texto branco, e um emoji no <h1> que o leitor de tela
 * anunciava antes do título.
 */
export default function SectorsHero({ kpis = [], isLoading = false }) {
    return (
        // id próprio: `dir-grid` já existe no DOM ao navegar entre abas.
        <HeroShell patternId="sec-dots">
            {/* Split em 2xl e não em lg: os breakpoints medem a viewport, mas
                aqui dentro sobra ~330px a menos (sidebar 248px + px-10). */}
            <div className="relative grid grid-cols-1 gap-6 2xl:grid-cols-12 2xl:items-center 2xl:gap-8">
                <div className="2xl:col-span-6">
                    <div className={HERO_LABEL_MONO}>Estrutura Organizacional</div>
                    <h1 className="m-0 mt-1.5 font-display text-3xl font-extrabold tracking-tight leading-[1.1] text-white">
                        Setores e Departamentos
                    </h1>
                    {/* Substantivos concretos: o texto anterior prometia
                        "contatos principais" que a página não tinha como seção. */}
                    <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                        Organograma, responsáveis e ramais de cada setor da Prestek.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-black/60 p-4 2xl:col-span-6">
                    <div className="flex items-center gap-2 border-b border-white/[0.15] pb-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" aria-hidden="true" />
                        <span className={HERO_LABEL_MONO}>Estrutura</span>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {isLoading
                            ? Array.from({ length: 3 }, (_, i) => <HeroKpiSkeleton key={i} />)
                            : kpis.map(k => <HeroKpiTile key={k.label} {...k} />)}
                    </dl>
                </div>
            </div>
        </HeroShell>
    );
}
