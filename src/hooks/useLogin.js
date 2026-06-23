import { useEffect, useState } from 'react'
import { loginUsuario } from '../services/auth'

const CHAVE_CREDS = '@Stitch:creds'

function lerCredenciasSalvas() {
    try {
        const raw = localStorage.getItem(CHAVE_CREDS)
        if (!raw) return null
        const { email, senha, expiry } = JSON.parse(raw)
        if (Date.now() > expiry) {
            localStorage.removeItem(CHAVE_CREDS)
            return null
        }
        return { email, senha }
    } catch (e) {
        return null
    }
}

export function useLogin(onLogin) {
    const credsSalvas = lerCredenciasSalvas()
    const [email, setEmail] = useState(credsSalvas?.email || '')
    const [senha, setSenha] = useState(credsSalvas?.senha || '')
    const [erro, setErro] = useState('')
    const [carregando, setCarregando] = useState(false)
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [lembrar, setLembrar] = useState(false)
    const [backendPronto, setBackendPronto] = useState(false)
    const [verificandoBackend, setVerificandoBackend] = useState(true)

    const credValida = !!credsSalvas

    useEffect(() => {
        let cancelado = false
        const verificar = async () => {
            try {
                const res = await fetch('/api/health', {
                    method: 'GET',
                    signal: AbortSignal.timeout(3000)
                })
                if (!cancelado) {
                    setBackendPronto(res.ok)
                    setVerificandoBackend(false)
                }
            } catch {
                if (!cancelado) {
                    setBackendPronto(false)
                    setVerificandoBackend(false)
                }
            }
        }

        verificar()
        const intervalo = setInterval(verificar, 3000)
        return () => {
            cancelado = true
            clearInterval(intervalo)
        }
    }, [])

    const handleSubmit = async (e) => {
        if (e) e.preventDefault()
        setErro('')

        if (!email.trim()) {
            setErro('Informe seu email.')
            return
        }

        if (!senha.trim()) {
            setErro('Informe sua senha.')
            return
        }

        setCarregando(true)

        try {
            const resultado = await loginUsuario(email, senha)

            if (resultado?.erro) {
                setErro(resultado.erro)
            } else if (resultado) {
                if (lembrar || credValida) {
                    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000
                    localStorage.setItem(CHAVE_CREDS, JSON.stringify({ email, senha, expiry }))
                } else {
                    localStorage.removeItem(CHAVE_CREDS)
                }
                if (onLogin) onLogin({ ...resultado, lembrar: lembrar || credValida })
            }
        } catch (err) {
            setErro('Erro inesperado. Tente novamente.')
        } finally {
            setCarregando(false)
        }
    }

    return {
        email, setEmail,
        senha, setSenha,
        erro, setErro,
        carregando,
        mostrarSenha, setMostrarSenha,
        lembrar, setLembrar,
        credValida,
        backendPronto,
        verificandoBackend,
        handleSubmit
    }
}
