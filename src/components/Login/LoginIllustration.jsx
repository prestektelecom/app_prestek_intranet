import React, { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import { PrestekMark } from './Icons'

function Brand({ size = 26 }) {
    return (
        <div className="flex items-center gap-3 select-none">
            <PrestekMark size={size} />
            <div className="flex flex-col leading-none">
                <span className="font-sans font-extrabold text-[22px] tracking-tight text-[#1C2B3A]">
                    Prestek Intranet
                </span>
                <span className="font-mono font-medium text-[9px] tracking-widest text-[#9AA5B4] mt-1 uppercase">
                    PORTAL INTERNO
                </span>
            </div>
        </div>
    )
}

export default function LoginIllustration() {
    const [animationData, setAnimationData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Carrega o arquivo Lottie de 26MB dinamicamente para não bloquear o formulário de login
        import('../../image/icons/2997674.json')
            .then((module) => {
                setAnimationData(module.default)
                setLoading(false)
            })
            .catch((err) => {
                console.error('Falha ao carregar animação Lottie:', err)
                setLoading(false)
            })
    }, [])

    return (
        <div className="p-11 flex flex-col justify-between relative overflow-hidden min-h-[600px]">
            {/* Dotted pattern overlay */}
            <svg className="absolute inset-0 opacity-45 pointer-events-none" width="100%" height="100%">
                <defs>
                    <pattern id="dots-panel" width="28" height="28" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.1" fill="#EC7D23" opacity="0.3" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots-panel)" />
            </svg>

            {/* Glowing blur background blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#EC7D23]/10 blur-[90px] rounded-full pointer-events-none"></div>

            {/* Top Row: Brand & Status Pill */}
            <div className="relative z-10 flex items-center justify-between gap-4">
                <Brand />
                
                {/* 
                <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-[#C2410C] shadow-[0_4px_12px_rgba(236,125,35,0.08)] border border-[#FFF7ED]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F8A5B] animate-pulse" />
                    Sistemas operacionais
                </div>
                */}
            </div>

            {/* Middle Row: Lottie Animation Container */}
            <div className="relative z-10 flex-1 flex items-center justify-center min-h-[320px] max-w-[400px] mx-auto w-full">
                {loading ? (
                    // Premium Skeleton Loader
                    <div className="w-full aspect-square flex flex-col items-center justify-center gap-4">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-[#EC7D23]/10 border-t-[#EC7D23] animate-spin"></div>
                            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg">
                                <PrestekMark size={40} />
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-[#9AA5B4] animate-pulse">Carregando painel 3D...</span>
                    </div>
                ) : (
                    animationData && (
                        <div className="w-full h-full flex items-center justify-center scale-110">
                            <Lottie 
                                animationData={animationData} 
                                loop={true} 
                                style={{ width: '100%', height: '100%', maxWidth: '380px', maxHeight: '380px' }} 
                            />
                        </div>
                    )
                )}
            </div>

            {/* Bottom Row: Tagline & Stats */}
            <div className="relative z-10 mt-auto">
                <h2 className="text-[22px] font-bold text-[#1C2B3A] tracking-tight leading-tight">
                    Uma plataforma para cada fluxo de trabalho.
                </h2>
                <p className="text-[13.5px] text-[#475467] mt-2 mb-6 leading-relaxed">
                    Monitore seus chamados, analise o desempenho da equipe e gerencie tudo a partir de um único painel integrado.
                </p>

                {/* 
                <div className="flex gap-8 border-t border-[#EC7D23]/10 pt-5">
                    <div>
                        <div className="text-xl font-bold text-[#1C2B3A]">99.99%</div>
                        <div className="font-mono text-[9px] tracking-wider text-[#9AA5B4] uppercase mt-0.5">Uptime SLA</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-[#1C2B3A]">100%</div>
                        <div className="font-mono text-[9px] tracking-wider text-[#9AA5B4] uppercase mt-0.5">Integração IXC</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-[#1C2B3A]">24/7</div>
                        <div className="font-mono text-[9px] tracking-wider text-[#9AA5B4] uppercase mt-0.5">Suporte NOC</div>
                    </div>
                </div>
                */}
            </div>
        </div>
    )
}
