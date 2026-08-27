import React, { useState, useEffect } from 'react';
import MultiSelectEmployee from './MultiSelectEmployee';
import { getDiaSemana } from '../../utils/dateHelpers';

const SECTIONS = {
    N1: 'n1',
    N2: 'n2',
    SUP: 'sup',
    HISTORICO: 'historico',
};

export default function ManagePlantaoModal({
    isOpen,
    selectedDate,
    existingPlantao,
    formData,
    setFormData,
    onSave,
    onDelete,
    onClose,
    historico,
    loadingHistorico,
    salvando,
    deletando,
    colaboradoresNoc,
    colaboradoresSuporteN2,
    funcionarios,
    getNamesFromIds,
}) {
    const [validationError, setValidationError] = useState('');
    const [openSection, setOpenSection] = useState(SECTIONS.N1);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const toggleSection = (key) => setOpenSection((prev) => (prev === key ? null : key));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.n1_ids || formData.n1_ids.length === 0) {
            setValidationError('É necessário selecionar ao menos um colaborador no N1.');
            setOpenSection(SECTIONS.N1);
            return;
        }
        setValidationError('');
        onSave();
    };

    const diaSemana = selectedDate ? getDiaSemana(selectedDate) : '';

    const SectionHeader = ({ sectionKey, label, count, icon }) => {
        const isOpenSection = openSection === sectionKey;
        return (
            <button
                type="button"
                onClick={() => toggleSection(sectionKey)}
                aria-expanded={isOpenSection}
                className="w-full flex items-center justify-between px-1.5 py-2 group rounded-lg"
            >
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[var(--muted-bento)]">{icon}</span>
                    <span className="text-[11px] font-black uppercase text-[var(--muted-bento)] tracking-widest">{label}</span>
                    {count > 0 && (
                        <span className="text-[10px] bg-[var(--accent-soft)] text-[var(--accent-dark)] px-1.5 py-0.5 rounded-full font-black">
                            {count} selecionado{count > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <span
                    className="material-symbols-outlined text-[18px] text-[var(--muted-bento)] group-hover:text-[var(--accent-dark)] transition-transform duration-200"
                    style={{ transform: isOpenSection ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    expand_more
                </span>
            </button>
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--ink)]/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="manage-plantao-title"
                className="bg-[var(--surface)] rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md border border-[var(--line)] flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--surface-soft)] shrink-0 rounded-t-3xl">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[var(--accent-dark)] text-[20px]">edit_calendar</span>
                        <h2 id="manage-plantao-title" className="text-base font-black text-[var(--ink)]">Gerenciar Plantão</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="text-[var(--muted-bento)] hover:text-[var(--danger-bento)] transition-colors p-2.5 rounded-full hover:bg-[var(--danger-soft)]"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto flex-1 min-h-0">
                    <div className="p-3 flex flex-col gap-3">
                        {/* Data */}
                        <div className="flex gap-2 items-center bg-[var(--accent-soft)] text-[var(--accent-deep)] px-3 py-2.5 rounded-lg border border-[var(--accent)]/20">
                            <span className="material-symbols-outlined text-[18px] shrink-0">calendar_today</span>
                            <span className="font-black text-xs">
                                {selectedDate?.split('-').reverse().join('/')}
                            </span>
                            {diaSemana && (
                                <span className="text-[11px] font-bold opacity-80">· {diaSemana}</span>
                            )}
                        </div>

                        {/* Aviso de plantão existente */}
                        {existingPlantao && (
                            <div className="flex flex-col gap-1.5 bg-[var(--warning-soft)] border border-[var(--warning-bento)]/30 text-[var(--warning-strong)] px-3 py-2.5 rounded-lg text-xs">
                                <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-[10px]">
                                    <span className="material-symbols-outlined text-[16px]">warning</span>
                                    Já existe um plantão — salvar irá substituir.
                                </div>
                            </div>
                        )}

                        {/* Erro de validação inline */}
                        {validationError && (
                            <div
                                role="alert"
                                className="flex items-center gap-1.5 bg-[var(--danger-soft)] border border-[var(--danger-bento)]/30 text-[var(--danger-strong)] px-3 py-2.5 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-200"
                            >
                                <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                                {validationError}
                            </div>
                        )}

                        {/* N1 */}
                        <div className="flex flex-col gap-1 border border-[var(--line)] rounded-xl p-1.5">
                            <SectionHeader sectionKey={SECTIONS.N1} label="N1 - Atendimento/NOC" count={formData.n1_ids?.length || 0} icon="support_agent" />
                            {openSection === SECTIONS.N1 && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200 px-0.5 pb-0.5">
                                    <MultiSelectEmployee
                                        values={formData.n1_ids}
                                        onChange={(vals) => {
                                            setFormData({ ...formData, n1_ids: vals });
                                            if (vals.length > 0) setValidationError('');
                                        }}
                                        options={colaboradoresNoc}
                                        idField="funcionario_id"
                                        nameField="funcionario_nome"
                                        allowEmpty
                                    />
                                </div>
                            )}
                        </div>

                        {/* N2 */}
                        <div className="flex flex-col gap-1 border border-[var(--line)] rounded-xl p-1.5">
                            <SectionHeader sectionKey={SECTIONS.N2} label="N2 - Suporte/Serviços" count={formData.n2_ids?.length || 0} icon="build" />
                            {openSection === SECTIONS.N2 && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200 px-0.5 pb-0.5">
                                    <MultiSelectEmployee
                                        values={formData.n2_ids}
                                        onChange={(vals) => setFormData({ ...formData, n2_ids: vals })}
                                        options={colaboradoresSuporteN2}
                                        idField="funcionario_id"
                                        nameField="funcionario_nome"
                                        allowEmpty
                                    />
                                </div>
                            )}
                        </div>

                        {/* Supervisão */}
                        <div className="flex flex-col gap-1 border border-[var(--line)] rounded-xl p-1.5">
                            <SectionHeader sectionKey={SECTIONS.SUP} label="Supervisão" count={formData.gerente_ids?.length || 0} icon="manage_accounts" />
                            {openSection === SECTIONS.SUP && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200 px-0.5 pb-0.5">
                                    <MultiSelectEmployee
                                        values={formData.gerente_ids}
                                        onChange={(vals) => setFormData({ ...formData, gerente_ids: vals })}
                                        options={funcionarios}
                                        idField="id"
                                        nameField="funcionario_nome"
                                        allowEmpty
                                    />
                                </div>
                            )}
                        </div>

                        {/* Histórico */}
                        <div className="flex flex-col gap-1 border border-[var(--line)] rounded-xl p-1.5">
                            <SectionHeader sectionKey={SECTIONS.HISTORICO} label="Histórico de Alterações" count={historico.length} icon="history" />
                            {openSection === SECTIONS.HISTORICO && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200 px-0.5 pb-0.5">
                                    {loadingHistorico ? (
                                        <div className="text-xs text-[var(--muted-bento)] text-center py-3 animate-pulse">Carregando histórico...</div>
                                    ) : historico.length === 0 ? (
                                        <div className="text-xs text-[var(--muted-bento)] italic text-center py-3 bg-[var(--surface-soft)] rounded-lg border border-[var(--line)]/50">
                                            Nenhuma alteração registrada para esta data.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-0.5 mt-1">
                                            {historico.map((h) => {
                                                const dt = new Date(h.alterado_em);
                                                const fmt = dt.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
                                                return (
                                                    <div key={h.id} className="bg-[var(--surface-soft)] rounded-lg border border-[var(--line)]/60 p-2 flex flex-col gap-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[12px] text-[var(--accent-dark)]">manage_accounts</span>
                                                                <span className="text-[10px] font-black text-[var(--ink)]">{h.admin_nome || 'Desconhecido'}</span>
                                                            </div>
                                                            <span className="text-[9px] text-[var(--muted-bento)] font-medium">{fmt}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] text-[var(--muted-bento)] mt-0.5">
                                                            <div className="col-span-2 font-black text-[9px] uppercase tracking-wider text-[var(--muted-bento)]/70 mb-0.5">Antes → Depois</div>
                                                            <div><span className="font-black text-[var(--ink)]/60">N1:</span> {h.n1_anterior || '—'}</div>
                                                            <div><span className="font-black text-[var(--accent-dark)]">N1:</span> {h.n1_novo || '—'}</div>
                                                            <div><span className="font-black text-[var(--ink)]/60">N2:</span> {h.n2_anterior || '—'}</div>
                                                            <div><span className="font-black text-[var(--accent-dark)]">N2:</span> {h.n2_novo || '—'}</div>
                                                            <div><span className="font-black text-[var(--ink)]/60">Sup:</span> {h.gerente_anterior || '—'}</div>
                                                            <div><span className="font-black text-[var(--accent-dark)]">Sup:</span> {h.gerente_novo || '—'}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="shrink-0 flex gap-2 p-3 pt-2 border-t border-[var(--line)] bg-[var(--surface)]">
                        {existingPlantao && (
                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={salvando || deletando}
                                className="px-3 py-2.5 bg-[var(--danger-soft)] text-[var(--danger-strong)] font-bold rounded-xl hover:brightness-95 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                <span>Excluir</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-3 py-2.5 bg-[var(--surface-soft)] text-[var(--ink)] font-bold rounded-xl hover:bg-[var(--accent-soft)] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={salvando || deletando}
                            className="flex-1 px-3 py-2.5 bg-gradient-to-r from-[var(--accent-deep)] to-[var(--accent)] text-white font-black rounded-xl hover:brightness-110 transition-colors shadow-md shadow-[var(--accent)]/30 flex items-center justify-center gap-1.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            <span>{salvando ? 'Salvando...' : 'Salvar'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
