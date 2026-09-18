import { useEffect, useRef } from 'react'
import { useBentoTheme } from '../../hooks/useBentoTheme'
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, ArrowIcon } from './Icons'

// Formulário de entrada. Toda cor vem de `C` (useBentoTheme), como no resto
// do portal; o anel de foco é o global do index.css. Campos nomeados para o
// leitor de tela e para o gerenciador de senha do navegador.

const FONT = '"Plus Jakarta Sans", system-ui, sans-serif'

function Field({ C, id, name, label, icon, type = 'text', placeholder, value, onChange, trailing, disabled, invalid, describedBy, inputRef, autoComplete, inputMode, autoFocus }) {
    return (
        <div>
            <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 8 }}>
                {label}
            </label>
            {/* O anel de foco vai para o wrapper (`.login-field:focus-within` no
                index.css); o input tem `outline: none` para não desenhar dois anéis. */}
            <div
                className="login-field"
                style={{
                    display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, padding: '0 6px 0 12px', borderRadius: 12,
                    // Borda em `muted` (3,0:1 no claro, 5,7:1 no escuro): com `line`
                    // o campo media 1,2:1 e quase não tinha contorno.
                    background: C.surface, border: `1px solid ${invalid ? C.dangerStrong : C.muted}`,
                }}
            >
                <span aria-hidden="true" style={{ display: 'flex', flexShrink: 0, color: invalid ? C.dangerStrong : C.ink2 }}>{icon}</span>
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
                    style={{
                        flex: 1, minWidth: 0, height: 42, border: 'none', outline: 'none', background: 'transparent',
                        fontSize: 14, color: C.ink, fontFamily: FONT,
                    }}
                    className="login-input"
                />
                {trailing}
            </div>
        </div>
    )
}

export default function LoginForm({
    email, setEmail,
    senha, setSenha,
    erro, erroCampo, erroSeq,
    carregando,
    mostrarSenha, setMostrarSenha,
    lembrar, setLembrar,
    backendPronto,
    verificandoBackend,
    servidorFora,
    tentarAgora,
    handleSubmit,
    mostrarLogo = false,
}) {
    const C = useBentoTheme()
    const emailRef = useRef(null)
    const senhaRef = useRef(null)

    // Depois de um erro, o foco vai para o campo que ele aponta. O banner é
    // `role="alert"`, então o leitor de tela anuncia a mensagem antes.
    // Depende de `erroSeq` para disparar mesmo quando o erro se repete.
    useEffect(() => {
        if (!erroSeq) return
        if (erroCampo === 'email') emailRef.current?.focus()
        else if (erroCampo === 'senha') senhaRef.current?.focus()
    }, [erroSeq, erroCampo])

    // O botão só trava quando o servidor está fora de verdade (duas falhas
    // seguidas do health check); uma falha isolada em rede lenta não pode
    // declarar a intranet fora do ar. `loginUsuario` já cobre 5xx com retry.
    const podeEnviar = !carregando && !servidorFora

    return (
        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-14 lg:min-h-[600px]" style={{ background: C.surface, fontFamily: FONT }}>
            {/* Abaixo de `lg` o painel da marca não monta; o ícone vem para cá,
                senão a porta do celular não tem nenhum sinal da Prestek. */}
            {mostrarLogo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <svg viewBox="0 0 120 120" width="28" height="28" fill="none" stroke={C.ink} strokeLinecap="round">
                        <path d="M38 96 V34 h22 a18 18 0 0 1 0 36 H38" strokeWidth="8" />
                        <path d="M74 30 a26 26 0 0 1 0 40" strokeWidth="7" />
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: C.ink }}>PRESTEK</span>
                </div>
            )}
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight leading-tight" style={{ color: C.ink, margin: 0 }}>
                Entrar na Intranet
            </h1>
            <p style={{ fontSize: 14, color: C.ink2, marginTop: 8, marginBottom: 24, lineHeight: 1.5 }}>
                Use suas credenciais corporativas.
            </p>

            <div role="alert" id="login-erro" aria-live="assertive">
                {erro && (
                    <div style={{
                        marginBottom: 16, padding: '10px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
                        background: C.dangerSoft, border: `1px solid ${C.dangerStrong}`, color: C.dangerStrong, fontSize: 14, fontWeight: 600,
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" strokeLinecap="round" />
                        </svg>
                        <span>{erro}</span>
                    </div>
                )}
            </div>

            {servidorFora && (
                <div role="status" style={{
                    marginBottom: 16, padding: '10px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                    background: C.warningSoft, border: `1px solid ${C.warningStrong}`, color: C.warningStrong, fontSize: 14,
                }}>
                    <span style={{ flex: 1, minWidth: 180, fontWeight: 600 }}>A intranet está fora do ar. Tente de novo em instantes ou avise a TI.</span>
                    <button
                        type="button"
                        onClick={tentarAgora}
                        disabled={verificandoBackend}
                        aria-busy={verificandoBackend || undefined}
                        style={{
                            minHeight: 36, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.warningStrong}`, background: 'transparent',
                            color: C.warningStrong, fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                            cursor: verificandoBackend ? 'wait' : 'pointer', opacity: verificandoBackend ? 0.7 : 1,
                        }}
                    >
                        {verificandoBackend ? 'Verificando...' : 'Tentar agora'}
                    </button>
                </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                <Field
                    C={C}
                    id="email"
                    name="username"
                    label="E-mail corporativo"
                    icon={<UserIcon />}
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    autoFocus
                    placeholder="nome@prestek.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={carregando}
                    invalid={erroCampo === 'email'}
                    describedBy="login-erro"
                    inputRef={emailRef}
                />
                <Field
                    C={C}
                    id="senha"
                    name="password"
                    label="Senha"
                    icon={<LockIcon />}
                    type={mostrarSenha ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={carregando}
                    invalid={erroCampo === 'senha'}
                    describedBy="login-erro"
                    inputRef={senhaRef}
                    trailing={
                        <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                            aria-pressed={mostrarSenha}
                            style={{
                                width: 44, height: 44, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ink2, flexShrink: 0,
                            }}
                        >
                            {mostrarSenha ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    }
                />

                <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginTop: 4 }}>
                    {/* Checkbox real (sr-only) com o quadrado desenhado como irmão: Tab
                        chega nele, Espaço alterna, e o anel de foco vai para o quadrado
                        via `label:has(> input.sr-only:focus-visible)` do index.css. */}
                    <label htmlFor="lembrar" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 44, cursor: 'pointer', userSelect: 'none', borderRadius: 8, padding: '0 2px' }}>
                        <input
                            id="lembrar"
                            className="sr-only"
                            type="checkbox"
                            checked={lembrar}
                            onChange={(e) => setLembrar(e.target.checked)}
                        />
                        <span
                            aria-hidden="true"
                            style={{
                                // Raio 6 num quadrado de 20px: com 8 lia como botão de rádio.
                                width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                background: lembrar ? C.accent : C.surface, border: `1.5px solid ${lembrar ? C.accent : C.ink2}`,
                            }}
                        >
                            {lembrar && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6.5 5 9.5 10 3" stroke={C.onAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </span>
                        <span style={{ fontSize: 14, color: C.ink }}>Manter conectado</span>
                    </label>
                    {/* Texto puro, não link: sem contato oficial de TI cadastrado ainda,
                        um link sem destino seria pior do que nenhum. Cor de destaque
                        (não `ink2`) porque visualmente é a chamada de ajuda da tela. */}
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.accentDark }}>Precisa de ajuda? Fale com a TI.</span>
                </div>

                {/* Botão sólido no accent com `onAccent`: branco sobre o laranja dava
                    2,8:1. Plano em repouso; o hover eleva com a sombra Resposta. */}
                <button
                    type="submit"
                    disabled={!podeEnviar}
                    aria-busy={carregando || undefined}
                    className="login-submit"
                    style={{
                        marginTop: 8, width: '100%', height: 48, border: 'none', borderRadius: 12,
                        background: C.accent, color: C.onAccent, fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        cursor: podeEnviar ? 'pointer' : 'not-allowed', opacity: podeEnviar ? 1 : 0.7,
                        transition: 'box-shadow .15s ease, transform .1s ease',
                    }}
                >
                    {servidorFora ? (
                        <>
                            <span className="animate-spin" aria-hidden="true" style={{ width: 16, height: 16, borderRadius: 8, border: `2px solid ${C.onAccent}`, borderTopColor: 'transparent', opacity: 0.8 }} />
                            Aguardando servidor...
                        </>
                    ) : carregando ? (
                        <>
                            <span className="animate-spin" aria-hidden="true" style={{ width: 16, height: 16, borderRadius: 8, border: `2px solid ${C.onAccent}`, borderTopColor: 'transparent', opacity: 0.8 }} />
                            Entrando...
                        </>
                    ) : (
                        <>
                            Entrar na Intranet
                            <ArrowIcon />
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
