import { useEffect, useState } from 'react'
import { useLogin } from '../hooks/useLogin'
import { useBentoTheme } from '../hooks/useBentoTheme'
import LoginForm from './Login/LoginForm'
import LoginBrandPanel from './Login/LoginBrandPanel'

// Tela de entrada: card com o painel da marca (desktop) e o formulário. Lê os
// mesmos tokens do resto do portal, então muda com os cinco temas. Sem
// header de links, sem tagline, sem alegações: dois campos e um botão.

const PAINEL_MQ = '(min-width: 1024px)'

function usePainelVisivel() {
    const [visivel, setVisivel] = useState(() => typeof window !== 'undefined' && window.matchMedia(PAINEL_MQ).matches)
    useEffect(() => {
        const mq = window.matchMedia(PAINEL_MQ)
        const onChange = (e) => setVisivel(e.matches)
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }, [])
    return visivel
}

export default function Login({ onLogin }) {
    const C = useBentoTheme()
    const loginProps = useLogin(onLogin)
    const painel = usePainelVisivel()

    return (
        <div
            className="min-h-screen w-full flex flex-col"
            style={{ background: C.bg, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
        >
            <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
                <div
                    className="w-full max-w-[1040px] grid grid-cols-1 lg:grid-cols-[420px_1fr] overflow-hidden"
                    style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, boxShadow: 'var(--shadow-sm)' }}
                >
                    {painel && <LoginBrandPanel />}
                    <LoginForm {...loginProps} mostrarLogo={!painel} />
                </div>
            </main>

            <footer style={{ textAlign: 'center', padding: '16px 24px 24px', fontSize: 13, color: C.ink2 }}>
                © {new Date().getFullYear()} Prestek Telecom
            </footer>
        </div>
    )
}
