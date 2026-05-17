import { useState } from 'react'
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, ArrowIcon, ShieldIcon } from './Icons'

function Field({ label, icon, type = 'text', placeholder, value, onChange, trailing, disabled }) {
    const [focused, setFocused] = useState(false)
    return (
        <div>
            <label className="block text-[13px] font-semibold text-[#1C2B3A] mb-2">{label}</label>
            <div
                className="flex items-center gap-3 h-[50px] px-3.5 rounded-xl transition-all duration-150"
                style={{
                    background: focused ? 'white' : '#F7FAFD',
                    border: `1.5px solid ${focused ? '#4A9EF5' : '#E4ECF5'}`,
                    boxShadow: focused ? '0 0 0 4px rgba(74,158,245,0.12)' : 'none',
                }}
            >
                <span className="flex shrink-0 transition-colors" style={{ color: focused ? '#4A9EF5' : '#9AA5B4' }}>
                    {icon}
                </span>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    disabled={disabled}
                    className="flex-1 border-none outline-none bg-transparent text-[15px] text-[#1C2B3A] placeholder:text-[#9AA5B4] disabled:opacity-60"
                />
                {trailing && <span className="cursor-pointer flex shrink-0">{trailing}</span>}
            </div>
        </div>
    )
}

export default function LoginForm({
    email, setEmail,
    senha, setSenha,
    erro, carregando,
    mostrarSenha, setMostrarSenha,
    lembrar, setLembrar,
    credValida, handleSubmit
}) {
    return (
        <div className="flex flex-col justify-center p-14 bg-white min-h-[600px]">
            <h1 className="text-[30px] font-bold text-[#1C2B3A] m-0 tracking-tight leading-tight">
                Bem-vindo à Prestek Inc.
            </h1>
            <div className="w-12 h-[3px] bg-[#4A9EF5] rounded mt-3.5" />
            <p className="text-[14.5px] text-[#475467] mt-4 mb-8 leading-relaxed">
                Insira suas credenciais para acessar o sistema.
            </p>

            {erro && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{erro}</span>
                </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Field
                    label="E-mail ou Usuário"
                    icon={<UserIcon />}
                    placeholder="Seu usuário IXC"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={carregando}
                />
                <Field
                    label="Senha"
                    icon={<LockIcon />}
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={carregando}
                    trailing={
                        <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            className="p-0.5 hover:opacity-70 transition-opacity"
                        >
                            {mostrarSenha ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    }
                />

                <div className="flex items-center justify-between mt-1">
                    <label
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                        onClick={(e) => { e.preventDefault(); setLembrar((v) => !v) }}
                    >
                        <span
                            className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-all shrink-0"
                            style={{
                                background: (lembrar || credValida) ? '#4A9EF5' : 'transparent',
                                border: `1.5px solid ${(lembrar || credValida) ? '#4A9EF5' : '#9AA5B4'}`,
                            }}
                        >
                            {(lembrar || credValida) && (
                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6.5 5 9.5 10 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </span>
                        <span className="text-[13.5px] text-[#475467]">Lembrar senha</span>
                    </label>
                    <a href="#" className="text-[13.5px] text-[#4A9EF5] font-semibold no-underline hover:opacity-80 transition-opacity">
                        Problemas ao acessar?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={carregando}
                    className="mt-4 w-full h-[52px] border-none rounded-xl cursor-pointer text-white font-semibold text-[15px] tracking-wide flex items-center justify-center gap-2.5 transition-all duration-150 active:translate-y-px disabled:opacity-70 disabled:cursor-wait"
                    style={{
                        background: 'linear-gradient(180deg, #4A9EF5, #2D7BD4)',
                        boxShadow: '0 10px 24px rgba(74,158,245,0.32)',
                    }}
                >
                    {carregando ? (
                        <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Entrando...
                        </>
                    ) : (
                        <>
                            Entrar
                            <ArrowIcon />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-7 pt-5 border-t border-[#E4ECF5] flex items-center justify-center gap-2 text-[12.5px] text-[#475467]">
                <ShieldIcon />
                <span>Segurança garantida com SSO · SAML 2.0</span>
            </div>
        </div>
    )
}
