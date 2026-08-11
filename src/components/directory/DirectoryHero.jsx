import React from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import { fundoHero } from '../ui/heroGradiente';
import HeroSearchInput from '../ui/HeroSearchInput';

// Mesmo piso de opacidade do TiHero, CoverageHero e ServicesHero: sobre o
// painel bg-black/60, /75 dá 4,9:1 e /70 dá 4,5:1. Abaixo disso reprova em AA.
const LABEL_MONO = 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75';

// <div> agrupando <dt>/<dd> é válido dentro de <dl> em HTML5, e é o que o
// CoverageHero já faz. Par rótulo/valor é lista de descrição, não parágrafo.
function KpiTile({ label, valor, sub }) {
    return (
        <div className="min-w-0">
            <dt className={LABEL_MONO}>{label}</dt>
            <dd className="m-0 mt-1 truncate text-[17px] font-extrabold leading-none tracking-tight text-white tabular-nums">
                {valor}
            </dd>
            {sub ? <dd className="m-0 mt-1 truncate font-mono text-[11px] text-white/70">{sub}</dd> : null}
        </div>
    );
}

// Mantém <dt>/<dd> mesmo vazios: <div> solto dentro de <dl> só é válido quando
// agrupa um par, e trocar a estrutura entre carregando e carregado mudaria o
// papel do nó no meio do ciclo de vida.
function KpiEsqueleto() {
    return (
        <div className="min-w-0" aria-hidden="true">
            <dt className="h-2 w-2/3 animate-pulse rounded bg-white/10" />
            {/* h-[17px] casa a caixa exata do valor final, para o painel não
                saltar quando os números chegam. */}
            <dd className="m-0 mt-1 h-[17px] w-1/2 animate-pulse rounded bg-white/10" />
        </div>
    );
}

/**
 * Hero da aba Colaboradores.
 *
 * Reconstruído sobre os primitivos compartilhados. A versão anterior era
 * artesanal e reintroduzia três bugs que os utilitários já resolvem:
 *
 * 1. A rampa usava `C.accentDark` como parada do meio. Esse token vale #C2410C
 *    no tema claro mas #FDBA74 nos três escuros — ou seja, invertia
 *    (escuro → CLARO → médio) e jogava uma faixa pêssego bem embaixo do
 *    subtítulo e da busca, com o branco caindo para 1,71:1. `fundoHero` fixa a
 *    parada em #C2410C, que fica entre accentDeep e accent nas quatro paletas.
 * 2. O input tinha `outline: 'none'` e sinalizava foco só pela borda, a 2,19:1
 *    — abaixo dos 3:1 que a WCAG 1.4.11 exige de indicador não-textual.
 *    `HeroSearchInput` usa outline branco sólido (5,18:1).
 * 3. As KPIs ficavam em pílulas `rgba(255,255,255,0.18)`, que CLAREIAM o fundo
 *    sob texto branco — as legendas caíam para ~2,3:1. O painel bg-black/60
 *    das telas irmãs escurece, e é por isso que ele existe.
 *
 * Também saíram: os dois blur orbs (o segundo pintava `C.cyan`, que vale
 * #FDBA74 nos quatro temas — pêssego sobre laranja, uma camada de 220px
 * composta permanentemente para renderizar nada), a grade quadrada de 40px
 * (as irmãs usam retícula de pontos), o emoji no <h1> (o leitor de tela
 * anunciava "bustos em silhueta Colaboradores") e um `maxWidth: 1440` morto
 * dentro de um container que já era 1200.
 */
export default function DirectoryHero({ busca, setBusca, kpis = [], isLoading = false }) {
    const C = useBentoTheme();

    return (
        <div
            className="relative shrink-0 overflow-hidden rounded-[24px] p-6 text-white sm:p-8"
            style={{
                background: fundoHero(C),
                boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
            }}
        >
            <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.22, pointerEvents: 'none' }}>
                <defs>
                    <pattern id="dir-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="white" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dir-grid)" />
            </svg>

            {/* Split em 2xl e não em lg, pelo mesmo motivo do TiHero: os
                breakpoints medem a viewport, mas aqui dentro sobra ~330px a
                menos (sidebar de 248px + px-10 do main). */}
            <div className="relative grid grid-cols-1 gap-6 2xl:grid-cols-12 2xl:items-center 2xl:gap-8">
                <div className="flex flex-col gap-4 2xl:col-span-6">
                    <div>
                        <div className={LABEL_MONO}>Equipe Prestek</div>
                        <h1 className="m-0 mt-1.5 text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-[30px] lg:text-[34px]">
                            Colaboradores
                        </h1>
                        {/* Substantivos concretos, como nas telas irmãs. O texto
                            anterior ("Conecte-se com sua equipe — busque,
                            encontre e contate...") eram três verbos sinônimos. */}
                        <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                            Ramais, e-mails e departamentos de toda a equipe.
                        </p>
                    </div>

                    <form role="search" onSubmit={e => e.preventDefault()}>
                        <HeroSearchInput
                            value={busca}
                            onChange={setBusca}
                            placeholder="Buscar por nome, ramal ou e-mail..."
                        />
                    </form>
                </div>

                <div className="rounded-2xl border border-white/15 bg-black/60 p-4 2xl:col-span-6">
                    <div className="flex items-center gap-2 border-b border-white/[0.15] pb-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" aria-hidden="true" />
                        <span className={LABEL_MONO}>Quadro</span>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {isLoading
                            ? Array.from({ length: 3 }, (_, i) => <KpiEsqueleto key={i} />)
                            : kpis.map(k => <KpiTile key={k.label} {...k} />)}
                    </dl>
                </div>
            </div>
        </div>
    );
}
