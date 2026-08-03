import React from 'react';

// Casca comum dos três modais de edição — os formulários variavam, a moldura não.
export const FIELD_CLASS =
    'w-full rounded-xl border border-border bg-surface px-4 py-2 text-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';

export const LABEL_CLASS = 'mb-1 block text-sm font-semibold text-foreground';

export const HINT_CLASS = 'mt-1 text-xs text-muted';

export function ModalField({ label, hint, children }) {
    return (
        <div>
            <label className={LABEL_CLASS}>{label}</label>
            {children}
            {hint && <p className={HINT_CLASS}>{hint}</p>}
        </div>
    );
}

export default function ModalShell({ title, onClose, onSave, isSaving = false, saveLabel = 'Salvar Alterações', children }) {
    return (
        // z-[1100] fica acima do Header e da Sidebar (ambos z-1000), senão o
        // header continua opaco por cima do overlay como uma barra solta.
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl duration-200 animate-in fade-in zoom-in">
                <div className="border-b border-border p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">{title}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Fechar"
                            className="cursor-pointer text-muted transition-colors hover:text-[var(--accent)]"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 p-6">{children}</div>

                <div className="flex justify-end gap-3 border-t border-border bg-background p-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-muted transition-all hover:bg-surface-raised"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={isSaving}
                        className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#9A3412] to-[#EC7D23] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(236,125,35,0.25)] transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSaving ? (
                            <><span className="material-symbols-outlined animate-spin text-sm">autorenew</span> Salvando...</>
                        ) : saveLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
