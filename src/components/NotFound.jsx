import React, { useState, useEffect } from 'react'
import Lottie from 'lottie-react'

// Ícone de seta elegante para o botão de retorno
function ArrowLeftIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="group-hover:-translate-x-0.5 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

const NotFound = ({ setCurrentView, user }) => {
    const [animationData, setAnimationData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Carrega o arquivo Lottie do 404 local de forma assíncrona
        import('../../lottieflow-404-12-4-000000-easey.json')
            .then((module) => {
                setAnimationData(module.default)
                setLoading(false)
            })
            .catch((err) => {
                console.error('Falha ao carregar animação Lottie 404:', err)
                setLoading(false)
            })
    }, [])

    const handleBack = () => {
        setCurrentView(user ? 'dashboard' : 'login')
    }

    return (
        <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF7ED] via-[#F0F8FF] to-[#FAFCFF] font-sans selection:bg-[#EC7D23]/20 px-4 py-8">
            {/* Dotted backdrop */}
            <svg className="absolute inset-0 opacity-[0.25] pointer-events-none" width="100%" height="100%">
                <defs>
                    <pattern id="dots-bg" width="32" height="32" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.1" fill="#EC7D23" opacity="0.25" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots-bg)" />
            </svg>

            {/* Soft Ambient Blobs */}
            <div className="absolute -top-40 -left-28 w-[460px] h-[460px] rounded-full bg-[#EC7D23]/15 filter blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-24 w-[420px] h-[420px] rounded-full bg-[#EC7D23]/10 filter blur-[80px] pointer-events-none" />

            {/* Premium Glassmorphic Card */}
            <div className="relative z-10 w-full max-w-[580px] bg-white/75 backdrop-blur-md rounded-[32px] p-8 md:p-12 shadow-[0_50px_100px_-30px_rgba(236,125,35,0.22),_0_0_0_1px_rgba(255,255,255,0.8)] border border-[#FFF7ED] flex flex-col items-center text-center">
                
                {/* Brand Logo */}
                <div className="flex items-center gap-2.5 mb-8 select-none">
                    <span className="font-sans font-extrabold text-2xl tracking-tight text-[#1C2B3A]">
                        Prestek
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#EC7D23]" />
                    <span className="font-mono font-bold text-[10px] tracking-widest text-[#9AA5B4] uppercase mt-0.5">
                        SISTEMAS
                    </span>
                </div>

                {/* Animated Lottie Container */}
                <div className="w-full max-w-[280px] aspect-square flex items-center justify-center mb-6">
                    {loading ? (
                        <div className="w-16 h-16 rounded-full border-4 border-[#EC7D23]/10 border-t-[#EC7D23] animate-spin" />
                    ) : (
                        animationData && (
                            <Lottie 
                                animationData={animationData} 
                                loop={true} 
                                style={{ width: '100%', height: '100%' }} 
                            />
                        )
                    )}
                </div>

                {/* Text Content */}
                <div className="space-y-3.5 mb-9">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C2B3A] tracking-tight leading-tight">
                        Estamos Trabalhando Aqui
                    </h1>
                    <p className="text-[14.5px] text-[#475467] leading-relaxed max-w-md mx-auto">
                        Esta área ou serviço está passando por atualizações importantes ou ainda está em fase de construção por nossa equipe técnica.
                    </p>
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleBack}
                    className="group w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#EC7D23] hover:bg-[#C2410C] text-white font-bold text-[14.5px] rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-[0_12px_24px_rgba(236,125,35,0.25)] hover:shadow-[0_16px_32px_rgba(236,125,35,0.35)]"
                >
                    <ArrowLeftIcon />
                    <span>
                        {user ? 'Voltar para a Dashboard' : 'Voltar para o Login'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default NotFound;
