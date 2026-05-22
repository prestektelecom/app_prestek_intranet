// Login page variants — soft blue/white aesthetic
// Brand: Prestek (original design, not copied from any reference)

const palette = {
  bg1: '#EAF4FF',
  bg2: '#F0F8FF',
  blue: '#4A9EF5',
  blueDark: '#2D7BD4',
  blueDeep: '#1F5BA8',
  cyan: '#7FD4E8',
  mint: '#7FD8B8',
  ink: '#1C2B3A',
  ink2: '#475467',
  muted: '#9AA5B4',
  line: '#E4ECF5',
  white: '#FFFFFF',
};

// ─────────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────────

function PrestekMark({ size = 28, color1 = palette.blue, color2 = palette.cyan }) {
  // Simple geometric mark — two overlapping rounded squares.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'block' }}>
      <rect x="3" y="3" width="18" height="18" rx="4" fill={color1} />
      <rect x="11" y="11" width="18" height="18" rx="4" fill={color2} opacity="0.85" />
      <rect x="11" y="11" width="10" height="10" rx="2" fill={color1} />
    </svg>
  );
}

function Brand({ size = 28, color = palette.ink }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <PrestekMark size={size} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          fontWeight: 800, fontSize: size * 0.7, letterSpacing: '-0.02em', color,
        }}>prestek</span>
        <span style={{
          fontFamily: '"JetBrains Mono", monospace', fontWeight: 500,
          fontSize: size * 0.32, letterSpacing: '0.2em', color: palette.muted,
          marginTop: 3, textTransform: 'uppercase',
        }}>middle platform</span>
      </div>
    </div>
  );
}

// SVG placeholder for the 3D isometric illustration — striped + monospace
// caption. Per design guidance we don't hand-draw complex illustrations.
function IllustrationPlaceholder({ width = 480, height = 480, label = '3D ISOMETRIC ILLUSTRATION' }) {
  const stripeId = `stripe-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div style={{
      width, height, position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Soft glow circle backdrop */}
      <svg viewBox="0 0 480 480" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={`glow-${stripeId}`} cx="50%" cy="55%" r="45%">
            <stop offset="0%" stopColor={palette.blue} stopOpacity="0.22" />
            <stop offset="60%" stopColor={palette.cyan} stopOpacity="0.08" />
            <stop offset="100%" stopColor={palette.blue} stopOpacity="0" />
          </radialGradient>
          <pattern id={stripeId} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke={palette.blue} strokeWidth="1" opacity="0.18" />
          </pattern>
        </defs>
        <circle cx="240" cy="270" r="200" fill={`url(#glow-${stripeId})`} />
        {/* Floor ellipse */}
        <ellipse cx="240" cy="360" rx="170" ry="40" fill="none" stroke={palette.blue} strokeWidth="1.5" opacity="0.35" />
        <ellipse cx="240" cy="360" rx="140" ry="32" fill="none" stroke={palette.blue} strokeWidth="1" opacity="0.25" strokeDasharray="3 4" />
        {/* Central placeholder block */}
        <rect x="160" y="200" width="160" height="140" rx="6" fill={`url(#${stripeId})`}
          stroke={palette.blue} strokeWidth="1.5" opacity="0.6" />
        {/* Floating chips */}
        <rect x="80" y="160" width="50" height="50" rx="8" fill={palette.white}
          stroke={palette.blue} strokeWidth="1.5" opacity="0.7" />
        <rect x="350" y="130" width="44" height="44" rx="22" fill={palette.white}
          stroke={palette.blue} strokeWidth="1.5" opacity="0.7" />
        <rect x="370" y="240" width="56" height="36" rx="6" fill={palette.white}
          stroke={palette.cyan} strokeWidth="1.5" opacity="0.7" />
        <circle cx="110" cy="280" r="14" fill={palette.white} stroke={palette.blue} strokeWidth="1.5" opacity="0.7" />
      </svg>
      <div style={{
        position: 'relative', textAlign: 'center',
        fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
        letterSpacing: '0.15em', color: palette.blueDeep, opacity: 0.65,
        background: 'rgba(255,255,255,0.85)', padding: '6px 10px', borderRadius: 4,
        marginTop: 60,
      }}>
        {label}
      </div>
    </div>
  );
}

function Input({ icon, placeholder, type = 'text', value = '', trailing }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      height: 48, padding: '0 14px',
      background: '#F7FAFD', border: `1px solid ${palette.line}`, borderRadius: 10,
    }}>
      <span style={{ color: palette.muted, display: 'flex' }}>{icon}</span>
      <input type={type} placeholder={placeholder} defaultValue={value}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          fontSize: 15, color: palette.ink,
        }} />
      {trailing}
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={palette.muted} strokeWidth="1.8">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Checkbox({ checked = true, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <span style={{
        width: 16, height: 16, borderRadius: 4,
        background: checked ? palette.blue : 'transparent',
        border: `1.5px solid ${checked ? palette.blue : palette.muted}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6.5 5 9.5 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: 13, color: palette.ink2 }}>{label}</span>
    </label>
  );
}

function PrimaryButton({ children, full = true, big = false }) {
  return (
    <button style={{
      width: full ? '100%' : 'auto',
      height: big ? 52 : 48,
      border: 'none', borderRadius: 10, cursor: 'pointer',
      background: `linear-gradient(180deg, ${palette.blue}, ${palette.blueDark})`,
      color: 'white', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      fontWeight: 600, fontSize: 15, letterSpacing: '0.01em',
      boxShadow: '0 8px 20px rgba(74,158,245,0.32)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// A · Classic split — left illustration, right card
// ─────────────────────────────────────────────────────────────

function VariantA() {
  return (
    <div style={{
      width: 1440, height: 900, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      background: `linear-gradient(135deg, ${palette.bg1} 0%, ${palette.bg2} 60%, #FFFFFF 100%)`,
      display: 'grid', gridTemplateColumns: '1fr 560px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Soft decorative blobs */}
      <div style={{
        position: 'absolute', top: -120, left: -120, width: 360, height: 360,
        background: `radial-gradient(circle, ${palette.blue}33 0%, transparent 70%)`, filter: 'blur(20px)'
      }} />
      <div style={{
        position: 'absolute', bottom: -160, right: 380, width: 420, height: 420,
        background: `radial-gradient(circle, ${palette.cyan}22 0%, transparent 70%)`, filter: 'blur(20px)'
      }} />

      {/* Left */}
      <div style={{ padding: '48px 64px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Brand size={32} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IllustrationPlaceholder width={520} height={520} />
        </div>
        <div style={{ fontSize: 12, color: palette.muted, fontFamily: '"JetBrains Mono", monospace' }}>
          v1.1.0 · © 2026 Prestek Inc.
        </div>
      </div>

      {/* Right card */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 64px 0 0' }}>
        <div style={{
          width: '100%', maxWidth: 440, background: 'white', borderRadius: 20, padding: '48px 44px',
          boxShadow: '0 30px 60px -20px rgba(31,91,168,0.25), 0 0 0 1px rgba(255,255,255,0.6)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{
              fontSize: 26, fontWeight: 700, color: palette.ink, margin: 0,
              letterSpacing: '-0.02em',
            }}>Welcome to the System</h1>
            <div style={{
              width: 56, height: 3, background: palette.blue,
              borderRadius: 2, margin: '14px auto 0'
            }} />
            <p style={{ fontSize: 14, color: palette.ink2, margin: '14px 0 0' }}>
              Sign in to continue to your workspace
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 600,
                color: palette.ink, marginBottom: 8
              }}>Username</label>
              <Input icon={<UserIcon />} placeholder="your.name@prestek.com" value="kleanne@prestek.com" />
            </div>
            <div>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 600,
                color: palette.ink, marginBottom: 8
              }}>Password</label>
              <Input icon={<LockIcon />} type="password" placeholder="••••••••"
                value="passwordpassword" trailing={<EyeIcon />} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0 8px' }}>
              <Checkbox label="Remember password" />
              <a style={{ fontSize: 13, color: palette.blue, fontWeight: 600, textDecoration: 'none' }}>Forgot?</a>
            </div>
            <PrimaryButton>Sign in <ArrowIcon /></PrimaryButton>
          </div>

          <div style={{ textAlign: 'center', marginTop: 28, fontSize: 12, color: palette.muted }}>
            Prestek Information Technology Co., Ltd.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// B · Floating card, full-bleed soft backdrop, illustration above form
// ─────────────────────────────────────────────────────────────

function VariantB() {
  return (
    <div style={{
      width: 1440, height: 900, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      background: `radial-gradient(ellipse at 30% 0%, ${palette.bg1} 0%, ${palette.bg2} 40%, white 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative dotted grid */}
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.4 }} width="100%" height="100%">
        <defs>
          <pattern id="dots-b" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill={palette.blue} opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-b)" />
      </svg>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 32, left: 64, right: 64,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Brand size={28} />
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: palette.ink2 }}>
          <a style={{ color: 'inherit', textDecoration: 'none' }}>Status</a>
          <a style={{ color: 'inherit', textDecoration: 'none' }}>Documentation</a>
          <a style={{ color: palette.blue, textDecoration: 'none', fontWeight: 600 }}>Support →</a>
        </div>
      </div>

      {/* Centered card */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '80px 0'
      }}>
        <div style={{
          width: 920, display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'white', borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 40px 80px -30px rgba(31,91,168,0.28), 0 0 0 1px rgba(255,255,255,0.8)',
        }}>
          {/* Illustration panel inside card */}
          <div style={{
            background: `linear-gradient(160deg, ${palette.bg2} 0%, ${palette.bg1} 100%)`,
            padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'white', padding: '6px 12px', borderRadius: 999,
                fontSize: 12, fontWeight: 600, color: palette.blueDeep,
                boxShadow: '0 2px 8px rgba(31,91,168,0.08)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: palette.mint }} />
                All systems operational
              </div>
            </div>
            <IllustrationPlaceholder width={360} height={360} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: palette.ink, letterSpacing: '-0.02em' }}>
                One platform for every workflow.
              </div>
              <div style={{ fontSize: 13, color: palette.ink2, marginTop: 6 }}>
                Monitor, automate, and ship — from a single pane of glass.
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div style={{ padding: '56px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{
              fontSize: 28, fontWeight: 700, color: palette.ink, margin: 0,
              letterSpacing: '-0.02em'
            }}>Welcome back</h1>
            <p style={{ fontSize: 14, color: palette.ink2, margin: '8px 0 32px' }}>
              Enter your credentials to access the system.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input icon={<UserIcon />} placeholder="Username or email" value="kleanne@prestek.com" />
              <Input icon={<LockIcon />} type="password" value="passwordpassword" trailing={<EyeIcon />} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Checkbox label="Remember password" />
                <a style={{ fontSize: 13, color: palette.blue, fontWeight: 600, textDecoration: 'none' }}>
                  Reset password
                </a>
              </div>
              <div style={{ marginTop: 14 }}>
                <PrimaryButton big>Sign in <ArrowIcon /></PrimaryButton>
              </div>
            </div>

            <div style={{
              marginTop: 24, paddingTop: 20, borderTop: `1px solid ${palette.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 13, color: palette.ink2
            }}>
              <LockIcon />
              <span>Secured with SSO · SAML 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// C · Minimal centered, no illustration column — emphasis on form
// ─────────────────────────────────────────────────────────────

function VariantC() {
  return (
    <div style={{
      width: 1440, height: 900, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      background: palette.bg2, position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Subtle wave svg backdrop */}
      <svg viewBox="0 0 1440 900" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="waveC" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.blue} stopOpacity="0.10" />
            <stop offset="100%" stopColor={palette.blue} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,600 C300,520 600,720 900,600 C1200,480 1440,560 1440,560 L1440,900 L0,900 Z"
          fill="url(#waveC)" />
        <path d="M0,700 C400,640 700,780 1100,700 C1300,660 1440,700 1440,700 L1440,900 L0,900 Z"
          fill={palette.blue} opacity="0.06" />
      </svg>

      {/* Floating geometric chips */}
      <div style={{
        position: 'absolute', top: 140, left: 200, width: 80, height: 80,
        background: 'white', borderRadius: 18, transform: 'rotate(-12deg)',
        boxShadow: '0 12px 32px rgba(31,91,168,0.12)', display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `linear-gradient(135deg, ${palette.blue}, ${palette.cyan})`
        }} />
      </div>
      <div style={{
        position: 'absolute', top: 200, right: 240, width: 64, height: 64,
        background: 'white', borderRadius: 32, transform: 'rotate(8deg)',
        boxShadow: '0 12px 32px rgba(31,91,168,0.12)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: palette.blue
      }}>
        <UserIcon />
      </div>
      <div style={{
        position: 'absolute', bottom: 200, left: 280, width: 88, height: 56,
        background: 'white', borderRadius: 12, transform: 'rotate(6deg)',
        boxShadow: '0 12px 32px rgba(31,91,168,0.12)',
        padding: 10, display: 'flex', flexDirection: 'column', gap: 4
      }}>
        <div style={{ height: 4, borderRadius: 2, background: palette.line, width: '80%' }} />
        <div style={{ height: 4, borderRadius: 2, background: palette.line, width: '60%' }} />
        <div style={{ height: 4, borderRadius: 2, background: palette.blue, width: '40%', marginTop: 'auto' }} />
      </div>
      <div style={{
        position: 'absolute', bottom: 160, right: 280, width: 72, height: 72,
        borderRadius: 36, background: `linear-gradient(135deg, ${palette.mint}, ${palette.cyan})`,
        transform: 'rotate(-10deg)', boxShadow: '0 12px 32px rgba(31,91,168,0.12)'
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', width: 440, background: 'white', borderRadius: 24,
        padding: '56px 48px',
        boxShadow: '0 40px 80px -20px rgba(31,91,168,0.22), 0 0 0 1px rgba(255,255,255,0.8)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <PrestekMark size={44} />
        </div>
        <h1 style={{
          fontSize: 24, fontWeight: 700, textAlign: 'center', color: palette.ink,
          margin: 0, letterSpacing: '-0.02em'
        }}>Sign in to Prestek</h1>
        <div style={{
          width: 40, height: 3, background: palette.blue,
          borderRadius: 2, margin: '12px auto 8px'
        }} />
        <p style={{ fontSize: 14, color: palette.ink2, textAlign: 'center', margin: '0 0 32px' }}>
          Middle Platform · v1.1.0
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input icon={<UserIcon />} placeholder="Username" value="kleanne" />
          <Input icon={<LockIcon />} type="password" value="passwordpassword" trailing={<EyeIcon />} />
          <div style={{ marginTop: 4 }}>
            <Checkbox label="Remember password" />
          </div>
          <div style={{ marginTop: 14 }}>
            <PrimaryButton big>Login</PrimaryButton>
          </div>
        </div>

        <div style={{
          marginTop: 28, display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 12, color: palette.muted
        }}>
          <div style={{ flex: 1, height: 1, background: palette.line }} />
          <span>or</span>
          <div style={{ flex: 1, height: 1, background: palette.line }} />
        </div>

        <button style={{
          marginTop: 16, width: '100%', height: 44, border: `1px solid ${palette.line}`,
          background: 'white', borderRadius: 10, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: palette.ink,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Single Sign-On
        </button>

        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 12, color: palette.muted }}>
          © 2026 Prestek Inc. · All rights reserved
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// D · Bold split with solid blue brand panel
// ─────────────────────────────────────────────────────────────

function VariantD() {
  return (
    <div style={{
      width: 1440, height: 900, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      background: 'white', display: 'grid', gridTemplateColumns: '600px 1fr', overflow: 'hidden',
    }}>
      {/* Left — solid blue */}
      <div style={{
        background: `linear-gradient(160deg, ${palette.blueDeep} 0%, ${palette.blue} 100%)`,
        padding: '48px 56px', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Soft white rings */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.25 }} viewBox="0 0 600 900">
          <circle cx="450" cy="200" r="180" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="450" cy="200" r="260" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="120" cy="780" r="220" fill="none" stroke="white" strokeWidth="1" />
        </svg>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', position: 'relative' }}>
          <svg width="32" height="32" viewBox="0 0 32 32">
            <rect x="3" y="3" width="18" height="18" rx="4" fill="white" />
            <rect x="11" y="11" width="18" height="18" rx="4" fill="white" opacity="0.55" />
            <rect x="11" y="11" width="10" height="10" rx="2" fill="white" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>prestek</span>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
              letterSpacing: '0.2em', opacity: 0.7, marginTop: 3, textTransform: 'uppercase'
            }}>
              middle platform
            </span>
          </div>
        </div>

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Lighter illustration variant for blue bg */}
          <div style={{ filter: 'hue-rotate(-15deg) brightness(1.6) saturate(0.5)' }}>
            <IllustrationPlaceholder width={420} height={420} label="3D ISOMETRIC ILLUSTRATION" />
          </div>
        </div>

        <div style={{ color: 'white', position: 'relative' }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', maxWidth: 420 }}>
            Built for the teams<br />running tomorrow's networks.
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 28, opacity: 0.85, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>99.99%</div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
                letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase', marginTop: 2
              }}>
                Uptime SLA
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>1.2M</div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
                letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase', marginTop: 2
              }}>
                Endpoints
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>24/7</div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
                letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase', marginTop: 2
              }}>
                NOC Support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — white form */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 80px', position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 32, right: 64, fontSize: 13, color: palette.ink2 }}>
          Need an account? <a style={{
            color: palette.blue, fontWeight: 600,
            textDecoration: 'none', marginLeft: 4
          }}>Contact admin →</a>
        </div>

        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 999,
            background: palette.bg1, color: palette.blueDeep,
            fontSize: 12, fontWeight: 600, marginBottom: 24,
            fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: palette.blue }} />
            Internal portal
          </div>
          <h1 style={{
            fontSize: 36, fontWeight: 800, color: palette.ink, margin: 0,
            letterSpacing: '-0.03em'
          }}>Welcome to<br />the System.</h1>
          <div style={{
            width: 56, height: 4, background: palette.blue,
            borderRadius: 2, marginTop: 16
          }} />
          <p style={{
            fontSize: 15, color: palette.ink2, margin: '20px 0 36px',
            lineHeight: 1.5
          }}>
            Sign in with your Prestek credentials to access dashboards, tickets,
            and infrastructure tools.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 700,
                color: palette.ink, marginBottom: 8, fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: '0.1em', textTransform: 'uppercase'
              }}>Username</label>
              <Input icon={<UserIcon />} placeholder="kleanne@prestek.com" value="kleanne@prestek.com" />
            </div>
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 700,
                color: palette.ink, marginBottom: 8, fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: '0.1em', textTransform: 'uppercase'
              }}>Password</label>
              <Input icon={<LockIcon />} type="password" value="passwordpassword" trailing={<EyeIcon />} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0' }}>
              <Checkbox label="Remember password" />
              <a style={{ fontSize: 13, color: palette.blue, fontWeight: 600, textDecoration: 'none' }}>
                Forgot password?
              </a>
            </div>
            <div style={{ marginTop: 12 }}>
              <PrimaryButton big>Sign in <ArrowIcon /></PrimaryButton>
            </div>
          </div>

          <div style={{
            marginTop: 36, fontSize: 12, color: palette.muted,
            fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.05em'
          }}>
            © 2026 PRESTEK INC. · ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VariantA, VariantB, VariantC, VariantD });
