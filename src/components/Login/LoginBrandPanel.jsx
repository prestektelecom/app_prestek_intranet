import { useBentoTheme } from '../../hooks/useBentoTheme'

// Painel da marca ao lado do formulário (só acima de `lg`; o Login.jsx só o
// monta quando a media query casa, então o celular não carrega nada daqui).
// Fundo navy fixo (não muda com o tema do site): é uma cor de marca, como a
// de um logo, não uma superfície de conteúdo — texto branco sobre ele nunca
// perde contraste, então fixar o tom aqui não repete o antipadrão de
// "superfície clara presa no tema escuro" já corrigido em outras telas.
const BRAND_NAVY = '#0B1220'

export default function LoginBrandPanel() {
    const C = useBentoTheme()
    const ano = new Date().getFullYear()

    return (
        <div
            aria-hidden="true"
            style={{
                height: '100%', minHeight: 600, padding: 44, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                background: BRAND_NAVY, color: '#FFFFFF', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg viewBox="0 0 120 120" width="34" height="34" fill="none" stroke="#FFFFFF" strokeLinecap="round">
                    <path d="M38 96 V34 h22 a18 18 0 0 1 0 36 H38" strokeWidth="8" />
                    <path d="M74 30 a26 26 0 0 1 0 40" strokeWidth="7" />
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.2em', color: '#FFFFFF' }}>PRESTEK</span>
            </div>

            <div>
                <div style={{ width: 40, height: 3, background: C.accent }} />
                <div className="font-display" style={{ marginTop: 20, fontSize: 26, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                    Intranet<br />Prestek Telecom
                </div>
                <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: '#9AA8BF', maxWidth: 280 }}>
                    Operações, suporte e gestão em um único acesso.
                </div>
            </div>

            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#5F6E86' }}>
                © {ano} Prestek Telecom
            </div>
        </div>
    )
}
