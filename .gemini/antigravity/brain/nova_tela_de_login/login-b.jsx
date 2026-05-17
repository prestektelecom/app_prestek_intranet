// Login page — Variant B (Floating dual card), polished and tweakable.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#4A9EF5",
  "radius": 24,
  "layout": "illustration-left",
  "showStatusPill": true,
  "showSecurity": true,
  "showStats": false,
  "title": "Bem-vindo à Prestek Inc.",
  "subtitle": "Insira suas credenciais para acessar o sistema.",
  "tagline": "Uma plataforma para cada fluxo de trabalho.",
  "buttonLabel": "Sign in"
} /*EDITMODE-END*/;

const ACCENTS = ['#4A9EF5', '#2D7BD4', '#1F8A5B', '#6B5BFF', '#0FB5BA', '#FF7849'];

// Tone helpers ---------------------------------------------------------------
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
}
function tone(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}
function darken(hex, amt = 0.15) {
  const [r, g, b] = hexToRgb(hex);
  const f = (v) => Math.max(0, Math.round(v * (1 - amt)));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

// ─────────────────────────────────────────────────────────────
// Brand + icons
// ─────────────────────────────────────────────────────────────

function PrestekMark({ size = 28, accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'block' }}>
      <rect x="3" y="3" width="18" height="18" rx="4" fill={accent} />
      <rect x="11" y="11" width="18" height="18" rx="4" fill={accent} opacity="0.45" />
      <rect x="11" y="11" width="10" height="10" rx="2" fill={accent} />
    </svg>);

}

function Brand({ accent, size = 28, dark = true }) {
  const ink = dark ? '#1C2B3A' : '#FFFFFF';
  const muted = dark ? '#9AA5B4' : 'rgba(255,255,255,0.7)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <PrestekMark size={size} accent={accent} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          fontWeight: 800, fontSize: size * 0.78, letterSpacing: '-0.02em', color: ink
        }}>Prestek Internet</span>
        <span style={{
          fontFamily: '"JetBrains Mono", monospace', fontWeight: 500,
          fontSize: size * 0.35, letterSpacing: '0.22em', color: muted,
          marginTop: 4, textTransform: 'uppercase'
        }}>PORTAL INTERNO</span>
      </div>
    </div>);

}

function UserIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>);

}
function LockIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" strokeLinecap="round" />
    </svg>);

}
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9AA5B4" strokeWidth="1.8">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>);

}
function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);

}
function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);

}

// ─────────────────────────────────────────────────────────────
// Illustration placeholder — soft isometric scene with strong
// geometric language. Replace with a real 3D render later.
// ─────────────────────────────────────────────────────────────

function Illustration({ accent }) {
  const accentLight = tone(accent, 0.25);
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <svg viewBox="0 0 480 480" width="100%" style={{ maxWidth: 440, maxHeight: 440 }}>
        <defs>
          <radialGradient id="glow" cx="50%" cy="55%" r="48%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
            <stop offset="60%" stopColor={accent} stopOpacity="0.06" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="plinth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor={tone(accent, 0.08)} />
          </linearGradient>
          <linearGradient id="device" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor={tone(accent, 0.12)} />
          </linearGradient>
          <pattern id="dots-illust" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill={accent} opacity="0.22" />
          </pattern>
        </defs>

        <circle cx="240" cy="260" r="200" fill="url(#glow)" />

        {/* Circular plinth (isometric ellipse stack) */}
        <ellipse cx="240" cy="360" rx="170" ry="42" fill="url(#plinth)" stroke={accentLight} strokeWidth="1.5" />
        <ellipse cx="240" cy="352" rx="170" ry="42" fill="none" stroke={accentLight} strokeWidth="1" />
        <ellipse cx="240" cy="360" rx="140" ry="34" fill="none" stroke={accent} strokeWidth="1" opacity="0.4" strokeDasharray="3 5" />
        <ellipse cx="240" cy="360" rx="100" ry="24" fill="none" stroke={accent} strokeWidth="1" opacity="0.3" />

        {/* Central "device" — isometric-ish cube */}
        <g>
          {/* Side */}
          <path d="M 180 270 L 240 300 L 240 360 L 180 330 Z" fill={tone(accent, 0.18)} stroke={accent} strokeWidth="1.5" opacity="0.85" />
          {/* Front-right side */}
          <path d="M 240 300 L 300 270 L 300 330 L 240 360 Z" fill={tone(accent, 0.10)} stroke={accent} strokeWidth="1.5" opacity="0.85" />
          {/* Top */}
          <path d="M 180 270 L 240 240 L 300 270 L 240 300 Z" fill="url(#device)" stroke={accent} strokeWidth="1.5" />
          {/* Screen glow on top */}
          <path d="M 200 274 L 240 254 L 280 274 L 240 294 Z" fill={tone(accent, 0.35)} />
        </g>

        {/* Floating element 1 — rounded card upper-left */}
        <g transform="translate(70 150) rotate(-8)">
          <rect width="68" height="68" rx="14" fill="white" stroke={accent} strokeWidth="1.5" opacity="0.95" />
          <rect x="14" y="14" width="40" height="6" rx="3" fill={accent} opacity="0.5" />
          <rect x="14" y="26" width="28" height="6" rx="3" fill={accent} opacity="0.25" />
          <rect x="14" y="40" width="20" height="20" rx="6" fill={accent} opacity="0.85" />
        </g>

        {/* Floating element 2 — circular badge upper-right */}
        <g transform="translate(360 130)">
          <circle r="30" fill="white" stroke={accent} strokeWidth="1.5" />
          <circle r="14" fill={accent} opacity="0.18" />
          <circle r="6" fill={accent} />
        </g>

        {/* Floating element 3 — pill mid-right */}
        <g transform="translate(370 250) rotate(8)">
          <rect width="70" height="36" rx="18" fill="white" stroke={accent} strokeWidth="1.5" />
          <circle cx="18" cy="18" r="6" fill={accent} />
          <rect x="30" y="14" width="30" height="4" rx="2" fill={accent} opacity="0.5" />
          <rect x="30" y="22" width="20" height="4" rx="2" fill={accent} opacity="0.25" />
        </g>

        {/* Floating element 4 — small sphere lower-left */}
        <g transform="translate(80 290)">
          <circle r="22" fill="url(#dots-illust)" stroke={accent} strokeWidth="1.2" opacity="0.7" />
        </g>

        {/* Connector lines */}
        <g stroke={accent} strokeWidth="1.2" fill="none" opacity="0.35" strokeDasharray="2 4">
          <path d="M 130 200 Q 170 220 200 270" />
          <path d="M 360 160 Q 320 210 290 260" />
          <path d="M 380 280 Q 340 290 310 300" />
        </g>
      </svg>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Form atoms
// ─────────────────────────────────────────────────────────────

function Field({ label, icon, type = 'text', placeholder, defaultValue, trailing, accent }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600, color: '#1C2B3A', marginBottom: 8
      }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        height: 50, padding: '0 14px',
        background: focused ? 'white' : '#F7FAFD',
        border: `1.5px solid ${focused ? accent : '#E4ECF5'}`,
        boxShadow: focused ? `0 0 0 4px ${tone(accent, 0.12)}` : 'none',
        borderRadius: 12, transition: 'all .15s ease'
      }}>
        <span style={{ color: focused ? accent : '#9AA5B4', display: 'flex', transition: 'color .15s' }}>{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: 15, color: '#1C2B3A'
          }} />
        
        {trailing && <span style={{ cursor: 'pointer', display: 'flex' }}>{trailing}</span>}
      </div>
    </div>);

}

function Checkbox({ label, accent, defaultChecked = true }) {
  const [checked, setChecked] = React.useState(defaultChecked);
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
    onClick={(e) => {e.preventDefault();setChecked((v) => !v);}}>
      <span style={{
        width: 18, height: 18, borderRadius: 5,
        background: checked ? accent : 'transparent',
        border: `1.5px solid ${checked ? accent : '#9AA5B4'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .12s'
      }}>
        {checked &&
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 6.5 5 9.5 10 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      </span>
      <span style={{ fontSize: 13.5, color: '#475467' }}>{label}</span>
    </label>);

}

// ─────────────────────────────────────────────────────────────
// Main composition
// ─────────────────────────────────────────────────────────────

function LoginPage() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const accent = t.accent;
  const accentDark = darken(accent, 0.18);
  const radius = t.radius;
  const illustFirst = t.layout === 'illustration-left';

  const illustPanel =
  <div style={{
    background: `linear-gradient(160deg, #EAF4FF 0%, #F0F8FF 50%, ${tone(accent, 0.05)} 100%)`,
    padding: 44, display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
    minHeight: 600
  }}>
      {/* Subtle dotted bg */}
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.45 }} width="100%" height="100%">
        <defs>
          <pattern id="dots-panel" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill={accent} opacity="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-panel)" />
      </svg>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start', gap: 12 }}>
        <Brand accent={accent} size={26} />
        {t.showStatusPill &&
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'white', padding: '6px 12px', borderRadius: 999,
        fontSize: 12, fontWeight: 600, color: accentDark,
        boxShadow: `0 4px 12px ${tone(accent, 0.10)}`, fontFamily: "\"Plus Jakarta Sans\""
      }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#1F8A5B' }} />
            All systems operational
          </div>
      }
      </div>

      <div style={{ position: 'relative', flex: 1, display: 'flex',
      alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
        <Illustration accent={accent} />
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1C2B3A',
        letterSpacing: '-0.02em', lineHeight: 1.2 }} data-comment-anchor="tagline">
          {t.tagline}
        </div>
        <div style={{ fontSize: 13.5, color: '#475467', marginTop: 8, lineHeight: 1.55 }}>Monitore, automatize e envie tudo a partir de um único painel de controle.

      </div>
        {t.showStats &&
      <div style={{ display: 'flex', gap: 28, marginTop: 22 }}>
            {[
        ['99.99%', 'Uptime SLA'],
        ['1.2M', 'Endpoints'],
        ['24/7', 'NOC Support']].
        map(([n, l]) =>
        <div key={l}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1C2B3A' }}>{n}</div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
            letterSpacing: '0.12em', color: '#9AA5B4', textTransform: 'uppercase', marginTop: 2 }}>
                  {l}
                </div>
              </div>
        )}
          </div>
      }
      </div>
    </div>;


  const formPanel =
  <div style={{ padding: '64px 56px', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', background: 'white', minHeight: 600 }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, color: '#1C2B3A',
      margin: 0, letterSpacing: '-0.025em' }} data-comment-anchor="form-title">
        {t.title}
      </h1>
      <div style={{ width: 48, height: 3, background: accent,
      borderRadius: 2, marginTop: 14 }} />
      <p style={{ fontSize: 14.5, color: '#475467', margin: '16px 0 32px', lineHeight: 1.55 }}
    data-comment-anchor="form-subtitle">
        {t.subtitle}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="E-mail" icon={<UserIcon />}
      placeholder="your.name@prestek.com"
      defaultValue="kleanne@prestek.com"
      accent={accent} />
        <Field label="Senha" icon={<LockIcon />} type="password"
      placeholder="••••••••"
      defaultValue="passwordpassword"
      trailing={<EyeIcon />}
      accent={accent} />

        <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 4 }}>
          <Checkbox label="Lembrar senha" accent={accent} />
          <a href="#" style={{ fontSize: 13.5, color: accent, fontWeight: 600,
          textDecoration: 'none' }}>Problemas ao acessar?</a>
        </div>

        <button style={{
        marginTop: 16, width: '100%', height: 52,
        border: 'none', borderRadius: 12, cursor: 'pointer',
        background: `linear-gradient(180deg, ${accent}, ${accentDark})`,
        color: 'white', fontFamily: 'inherit',
        fontWeight: 600, fontSize: 15, letterSpacing: '0.01em',
        boxShadow: `0 10px 24px ${tone(accent, 0.32)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'transform .12s, box-shadow .12s'
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}
      onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        
          {t.buttonLabel}
          <ArrowIcon />
        </button>
      </div>

      {t.showSecurity &&
    <div style={{
      marginTop: 28, paddingTop: 20, borderTop: '1px solid #E4ECF5',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontSize: 12.5, color: '#475467'
    }}>
          <ShieldIcon />
          <span>Segurança garantida com SSO · SAML 2.0 · </span>
        </div>
    }
    </div>;


  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: `radial-gradient(ellipse at 30% 0%, #EAF4FF 0%, #F0F8FF 40%, #FAFCFF 100%)`,
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Faint dotted backdrop */}
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.35 }} width="100%" height="100%">
        <defs>
          <pattern id="dots-bg" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill={accent} opacity="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-bg)" />
      </svg>
      {/* Soft blobs */}
      <div style={{ position: 'absolute', top: -160, left: -120, width: 460, height: 460,
        borderRadius: '50%', background: tone(accent, 0.18), filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: -160, right: -100, width: 420, height: 420,
        borderRadius: '50%', background: tone(accent, 0.10), filter: 'blur(80px)' }} />

      {/* Top bar */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '28px 48px' }}>
        <Brand accent={accent} size={26} />
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: '#475467', alignItems: 'center' }}>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Status</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Docs</a>
          <a href="#" style={{
            color: accent, textDecoration: 'none', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 4
          }}>Suporte <ArrowIcon /></a>
        </div>
      </div>

      {/* Centered dual card */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '32px 32px 64px',
        minHeight: 'calc(100vh - 200px)', fontFamily: "\"Plus Jakarta Sans\"" }}>
        <div style={{
          width: '100%', maxWidth: 980,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'white', borderRadius: radius, overflow: 'hidden',
          boxShadow: `0 50px 100px -30px ${tone(accent, 0.30)}, 0 0 0 1px rgba(255,255,255,0.8)`
        }}>
          {illustFirst ? <>{illustPanel}{formPanel}</> : <>{formPanel}{illustPanel}</>}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '12px 0 32px',
        fontSize: 12.5, color: '#9AA5B4',
        fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.05em' }}>
        © 2026 Prestek Inc. · All rights reserved
      </div>

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Style">
          <TweakColor label="Accent" value={t.accent} options={ACCENTS}
          onChange={(v) => setTweak('accent', v)} />
          <TweakSlider label="Card radius" value={t.radius} min={0} max={40} unit="px"
          onChange={(v) => setTweak('radius', v)} />
          <TweakRadio label="Layout" value={t.layout}
          options={[
          { value: 'illustration-left', label: 'Illust ← Form' },
          { value: 'form-left', label: 'Form ← Illust' }]
          }
          onChange={(v) => setTweak('layout', v)} />
        </TweakSection>
        <TweakSection label="Content">
          <TweakText label="Title" value={t.title} onChange={(v) => setTweak('title', v)} />
          <TweakText label="Subtitle" value={t.subtitle} onChange={(v) => setTweak('subtitle', v)} />
          <TweakText label="Tagline" value={t.tagline} onChange={(v) => setTweak('tagline', v)} />
          <TweakText label="Button" value={t.buttonLabel} onChange={(v) => setTweak('buttonLabel', v)} />
        </TweakSection>
        <TweakSection label="Modules">
          <TweakToggle label="Status pill" value={t.showStatusPill}
          onChange={(v) => setTweak('showStatusPill', v)} />
          <TweakToggle label="Stats row" value={t.showStats}
          onChange={(v) => setTweak('showStats', v)} />
          <TweakToggle label="Security footer" value={t.showSecurity}
          onChange={(v) => setTweak('showSecurity', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>);

}

Object.assign(window, { LoginPage });