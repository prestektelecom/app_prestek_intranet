import React, { useState } from 'react';
import MultiSelectEmployee from './MultiSelectEmployee';
import { useBentoTheme } from '../../hooks/useBentoTheme';

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
    const C = useBentoTheme();
    const [validationError, setValidationError] = useState('');
    const [historicoOpen, setHistoricoOpen] = useState(false);
    const [n1Open, setN1Open] = useState(true);
    const [n2Open, setN2Open] = useState(true);
    const [supOpen, setSupOpen] = useState(true);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.n1_ids || formData.n1_ids.length === 0) {
            setValidationError('É necessário selecionar ao menos um colaborador no N1.');
            return;
        }
        setValidationError('');
        onSave();
    };

    const SectionHeader = ({ label, count, isOpen: open, onToggle, icon }) => (
        <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center justify-between px-1 py-1 group"
        >
            <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#8896A8]">{icon}</span>
                <span className="text-[10px] font-black uppercase text-[#8896A8] tracking-widest">{label}</span>
                {count > 0 && (
                    <span className="text-[9px] bg-[#EAF4FF] text-[#4A9EF5] px-1.5 py-0.5 rounded-full font-black">
                        {count} selecionado{count > 1 ? 's' : ''}
                    </span>
                )}
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#8896A8] group-hover:text-[#4A9EF5] transition-colors">
                {open ? 'expand_less' : 'expand_more'}
            </span>
        </button>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B1B2E]/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md border border-[#E4ECF5] flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#E4ECF5] flex justify-between items-center bg-[#F7FAFD] shrink-0 rounded-t-3xl">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#4A9EF5] text-[20px]">edit_calendar</span>
                        <h2 className="text-base font-black text-[#0B1B2E]">Gerenciar Plantão</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#8896A8] hover:text-[#E84545] transition-colors p-1 rounded-full hover:bg-[var(--danger-soft)]"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto flex-1 min-h-0">
                    <div className="p-3 flex flex-col gap-3">
                        {/* Data */}
                        <div className="flex gap-2 items-center bg-[#EAF4FF] text-[#1F5BA8] px-3 py-2 rounded-lg font-black text-xs border border-[#4A9EF5]/20">
                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            <span>Data: {selectedDate?.split('-').reverse().join('/')}</span>
                        </div>

                        {/* Aviso de plantão existente */}
                        {existingPlantao && (
                            <div className="flex flex-col gap-1.5 bg-[var(--warning-soft)] border border-[var(--warning-bento)]/30 text-[var(--warning-bento)] px-3 py-2.5 rounded-lg text-xs">
                                <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-[10px]">
                                    <span className="material-symbols-outlined text-[16px]">warning</span>
                                    Já existe um plantão — salvar irá substituir.
                                </div>
                            </div>
                        )}

                        {/* Erro de validação inline */}
                        {validationError && (
                            <div className="flex items-center gap-1.5 bg-[var(--danger-soft)] border border-[var(--danger-bento)]/30 text-[var(--danger-bento)] px-3 py-2 rounded-lg text-xs font-bold">
                                <span className="material-symbols-outlined text-[16px]">error</span>
                                {validationError}
                            </div>
                        )}

                        {/* N1 — accordion */}
                        <div className="flex flex-col gap-1 border border-[#E4ECF5] rounded-xl p-2">
                            <SectionHeader
                                label="N1 - ATENDIMENTO/NOC"
                                count={formData.n1_ids?.length || 0}
                                isOpen={n1Open}
                                onToggle={() => setN1Open(v => !v)}
                                icon="support_agent"
                            />
                            {n1Open && (
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
                            )}
                        </div>

                        {/* N2 — accordion */}
                        <div className="flex flex-col gap-1 border border-[#E4ECF5] rounded-xl p-2">
                            <SectionHeader
                                label="N2 - SUPORTE/SERVIÇOS"
                                count={formData.n2_ids?.length || 0}
                                isOpen={n2Open}
                                onToggle={() => setN2Open(v => !v)}
                                icon="build"
                            />
                            {n2Open && (
                                <MultiSelectEmployee
                                    values={formData.n2_ids}
                                    onChange={(vals) => setFormData({ ...formData, n2_ids: vals })}
                                    options={colaboradoresSuporteN2}
                                    idField="funcionario_id"
                                    nameField="funcionario_nome"
                                    allowEmpty
                                />
                            )}
                        </div>

                        {/* Supervisão — accordion */}
                        <div className="flex flex-col gap-1 border border-[#E4ECF5] rounded-xl p-2">
                            <SectionHeader
                                label="SUPERVISÃO"
                                count={formData.gerente_ids?.length || 0}
                                isOpen={supOpen}
                                onToggle={() => setSupOpen(v => !v)}
                                icon="manage_accounts"
                            />
                            {supOpen && (
                                <MultiSelectEmployee
                                    values={formData.gerente_ids}
                                    onChange={(vals) => setFormData({ ...formData, gerente_ids: vals })}
                                    options={funcionarios}
                                    idField="id"
                                    nameField="funcionario_nome"
                                    allowEmpty
                                />
                            )}
                        </div>

                        {/* Histórico — accordion colapsável, fechado por padrão */}
                        <div className="flex flex-col gap-1 border border-[#E4ECF5] rounded-xl p-2">
                            <button
                                type="button"
                                onClick={() => setHistoricoOpen(v => !v)}
                                className="w-full flex items-center justify-between px-1 py-1 group"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px] text-[#8896A8]">history</span>
                                    <span className="text-[10px] font-black uppercase text-[#8896A8] tracking-widest">
                                        Histórico de Alterações
                                    </span>
                                    {historico.length > 0 && (
                                        <span className="text-[9px] bg-[#EAF4FF] text-[#4A9EF5] px-1.5 py-0.5 rounded-full font-black">
                                            {historico.length}
                                        </span>
                                    )}
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-[#8896A8] group-hover:text-[#4A9EF5] transition-colors">
                                    {historicoOpen ? 'expand_less' : 'expand_more'}
                                </span>
                            </button>

                            {historicoOpen && (
                                loadingHistorico ? (
                                    <div className="text-xs text-[#8896A8] text-center py-3 animate-pulse">Carregando histórico...</div>
                                ) : historico.length === 0 ? (
                                    <div className="text-xs text-[#8896A8] italic text-center py-3 bg-[#F7FAFD] rounded-lg border border-[#E4ECF5]/50">
                                        Nenhuma alteração registrada para esta data.
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-0.5 mt-1">
                                        {historico.map((h) => {
                                            const dt = new Date(h.alterado_em);
                                            const fmt = dt.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
                                            return (
                                                <div key={h.id} className="bg-[#F7FAFD] rounded-lg border border-[#E4ECF5]/60 p-2 flex flex-col gap-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px] text-[#4A9EF5]">manage_accounts</span>
                                                            <span className="text-[10px] font-black text-[#0B1B2E]">{h.admin_nome || 'Desconhecido'}</span>
                                                        </div>
                                                        <span className="text-[9px] text-[#8896A8] font-medium">{fmt}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] text-[#8896A8] mt-0.5">
                                                        <div className="col-span-2 font-black text-[9px] uppercase tracking-wider text-[#8896A8]/70 mb-0.5">Antes → Depois</div>
                                                        <div><span className="font-black text-[#0B1B2E]/60">N1:</span> {h.n1_anterior || '—'}</div>
                                                        <div><span className="font-black text-[#4A9EF5]">N1:</span> {h.n1_novo || '—'}</div>
                                                        <div><span className="font-black text-[#0B1B2E]/60">N2:</span> {h.n2_anterior || '—'}</div>
                                                        <div><span className="font-black text-[#4A9EF5]">N2:</span> {h.n2_novo || '—'}</div>
                                                        <div><span className="font-black text-[#0B1B2E]/60">Sup:</span> {h.gerente_anterior || '—'}</div>
                                                        <div><span className="font-black text-[#4A9EF5]">Sup:</span> {h.gerente_novo || '—'}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="shrink-0 flex gap-2 p-3 pt-2 border-t border-[#E4ECF5] bg-white">
                        {existingPlantao && (
                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={salvando || deletando}
                                className="px-3 py-2 bg-[var(--danger-soft)] text-[var(--danger-bento)] font-bold rounded-xl hover:bg-[#E84545]/10 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                <span>Excluir</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-3 py-2 bg-[#F7FAFD] text-[#0B1B2E] font-bold rounded-xl hover:bg-[#EAF4FF] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={salvando || deletando}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white font-black rounded-xl hover:brightness-110 transition-colors shadow-md shadow-[#4A9EF5]/30 flex items-center justify-center gap-1.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
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