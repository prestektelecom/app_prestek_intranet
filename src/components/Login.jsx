import { useEffect, useMemo, useRef } from 'react'
import { useLogin } from '../hooks/useLogin'
import { useTheme } from '../hooks/useTheme'
import { isDarkTheme } from '../contexts/ThemeContext'

// Tela de entrada "Neural Access": cena única com blobs de mercúrio (filtro
// SVG "goo" + blur). Reage de verdade ao tema (claro/4 escuros) via
// `ThemeContext` — as variáveis `--n-*` do CSS só redirecionam pros tokens
// globais (`--background`/`--ink`/`--accent`/...), então claro vira fundo
// #F5F9FF com texto escuro igual ao resto do app, não um preto fixo. O botão
// no canto grava a escolha ali mesmo, antes do login. Toda a lógica de
// autenticação é a mesma de antes (`useLogin`); só o visual mudou.

const FONT = '"Plus Jakarta Sans", system-ui, sans-serif'

// Posições/atrasos fixos (não `Math.random()`): decorativo, mas
// determinístico, sem risco de flicker de hidratação.
const BLOBS = [
    { size: 260, left: 12, top: 8, animationDelay: '0s', animationDuration: '22s' },
    { size: 220, left: 78, top: 18, animationDelay: '-6s', animationDuration: '18s' },
    { size: 300, left: 60, top: 68, animationDelay: '-11s', animationDuration: '26s' },
    { size: 180, left: 18, top: 74, animationDelay: '-3s', animationDuration: '20s' },
    { size: 210, left: 88, top: 60, animationDelay: '-8s', animationDuration: '24s' },
    { size: 160, left: 42, top: 30, animationDelay: '-15s', animationDuration: '19s' },
]

function EyeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
function EyeOffIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round" />
            <path d="M1 1l22 22" strokeLinecap="round" />
        </svg>
    )
}
function SunIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" strokeLinecap="round" />
        </svg>
    )
}
function MoonIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" strokeLinejoin="round" />
        </svg>
    )
}

// Ícones decorativos dos campos (aria-hidden): o rótulo já nomeia o campo.
function MailIcon() {
    return (
        <svg className="neural-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" strokeLinecap="round" />
        </svg>
    )
}
function LockIcon() {
    return (
        <svg className="neural-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2.5" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
        </svg>
    )
}

function Field({ id, name, label, type = 'text', placeholder, value, onChange, icon, trailing, disabled, invalid, describedBy, inputRef, autoComplete, inputMode, autoFocus }) {
    return (
        <div className="neural-field">
            <label htmlFor={id}>{label}</label>
            <div className="neural-input-wrap">
                {icon}
                <input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type={type}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    autoFocus={autoFocus}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    aria-invalid={invalid || undefined}
                    aria-describedby={invalid ? describedBy : undefined}
                    className="neural-input"
                    style={trailing ? { paddingRight: 36 } : undefined}
                />
                <div className="neural-input-glow" />
                {trailing}
            </div>
        </div>
    )
}

export default function Login({ onLogin }) {
    const {
        email, setEmail,
        senha, setSenha,
        erro, erroCampo, erroSeq,
        carregando,
        mostrarSenha, setMostrarSenha,
        lembrar, setLembrar,
        verificandoBackend,
        servidorFora,
        tentarAgora,
        handleSubmit,
    } = useLogin(onLogin)
    const { theme, setTheme } = useTheme()
    const escuro = isDarkTheme(theme)

    const emailRef = useRef(null)
    const senhaRef = useRef(null)
    const blobRefs = useRef([])

    useEffect(() => {
        if (!erroSeq) return
        if (erroCampo === 'email') emailRef.current?.focus()
        else if (erroCampo === 'senha') senhaRef.current?.focus()
    }, [erroSeq, erroCampo])

    // Parallax sutil do mouse nos blobs — desligado para quem pede menos
    // movimento (o CSS já também some com a animação de flutuação nesse caso).
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const onMove = (e) => {
            const x = e.clientX / window.innerWidth
            const y = e.clientY / window.innerHeight
            blobRefs.current.forEach((blob, i) => {
                if (!blob) return
                const speed = (i + 1) * 14
                blob.style.setProperty('--n-px', `${(x - 0.5) * speed}px`)
                blob.style.setProperty('--n-py', `${(y - 0.5) * speed}px`)
            })
        }
        document.addEventListener('mousemove', onMove)
        return () => document.removeEventListener('mousemove', onMove)
    }, [])

    const podeEnviar = !carregando && !servidorFora
    const ano = useMemo(() => new Date().getFullYear(), [])

    return (
        <div className="neural-wrapper" style={{ fontFamily: FONT }}>
            <button
                type="button"
                className="neural-theme-toggle"
                onClick={() => setTheme(escuro ? 'light' : 'dark')}
                aria-label={escuro ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
                title={escuro ? 'Tema claro' : 'Tema escuro'}
            >
                {escuro ? <SunIcon /> : <MoonIcon />}
            </button>

            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                <defs>
                    <filter id="neural-gooey">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>

            <div className="neural-stage" aria-hidden="true">
                {BLOBS.map((b, i) => (
                    <div
                        key={i}
                        ref={(el) => (blobRefs.current[i] = el)}
                        className="neural-blob"
                        style={{
                            width: b.size, height: b.size, left: `${b.left}%`, top: `${b.top}%`,
                            animationDelay: b.animationDelay, animationDuration: b.animationDuration,
                        }}
                    />
                ))}
            </div>

            <main className="neural-auth">
                <header>
                    <div className="neural-brand-id">
                        <svg viewBox="0 0 120 120" width="16" height="16" fill="none" stroke="currentColor" strokeLinecap="round">
                            <path d="M38 96 V34 h22 a18 18 0 0 1 0 36 H38" strokeWidth="10" />
                            <path d="M74 30 a26 26 0 0 1 0 40" strokeWidth="9" />
                        </svg>
                        Prestek Telecom
                    </div>
                    <h1 className="neural-heading">
                        Entrar{' '}
                        <span className="neural-heading-secondary">Intranet</span>
                    </h1>
                </header>

                <div role="alert" id="login-erro" aria-live="assertive">
                    {erro && (
                        <div className="neural-alert">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" strokeLinecap="round" />
                            </svg>
                            <span>{erro}</span>
                        </div>
                    )}
                </div>

                {servidorFora && (
                    <div role="status" className="neural-warning">
                        <span style={{ flex: 1, minWidth: 180 }}>A intranet está fora do ar. Tente de novo em instantes ou avise a TI.</span>
                        <button type="button" className="neural-warning-btn" onClick={tentarAgora} disabled={verificandoBackend} aria-busy={verificandoBackend || undefined}>
                            {verificandoBackend ? 'Verificando...' : 'Tentar agora'}
                        </button>
                    </div>
                )}

                <form autoComplete="off" onSubmit={handleSubmit} noValidate>
                    <Field
                        id="email"
                        name="username"
                        label="E-mail corporativo"
                        type="email"
                        autoComplete="username"
                        inputMode="email"
                        autoFocus
                        icon={<MailIcon />}
                        placeholder="seu@prestek.com.br"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={carregando}
                        invalid={erroCampo === 'email'}
                        describedBy="login-erro"
                        inputRef={emailRef}
                    />
                    <Field
                        id="senha"
                        name="password"
                        label="Senha"
                        type={mostrarSenha ? 'text' : 'password'}
                        autoComplete="current-password"
                        icon={<LockIcon />}
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        disabled={carregando}
                        invalid={erroCampo === 'senha'}
                        describedBy="login-erro"
                        inputRef={senhaRef}
                        trailing={
                            <button
                                type="button"
                                className="neural-field-toggle"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                                aria-pressed={mostrarSenha}
                            >
                                {mostrarSenha ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        }
                    />

                    {/* Checkbox real (sr-only) com o quadrado desenhado como irmão. */}
                    <label htmlFor="lembrar" className="neural-remember">
                        <input id="lembrar" className="sr-only" type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
                        <span aria-hidden="true" className="neural-remember-box" style={{ background: lembrar ? 'var(--n-mercury)' : 'transparent' }}>
                            {lembrar && (
                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6.5 5 9.5 10 3" style={{ stroke: 'var(--on-accent)' }} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </span>
                        Manter conectado
                    </label>

                    <div className="neural-submit-wrap">
                        <div className="neural-drop" />
                        <button type="submit" className="neural-btn" disabled={!podeEnviar} aria-busy={carregando || undefined}>
                            {servidorFora ? (
                                <>
                                    <span className="animate-spin" aria-hidden="true" style={{ width: 14, height: 14, borderRadius: 7, border: '2px solid var(--on-accent)', borderTopColor: 'transparent', opacity: 0.7 }} />
                                    Aguardando servidor
                                </>
                            ) : carregando ? (
                                <>
                                    <span className="animate-spin" aria-hidden="true" style={{ width: 14, height: 14, borderRadius: 7, border: '2px solid var(--on-accent)', borderTopColor: 'transparent', opacity: 0.7 }} />
                                    Entrando
                                </>
                            ) : 'Entrar na Intranet'}
                        </button>
                    </div>
                </form>

                <footer className="neural-footer-nav">
                    <span>Precisa de ajuda? Fale com a TI.</span>
                    <span>© {ano} Prestek Telecom</span>
                </footer>
            </main>
        </div>
    )
}
