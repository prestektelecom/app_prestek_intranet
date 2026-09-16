import { useBentoTheme } from '../../hooks/useBentoTheme'
import { fundoHero } from '../ui/heroGradiente'
import logo from '../../image/logos/Logo_480.webp'

// Painel da marca ao lado do formulário (só acima de `lg`; o Login.jsx só o
// monta quando a media query casa, então o celular não carrega nada daqui).
// É o mesmo gesto dos heroes das páginas: a rampa laranja com os anéis de
// sinal saindo do canto. Substitui um Lottie de 14 MB de estoque que nada
// tinha a ver com telecom.

export default function LoginBrandPanel() {
    const C = useBentoTheme()
    return (
        <div
            aria-hidden="true"
            style={{
                height: '100%', minHeight: 600, padding: 44, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                background: fundoHero(C), color: '#FFFFFF', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            }}
        >
            <img src={logo} alt="" style={{ width: 168, height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />

            {/* Só o nome do produto: a decisão 6 do design.md tirou a tagline. */}
            <div className="font-display" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Intranet
            </div>
        </div>
    )
}
