import { useState, useEffect } from 'react'
import { useBentoTheme } from '../hooks/useBentoTheme';
import { tone } from '../utils/tone';

// ─── Design system idêntico ao Dashboard ──────────────────────────────────────

const TECNICOS = [
  { id: '59570', nome: 'MARCIO EDUARDO FELIX' },
  { id: '59841', nome: 'EVERTON DOS SANTOS VIEIRA' },
];

export default function TiSupportModal({ isOpen, onClose, user }) {
    const C = useBentoTheme();
  const [mensagem, setMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [protocoloData, setProtocoloData] = useState(null);

  const [tecnicoSelecionado, setTecnicoSelecionado] = useState('');

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSuccess(false);
      setProtocoloData(null);
      setFeedback(null);
      setMensagem('');
      setTecnicoSelecionado('');
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mensagem.trim() || !tecnicoSelecionado) return;

    setIsLoading(true);
    setFeedback(null);

    const colaborador_id = user?.funcionario?.id || null;
    const email_solicitante = user?.funcionario?.email || user?.email || null;
    const nome_solicitante = user?.funcionario?.funcionario || user?.nome || 'Usuário Intranet';
    const tecnico = TECNICOS.find(t => t.id === tecnicoSelecionado);

    try {
      const res = await fetch('/api/ixc/su-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem,
          colaborador_id,
          tecnico_id: tecnico?.id || '59570',
          nome_solicitante,
          email_solicitante
        })
      });

      const data = await res.json();

      if (data.sucesso) {
        setProtocoloData(data.protocolo);
        setIsSuccess(true);
        setMensagem('');
      } else {
        setFeedback({ type: 'error', text: data.erro || 'Falha ao abrir chamado.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Erro ao conectar com o servidor.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const nomeSolicitante = user?.funcionario?.funcionario || user?.nome || 'Usuário';

  return (
    // Overlay
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      background: 'rgba(11, 27, 46, 0.55)',
      backdropFilter: 'blur(6px)',
    }}>
      {/* Modal card */}
      <div style={{
        background: C.surface,
        borderRadius: 24,
        border: `1px solid ${C.line}`,
        boxShadow: `0 32px 80px ${tone(C.accentDeep, 0.18)}, 0 4px 16px ${tone(C.ink, 0.08)}`,
        width: '100%',
        maxWidth: 520,
        overflow: 'hidden',
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        color: C.ink,
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${C.line}`,
          background: C.surfaceSoft,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: tone(C.accent, 0.12), color: C.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14v-2a8 8 0 0 1 16 0v2"/>
                <rect x="3" y="14" width="4" height="6" rx="2"/>
                <rect x="17" y="14" width="4" height="6" rx="2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: '-0.015em' }}>
                Suporte de TI
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>
                Abertura de chamado no IXC Soft
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${C.line}`, background: C.surface,
              color: C.muted, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.color = C.ink; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.muted; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {isSuccess ? (
            // ─── Tela de Sucesso ──────────────────────────────────────────────
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 32,
                background: C.successSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                border: `1px solid ${tone(C.success, 0.15)}`,
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 5 5L20 7"/>
                </svg>
              </div>

              <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: '-0.025em', marginBottom: 8 }}>
                Chamado Aberto!
              </div>
              <div style={{ fontSize: 13.5, color: C.ink2, lineHeight: 1.6, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
                Seu chamado foi registrado com sucesso no IXC Soft. O setor de T.I. foi notificado.
              </div>

              {protocoloData && (
                <div style={{
                  background: C.bg,
                  border: `1px solid ${C.line}`,
                  borderRadius: 16,
                  padding: '16px 20px',
                  maxWidth: 380,
                  margin: '0 auto 24px',
                }}>
                  <div style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 10.5, fontWeight: 600,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: C.muted, marginBottom: 8,
                  }}>
                    Número do Protocolo
                  </div>
                  <div style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 19, fontWeight: 800,
                    color: C.accent, letterSpacing: '-0.02em',
                    wordBreak: 'break-all',
                  }}>
                    {protocoloData}
                  </div>
                </div>
              )}

              <button
                onClick={handleClose}
                style={{
                  padding: '11px 28px', borderRadius: 11,
                  border: 'none', background: C.accent,
                  color: 'white', fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', transition: 'all .15s',
                  boxShadow: `0 8px 20px ${tone(C.accent, 0.35)}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.accentDark; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.accent; }}
              >
                Fechar
              </button>
            </div>
          ) : (
            // ─── Formulário ───────────────────────────────────────────────────
            <>
              {/* Info banner */}
              <div style={{
                background: tone(C.accent, 0.06),
                border: `1px solid ${tone(C.accent, 0.18)}`,
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 20,
                display: 'flex',
                gap: 10,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <div style={{ fontSize: 12.5, color: C.ink2, lineHeight: 1.6 }}>
                  Ao confirmar, seu chamado será registrado diretamente na fila de atendimento do setor de T.I. da Prestek.
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Seleção do Técnico Responsável */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{
                    display: 'block',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 10.5, fontWeight: 600,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: C.muted, marginBottom: 8,
                  }}>
                    Enviar para
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={tecnicoSelecionado}
                      onChange={(e) => setTecnicoSelecionado(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: C.bg,
                        border: `1px solid ${C.line}`,
                        borderRadius: 14,
                        fontSize: 13.5, color: tecnicoSelecionado ? C.ink : C.muted,
                        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                        appearance: 'none',
                        cursor: 'pointer',
                        transition: 'border-color .15s',
                      }}
                      onFocus={e => { e.target.style.borderColor = C.accent; }}
                      onBlur={e => { e.target.style.borderColor = C.line; }}
                    >
                      <option value="" disabled style={{ background: C.surface, color: C.muted }}>
                        Quem vai atender
                      </option>
                      {TECNICOS.map(t => (
                        <option key={t.id} value={t.id} style={{ background: C.surface, color: C.ink }}>
                          {t.nome}
                        </option>
                      ))}
                    </select>
                    <div style={{
                      position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                      pointerEvents: 'none', color: C.muted, display: 'flex', alignItems: 'center'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Textarea */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{
                    display: 'block',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 10.5, fontWeight: 600,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: C.muted, marginBottom: 8,
                  }}>
                    Descreva a situação
                  </label>
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Ex: Não consigo acessar a impressora do setor administrativo após a reinicialização do sistema..."
                    required
                    style={{
                      width: '100%', height: 140,
                      padding: '14px 16px',
                      background: C.bg,
                      border: `1px solid ${C.line}`,
                      borderRadius: 14,
                      fontSize: 13.5, color: C.ink,
                      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                      lineHeight: 1.6,
                      resize: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color .15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = C.accent; }}
                    onBlur={e => { e.target.style.borderColor = C.line; }}
                  />
                </div>

                {/* Feedback de erro */}
                {feedback && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 10,
                    marginBottom: 16,
                    background: feedback.type === 'error' ? C.dangerSoft : C.successSoft,
                    border: `1px solid ${tone(feedback.type === 'error' ? C.danger : C.success, 0.25)}`,
                    color: feedback.type === 'error' ? C.danger : C.success,
                    fontSize: 13, fontWeight: 600,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      {feedback.type === 'error'
                        ? <><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>
                        : <path d="m5 12 5 5L20 7"/>
                      }
                    </svg>
                    {feedback.text}
                  </div>
                )}

                {/* Ações */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    style={{
                      flex: 1, padding: '11px 16px', borderRadius: 11,
                      border: `1px solid ${C.line}`, background: C.surface,
                      color: C.ink2, fontFamily: 'inherit',
                      fontWeight: 600, fontSize: 13.5,
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.color = C.ink; }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.ink2; }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !mensagem.trim() || !tecnicoSelecionado}
                    style={{
                      flex: 1, padding: '11px 16px', borderRadius: 11,
                      border: 'none',
                      background: isLoading || !mensagem.trim() || !tecnicoSelecionado ? tone(C.accent, 0.4) : C.accent,
                      color: 'white', fontFamily: 'inherit',
                      fontWeight: 700, fontSize: 13.5,
                      cursor: isLoading || !mensagem.trim() || !tecnicoSelecionado ? 'not-allowed' : 'pointer',
                      transition: 'all .15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      boxShadow: isLoading || !mensagem.trim() || !tecnicoSelecionado ? 'none' : `0 6px 16px ${tone(C.accent, 0.30)}`,
                    }}
                    onMouseEnter={e => { if (!isLoading && mensagem.trim() && tecnicoSelecionado) e.currentTarget.style.background = C.accentDark; }}
                    onMouseLeave={e => { if (!isLoading && mensagem.trim() && tecnicoSelecionado) e.currentTarget.style.background = C.accent; }}
                  >
                    {isLoading ? (
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: '2.5px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z"/>
                        </svg>
                        Abrir Chamado
                      </>
                    )}
                  </button>
                </div>
              </form>

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          )}
        </div>
      </div>
    </div>
  );
}