import { useCallback, useEffect, useRef, useState } from 'react'
import { loginUsuario } from '../services/auth'

// Versões anteriores gravavam e-mail E SENHA em claro nesta chave por 7 dias.
// A chave é apagada no primeiro load e nunca mais escrita: "Manter conectado"
// persiste só a sessão (`@Stitch:user` com `expiry`, que o App.jsx controla).
const CHAVE_CREDS_ANTIGA = '@Stitch:creds'

// Intervalo e timeout folgados para 3G: uma resposta lenta não é "fora do ar".
const HEALTH_MS = 5000
const HEALTH_TIMEOUT_MS = 6000
const FALHAS_PARA_AVISAR = 2

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useLogin(onLogin) {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState('')
    // Qual campo o erro aponta ('email' | 'senha' | null): a tela marca
    // `aria-invalid` e move o foco para ele. `erroSeq` cresce a cada erro,
    // mesmo repetido, para o efeito de foco disparar de novo.
    const [erroCampo, setErroCampo] = useState(null)
    const [erroSeq, setErroSeq] = useState(0)
    const [carregando, setCarregando] = useState(false)
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [lembrar, setLembrar] = useState(false)
    const [backendPronto, setBackendPronto] = useState(false)
    const [verificandoBackend, setVerificandoBackend] = useState(true)
    const [servidorFora, setServidorFora] = useState(false)
    const falhas = useRef(0)
    const emAndamento = useRef(false)

    useEffect(() => {
        try { localStorage.removeItem(CHAVE_CREDS_ANTIGA) } catch (_) { /* storage bloqueado */ }
    }, [])

    // Uma checagem por vez: com timeout e intervalo próximos, duas chamadas
    // sobrepostas contavam duas falhas quase juntas e o aviso vinha cedo.
    const verificar = useCallback(async () => {
        if (emAndamento.current) return
        emAndamento.current = true
        try {
            const res = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            falhas.current = 0
            setBackendPronto(true)
            setServidorFora(false)
        } catch {
            falhas.current += 1
            setBackendPronto(false)
            if (falhas.current >= FALHAS_PARA_AVISAR) {
                setServidorFora(true)
                // O aviso amarelo substitui o erro vermelho; duas caixas confundem.
                setErro('')
                setErroCampo(null)
            }
        } finally {
            emAndamento.current = false
            setVerificandoBackend(false)
        }
    }, [])

    useEffect(() => {
        let ativo = true
        const tick = () => { if (ativo) verificar() }
        tick()
        const intervalo = setInterval(tick, HEALTH_MS)
        return () => {
            ativo = false
            clearInterval(intervalo)
            falhas.current = 0
        }
    }, [verificar])

    const tentarAgora = useCallback(() => {
        setVerificandoBackend(true)
        verificar()
    }, [verificar])

    const falhar = (mensagem, campo) => {
        setErro(mensagem)
        setErroCampo(campo)
        setErroSeq((n) => n + 1)
    }

    const handleSubmit = async (e) => {
        if (e) e.preventDefault()
        setErro('')
        setErroCampo(null)

        const emailLimpo = email.trim()
        if (!emailLimpo) return falhar('Informe seu e-mail do IXC.', 'email')
        if (!EMAIL_RE.test(emailLimpo)) return falhar('Informe um e-mail válido.', 'email')
        if (!senha) return falhar('Informe sua senha.', 'senha')

        setCarregando(true)
        try {
            const resultado = await loginUsuario(emailLimpo, senha)

            if (resultado?.erro) {
                // O backend diz qual campo (`campo`); 403 (inativo) e 5xx não
                // apontam campo nenhum.
                const campo = resultado.campo === 'senha' || resultado.campo === 'email' ? resultado.campo : null
                if (campo === 'senha') setSenha('')
                falhar(resultado.erro, campo)
            } else if (resultado) {
                if (onLogin) onLogin({ ...resultado, lembrar })
            }
        } catch (err) {
            falhar('Não foi possível entrar agora. Tente de novo em instantes.', null)
        } finally {
            setCarregando(false)
        }
    }

    return {
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
    }
}
