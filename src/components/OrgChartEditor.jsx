import React, { useState, useEffect, useRef } from 'react';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { useDismissable, makeTrapTab } from '../hooks/useDismissable';

function tone(hex, a) {
    const h = hex.replace('#', '');
    const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
    return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
}

const MONO = '"JetBrains Mono", monospace';
const FONT = '"Plus Jakarta Sans", system-ui, sans-serif';

// Sem isso o editor não tinha NENHUMA semântica de diálogo: Escape não
// fechava, o foco não entrava nele ao abrir e Tab escapava para a página por
// trás. É o admin editando o organograma da empresa inteira — o mesmo padrão
// (useDismissable + trap de Tab local) já usado em TiSupportModal,
// ManagePlantaoModal e CrudModal/DeleteModal (Comunicados).
const ORGCHART_EDITOR_TITLE_ID = 'orgchart-editor-titulo';

export default function OrgChartEditor({ data, onSave, onClose, onReset }) {
    const C = useBentoTheme();
    const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(data)));
    const [activeTab, setActiveTab] = useState('ceo');
    const modalRef = useRef(null);

    useDismissable(modalRef, { open: true, onClose, lockScroll: true, closeOnOutside: true });

    const trapTab = makeTrapTab(modalRef);

    useEffect(() => {
        setDraft(JSON.parse(JSON.stringify(data)));
    }, [data]);

    const updateRoot = (field, value) => {
        setDraft(prev => ({ ...prev, root: { ...prev.root, [field]: value } }));
    };

    const updateArea = (index, field, value) => {
        setDraft(prev => {
            const areas = [...prev.areas];
            areas[index] = { ...areas[index], [field]: value };
            return { ...prev, areas };
        });
    };

    const updateChild = (areaIndex, childIndex, value) => {
        setDraft(prev => {
            const areas = [...prev.areas];
            const children = [...areas[areaIndex].children];
            children[childIndex] = value;
            areas[areaIndex] = { ...areas[areaIndex], children };
            return { ...prev, areas };
        });
    };

    const addChild = (areaIndex) => {
        setDraft(prev => {
            const areas = [...prev.areas];
            areas[areaIndex] = { ...areas[areaIndex], children: [...areas[areaIndex].children, 'Novo sub-setor'] };
            return { ...prev, areas };
        });
    };

    const removeChild = (areaIndex, childIndex) => {
        setDraft(prev => {
            const areas = [...prev.areas];
            const children = areas[areaIndex].children.filter((_, i) => i !== childIndex);
            areas[areaIndex] = { ...areas[areaIndex], children };
            return { ...prev, areas };
        });
    };

    const moveArea = (index, direction) => {
        setDraft(prev => {
            const areas = [...prev.areas];
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= areas.length) return prev;
            [areas[index], areas[newIndex]] = [areas[newIndex], areas[index]];
            return { ...prev, areas };
        });
    };

    const exportJson = () => {
        const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orgchart.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importJson = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const parsed = JSON.parse(ev.target.result);
                setDraft(parsed);
            } catch (err) {
                alert('Arquivo JSON inválido.');
            }
        };
        reader.readAsText(file);
    };

    const tabBtn = (id, label, icon) => (
        <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
                flex: 1,
                padding: '12px 8px',
                border: 'none',
                borderBottom: `2px solid ${activeTab === id ? C.accent : 'transparent'}`,
                background: 'transparent',
                color: activeTab === id ? C.accentDeep : C.ink2,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontFamily: FONT,
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
            {label}
        </button>
    );

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={ORGCHART_EDITOR_TITLE_ID}
                onKeyDown={trapTab}
                style={{
                    width: '100%', maxWidth: 720, maxHeight: '90vh',
                    background: C.surface, borderRadius: 20, border: `1px solid ${C.line}`,
                    boxShadow: `0 24px 60px -20px ${tone(C.accentDeep, 0.5)}`,
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    fontFamily: FONT,
                }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 id={ORGCHART_EDITOR_TITLE_ID} className="font-display" style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink }}>Editar Organograma</h2>
                        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: C.ink2 }}>Edite textos sem precisar alterar código.</p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Fechar"
                        style={{
                            width: 44, height: 44, borderRadius: 10, background: 'none', border: 'none',
                            color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 24 }} aria-hidden="true">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${C.line}` }}>
                    {tabBtn('ceo', 'CEO', 'workspace_premium')}
                    {tabBtn('areas', 'Áreas', 'account_tree')}
                    {tabBtn('json', 'JSON', 'code')}
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {activeTab === 'ceo' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: C.ink2, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: MONO, marginBottom: 6 }}>Nome do CEO</label>
                                <input
                                    value={draft.root.name}
                                    onChange={e => updateRoot('name', e.target.value)}
                                    style={{
                                        width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 10,
                                        border: `1px solid ${C.line}`, background: C.surfaceSoft, color: C.ink, fontSize: 14, fontFamily: FONT,
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: C.ink2, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: MONO, marginBottom: 6 }}>Cargo</label>
                                <input
                                    value={draft.root.role}
                                    onChange={e => updateRoot('role', e.target.value)}
                                    style={{
                                        width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 10,
                                        border: `1px solid ${C.line}`, background: C.surfaceSoft, color: C.ink, fontSize: 14, fontFamily: FONT,
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: C.ink2, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: MONO, marginBottom: 6 }}>URL da foto (opcional)</label>
                                <input
                                    value={draft.root.photo || ''}
                                    onChange={e => updateRoot('photo', e.target.value || null)}
                                    placeholder="Deixe em branco para usar avatar padrão"
                                    style={{
                                        width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 10,
                                        border: `1px solid ${C.line}`, background: C.surfaceSoft, color: C.ink, fontSize: 14, fontFamily: FONT,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'areas' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {draft.areas.map((area, idx) => (
                                <div key={idx} style={{ border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, background: C.surfaceSoft }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.accentDeep, fontFamily: MONO }}>ÁREA {idx + 1}</p>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button onClick={() => moveArea(idx, -1)} disabled={idx === 0} title="Mover para esquerda" style={{ padding: 4, border: 'none', background: 'transparent', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? C.line : C.muted }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                                            </button>
                                            <button onClick={() => moveArea(idx, 1)} disabled={idx === draft.areas.length - 1} title="Mover para direita" style={{ padding: 4, border: 'none', background: 'transparent', cursor: idx === draft.areas.length - 1 ? 'not-allowed' : 'pointer', color: idx === draft.areas.length - 1 ? C.line : C.muted }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: C.ink2, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: MONO, marginBottom: 4 }}>Título</label>
                                            <input
                                                value={area.title}
                                                onChange={e => updateArea(idx, 'title', e.target.value)}
                                                style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, background: C.surface, color: C.ink, fontSize: 13, fontFamily: FONT }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: C.ink2, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: MONO, marginBottom: 4 }}>Responsável</label>
                                            <input
                                                value={area.name || ''}
                                                onChange={e => updateArea(idx, 'name', e.target.value || null)}
                                                style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, background: C.surface, color: C.ink, fontSize: 13, fontFamily: FONT }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: C.ink2, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: MONO, marginBottom: 4 }}>Ícone (Material Symbol)</label>
                                            <input
                                                value={area.icon}
                                                onChange={e => updateArea(idx, 'icon', e.target.value)}
                                                style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, background: C.surface, color: C.ink, fontSize: 13, fontFamily: FONT }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <input
                                                id={`staff-${idx}`}
                                                type="checkbox"
                                                checked={!!area.isStaff}
                                                onChange={e => updateArea(idx, 'isStaff', e.target.checked)}
                                                style={{ width: 18, height: 18, accentColor: C.accent, cursor: 'pointer' }}
                                            />
                                            <label htmlFor={`staff-${idx}`} style={{ fontSize: 13, fontWeight: 700, color: C.ink2, cursor: 'pointer' }}>Área de staff</label>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: C.ink2, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: MONO, marginBottom: 8 }}>Sub-setores</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {area.children.map((child, cidx) => (
                                                <div key={cidx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <input
                                                        value={child}
                                                        onChange={e => updateChild(idx, cidx, e.target.value)}
                                                        style={{ flex: 1, boxSizing: 'border-box', padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, background: C.surface, color: C.ink, fontSize: 13, fontFamily: FONT }}
                                                    />
                                                    <button onClick={() => removeChild(idx, cidx)} style={{ padding: 8, borderRadius: 8, border: 'none', background: C.dangerSoft, color: C.danger, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={() => addChild(idx)} style={{ alignSelf: 'flex-start', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.accent}`, background: C.accentSoft, color: C.accentDeep, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                                                Adicionar sub-setor
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'json' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <p style={{ margin: 0, fontSize: 13, color: C.ink2 }}>Exporte o JSON, edite em qualquer editor e reimporte.</p>
                            <textarea
                                readOnly
                                value={JSON.stringify(draft, null, 2)}
                                style={{
                                    width: '100%', height: 240, boxSizing: 'border-box', resize: 'vertical',
                                    fontFamily: MONO, fontSize: 12, padding: 12, borderRadius: 10,
                                    border: `1px solid ${C.line}`, background: C.surfaceSoft, color: C.ink,
                                }}
                            />
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <button onClick={exportJson} style={{ minHeight: 44, padding: '10px 16px', borderRadius: 10, border: 'none', background: C.accent, color: C.onAccent, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                                    Exportar JSON
                                </button>
                                <label style={{ minHeight: 44, boxSizing: 'border-box', padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${C.accent}`, background: C.accentSoft, color: C.accentDeep, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
                                    Importar JSON
                                    <input type="file" accept="application/json" onChange={importJson} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={onReset} style={{ minHeight: 44, padding: '10px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: C.ink2, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        Restaurar padrão
                    </button>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={onClose} style={{ minHeight: 44, padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.line}`, background: C.surface, color: C.ink, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            Cancelar
                        </button>
                        <button onClick={() => onSave(draft)} style={{ minHeight: 44, padding: '10px 18px', borderRadius: 10, border: 'none', background: C.accent, color: C.onAccent, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            Salvar alterações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
