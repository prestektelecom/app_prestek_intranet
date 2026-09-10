import { useEffect, useRef } from 'react'
import { useBentoTheme } from '../hooks/useBentoTheme'

// Duas situações, duas verdades:
// - `nao-encontrado`: a view não existe (ou a sessão caiu).
// - `sem-permissao`: a view existe, mas é de admin/TI. Antes esta tela dizia
//   "em fase de construção" para quem não tinha permissão, o que era mentira.
// A ilustração do 404 é SVG com tokens: o Lottie anterior era preto fixo e
// sumia sobre o card escuro.

function ArrowLeftIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" className="group-hover:-translate-x-0.5 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

// "404" em que o zero é o sinal: anéis concêntricos no accent, o mesmo gesto
// dos heroes. Tinta e accent vêm do tema.
function Ilustracao404({ C }) {
    return (
        <svg viewBox="0 0 260 120" width="100%" height="100%" aria-hidden="true" style={{ display: 'block', fontFamily: 'Manrope, "Plus Jakarta Sans", sans-serif' }}>
            <text x="58" y="94" textAnchor="middle" fontSize="88" fontWeight="800" letterSpacing="-0.04em" fill={C.ink}>4</text>
            <g transform="translate(130 60)">
                <circle r="44" fill="none" stroke={C.accent} strokeWidth="2" opacity="0.35" />
                <circle r="30" fill="none" stroke={C.accent} strokeWidth="2.5" opacity="0.6" />
                <circle r="16" fill="none" stroke={C.accent} strokeWidth="3" />
                <circle r="5" fill={C.accent} />
            </g>
            <text x="202" y="94" textAnchor="middle" fontSize="88" fontWeight="800" letterSpacing="-0.04em" fill={C.ink}>4</text>
        </svg>
    )
}

const COPY = {
    'nao-encontrado': {
        titulo: 'Esta página não existe',
        texto: 'O endereço pode ter mudado ou a área ainda não foi publicada. Volte para o Início e siga pelo menu.',
    },
    'sem-permissao': {
        titulo: 'Você não tem acesso a esta área',
        texto: 'Esta área é restrita à equipe de TI e aos administradores. Se você precisa dela para o seu trabalho, fale com a TI.',
    },
}

const NotFound = ({ setCurrentView, user, variant = 'nao-encontrado' }) => {
    const C = useBentoTheme()
    const copy = COPY[variant] ?? COPY['nao-encontrado']
    const tituloRef = useRef(null)

    // O foco entra no título: o leitor de tela anuncia a situação e o próximo
    // Tab já é o botão de voltar.
    useEffect(() => { tituloRef.current?.focus({ preventScroll: true }) }, [variant])

    const handleBack = () => setCurrentView(user ? 'dashboard' : 'login')

    return (
        <div
            className="min-h-full w-full relative overflow-hidden flex flex-col items-center justify-center px-4 py-8"
            style={{ background: C.bg, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
        >
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" aria-hidden="true" style={{ opacity: 0.25 }}>
                <defs>
                    <pattern id="dots-bg" width="32" height="32" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.1" fill={C.accent} opacity="0.25" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots-bg)" />
            </svg>

            <div
                className="relative z-10 w-full max-w-[580px] rounded-[24px] p-8 md:p-12 flex flex-col items-center text-center"
                style={{ background: C.surface, border: `1px solid ${C.line}`, boxShadow: 'var(--shadow-sm)' }}
            >
                <div className="flex items-center gap-2.5 mb-8 select-none" aria-hidden="true">
                    <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: C.ink }}>Prestek</span>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: C.accent, display: 'block' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.ink2 }}>Intranet</span>
                </div>

                {variant === 'sem-permissao' ? (
                    <div className="flex items-center justify-center mb-8" aria-hidden="true"
                        style={{ width: 96, height: 96, borderRadius: '50%', background: C.accentSoft, color: C.accentDark }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="10" width="16" height="11" rx="2.5" />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
                        </svg>
                    </div>
                ) : (
                    <div className="w-full max-w-[260px] mb-6" aria-hidden="true">
                        <Ilustracao404 C={C} />
                    </div>
                )}

                <div className="space-y-3 mb-9">
                    <h1
                        ref={tituloRef}
                        tabIndex={-1}
                        className="font-display text-3xl font-extrabold tracking-tight leading-tight"
                        // Título com tabIndex=-1 recebe o foco programático para o leitor
                        // de tela; não é um controle, então não desenha anel.
                        style={{ color: C.ink, outline: 'none' }}
                    >
                        {copy.titulo}
                    </h1>
                    <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: C.ink2 }}>
                        {copy.texto}
                    </p>
                </div>

                {/* Texto de 14px sobre laranja: `onAccent` (navy no claro), não
                    branco (2,8:1). O hover eleva em vez de escurecer o fundo,
                    porque navy sobre o laranja-hover cairia para 3:1. */}
                <button
                    type="button"
                    onClick={handleBack}
                    className="group w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 font-bold text-sm rounded-xl transition-shadow"
                    style={{ background: C.accent, color: C.onAccent, boxShadow: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                >
                    <ArrowLeftIcon />
                    <span>{user ? 'Voltar para o Início' : 'Voltar para o login'}</span>
                </button>
            </div>
        </div>
    )
}

export default NotFound
