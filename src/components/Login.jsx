import { useLogin } from '../hooks/useLogin'
import LoginIllustration from './Login/LoginIllustration'
import LoginForm from './Login/LoginForm'
import { ArrowIcon } from './Login/Icons'

export default function Login({ onLogin, setCurrentView }) {
    const loginProps = useLogin(onLogin)

    return (
        <div className="min-h-screen w-full relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#FFF7ED] via-[#F0F8FF] to-[#FAFCFF] font-sans selection:bg-[#EC7D23]/20">
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

            {/* Header / Top Bar */}
            <header className="relative z-10 flex justify-between items-center px-6 md:px-12 py-7 select-none">
                <div className="flex items-center gap-2">
                    <span className="font-sans font-extrabold text-xl tracking-tight text-[#1C2B3A]">
                        Prestek
                    </span>
                </div>
                <div className="flex gap-7 text-[13.5px] text-[#475467] font-medium items-center">
                    <button 
                        onClick={() => setCurrentView('status')} 
                        className="hover:text-[#C2410C] transition-colors text-[13.5px] text-[#475467] font-medium"
                    >
                        Status
                    </button>
                    <button 
                        onClick={() => setCurrentView('docs')} 
                        className="hover:text-[#C2410C] transition-colors text-[13.5px] text-[#475467] font-medium"
                    >
                        Docs
                    </button>
                    <a 
                        href="https://prestek.com.br" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[#C2410C] font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-1"
                    >
                        Suporte <ArrowIcon />
                    </a>
                </div>
            </header>

            {/* Centered Dual Card */}
            <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8 md:py-16">
                <div
                    className="w-full max-w-[980px] grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-[#FFF7ED] via-[#F0F8FF] to-[rgba(236,125,35,0.05)] rounded-3xl overflow-hidden shadow-[0_50px_100px_-30px_rgba(236,125,35,0.22),_0_0_0_1px_rgba(255,255,255,0.8)] border border-[#FFF7ED] transition-all duration-300"
                >
                    {/* Painel Esquerdo: Ilustração */}
                    <div className="hidden lg:block h-full">
                        <LoginIllustration />
                    </div>

                    {/* Painel Direito: Formulário */}
                    <div className="h-full bg-white rounded-none lg:rounded-tl-[80px] shadow-[-8px_0_32px_rgba(236,125,35,0.08)]">
                        <LoginForm {...loginProps} />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center py-6 text-[12px] text-[#9AA5B4] font-mono tracking-wider">
                © {new Date().getFullYear()} Prestek Inc. · Todos os direitos reservados
            </footer>
        </div>
    )
}

