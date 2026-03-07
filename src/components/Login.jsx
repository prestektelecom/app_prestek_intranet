import { useState } from 'react'
import { loginUsuario } from '../services/auth'

// Componente de input com efeito de glow que segue o cursor
const AppInput = ({ label, placeholder, icon, ...rest }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = useState(false)

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    return (
        <div className="w-full min-w-[200px] relative">
            {label && (
                <label className="block mb-2 text-sm text-[#635c55]">
                    {label}
                </label>
            )}
            <div className="relative w-full">
                <input
                    className="peer relative z-10 border-2 border-[#eaddcd] h-13 w-full rounded-md bg-[#f4eee6] px-4 font-thin outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-[#f8f7f5] focus:border-primary/40 placeholder:font-medium placeholder:text-[#a17745]"
                    placeholder={placeholder}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    {...rest}
                />
                {/* Glow superior — segue o cursor */}
                {isHovering && (
                    <>
                        <div
                            className="absolute pointer-events-none top-0 left-0 right-0 h-[2px] z-20 rounded-t-md overflow-hidden"
                            style={{
                                background: `radial-gradient(40px circle at ${mousePosition.x}px 0px, #ff8c00 0%, transparent 70%)`,
                            }}
                        />
                        <div
                            className="absolute pointer-events-none bottom-0 left-0 right-0 h-[2px] z-20 rounded-b-md overflow-hidden"
                            style={{
                                background: `radial-gradient(40px circle at ${mousePosition.x}px 2px, #ff8c00 0%, transparent 70%)`,
                            }}
                        />
                    </>
                )}
                {icon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    )
}

// Componente principal da tela de Login
export default function Login({ onLogin }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = useState(false)
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState('')
    const [carregando, setCarregando] = useState(false)

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErro('')

        // Validação básica
        if (!email.trim()) {
            setErro('Informe seu email.')
            return
        }

        setCarregando(true)

        try {
            const resultado = await loginUsuario(email, senha)

            if (resultado?.erro) {
                // Login falhou — exibe mensagem de erro
                setErro(resultado.erro)
            } else if (resultado) {
                // Login bem-sucedido — o redirect já aconteceu no auth.js
                // Também notifica o App.jsx caso queira atualizar o estado
                if (onLogin) onLogin(resultado)
            }
        } catch (err) {
            setErro('Erro inesperado. Tente novamente.')
        } finally {
            setCarregando(false)
        }
    }

    return (
        <div className="h-screen w-full bg-[#f8f7f5] dark:bg-[#231a0f] flex items-center justify-center p-4 font-display">
            {/* Card principal */}
            <div className="login-card w-[90%] lg:w-[70%] xl:w-[60%] flex rounded-xl overflow-hidden shadow-xl border border-[#eaddcd] dark:border-[#3a2a18]">
                {/* Lado esquerdo — Formulário */}
                <div
                    className="w-full lg:w-1/2 px-6 sm:px-10 lg:px-14 py-8 relative overflow-hidden bg-white dark:bg-[#1d150c]"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {/* Gradient blob que segue o cursor */}
                    <div
                        className={`absolute pointer-events-none w-[450px] h-[450px] rounded-full blur-3xl transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'
                            }`}
                        style={{
                            background: 'radial-gradient(circle, rgba(255,140,0,0.12) 0%, rgba(161,119,69,0.08) 40%, transparent 70%)',
                            transform: `translate(${mousePosition.x - 225}px, ${mousePosition.y - 225}px)`,
                            transition: 'transform 0.15s ease-out, opacity 0.3s ease',
                        }}
                    />

                    {/* Conteúdo do formulário */}
                    <form
                        className="relative z-10 flex flex-col items-center justify-center h-full gap-5"
                        onSubmit={handleSubmit}
                    >
                        {/* Logo / Título */}
                        <div className="text-center mb-2">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1d150c] dark:text-[#f8f7f5] tracking-tight">
                                Entrar
                            </h1>
                            <p className="text-sm text-[#635c55] dark:text-[#a17745] mt-2">
                                Acesse o portal interno da Prestek
                            </p>
                        </div>

                        {/* Mensagem de erro */}
                        {erro && (
                            <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2 animate-[fadeIn_0.2s_ease]">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{erro}</span>
                            </div>
                        )}

                        {/* Campos de input */}
                        <div className="w-full grid gap-4">
                            <AppInput
                                placeholder="Email"
                                type="email"
                                id="login-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={carregando}
                            />
                            <AppInput
                                placeholder="Senha"
                                type="password"
                                id="login-senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                disabled={carregando}
                            />
                        </div>

                        {/* Botão de login */}
                        <button
                            type="submit"
                            disabled={carregando}
                            className={`login-btn group relative inline-flex justify-center items-center overflow-hidden rounded-lg bg-primary px-8 py-3 font-bold text-white transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/40 cursor-pointer w-full max-w-[280px] ${carregando ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {carregando ? (
                                <span className="relative z-10 text-sm tracking-wide uppercase flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Entrando...
                                </span>
                            ) : (
                                <>
                                    <span className="relative z-10 text-sm tracking-wide uppercase">
                                        Entrar
                                    </span>
                                    {/* Efeito shine no hover */}
                                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-13deg)_translateX(100%)]">
                                        <div className="relative h-full w-10 bg-white/25" />
                                    </div>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Lado direito — Imagem decorativa (oculta em mobile/tablet) */}
                <div className="hidden lg:block w-1/2 relative overflow-hidden">
                    <img
                        src="https://images.pexels.com/photos/7102037/pexels-photo-7102037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                        alt="Imagem decorativa do login"
                        className="w-full h-full object-cover login-image"
                        loading="eager"
                    />
                    {/* Overlay com gradiente âmbar para unificar com a marca */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ff8c00]/30 via-[#231a0f]/40 to-[#1d150c]/60" />
                    {/* Texto sobreposto na imagem */}
                    <div className="absolute bottom-8 left-8 right-8 z-10">
                        <h2 className="text-white text-2xl font-extrabold tracking-tight leading-tight">
                            Portal Interno
                        </h2>
                        <p className="text-white/70 text-sm mt-2 font-light">
                            Conecte-se ao seu espaço de trabalho
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
