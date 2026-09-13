import React from 'react';
import ModalShell, { ModalField, FIELD_CLASS } from './ModalShell';

export default function PlanEditModal({ plan, form, onChange, onClose, onSave, isSaving }) {
    return (
        <ModalShell title="Editar Plano" onClose={onClose} onSave={onSave} isSaving={isSaving}>
            <ModalField label="Nome do Serviço" hint="O nome é puxado automaticamente do IXC.">
                <input
                    type="text"
                    value={plan.descricao || ''}
                    disabled
                    className="w-full rounded-xl border border-border bg-background px-4 py-2 text-faint"
                />
            </ModalField>

            <ModalField label="Prazo de Instalação" hint="Este dado será salvo nativamente no banco de dados local.">
                <input
                    type="text"
                    value={form.prazo_instalacao}
                    onChange={(e) => onChange({ ...form, prazo_instalacao: e.target.value })}
                    placeholder="Ex: 3 Dias, Imediato, 5 Dias Úteis..."
                    className={FIELD_CLASS}
                />
            </ModalField>

            <ModalField label="Taxa de Instalação" hint="Texto livre — aparece no card exatamente como digitado (ex: Grátis, R$ 50,00).">
                <input
                    type="text"
                    value={form.taxa_instalacao}
                    onChange={(e) => onChange({ ...form, taxa_instalacao: e.target.value })}
                    placeholder="Ex: R$ 50,00 ou Grátis"
                    className={FIELD_CLASS}
                />
            </ModalField>
        </ModalShell>
    );
}
