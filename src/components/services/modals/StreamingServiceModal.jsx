import React from 'react';
import ModalShell, { ModalField, FIELD_CLASS } from './ModalShell';

const ICONES = [
    ['play_circle', 'Play Circle'], ['smart_display', 'Smart Display'], ['movie', 'Movie'],
    ['school', 'School'], ['sports_soccer', 'Sports'], ['tv', 'TV'], ['subscriptions', 'Subscriptions'],
];

export default function StreamingServiceModal({ service, form, onChange, onClose, onSave }) {
    return (
        <ModalShell
            title={service?.id ? 'Editar Pacote de Streaming' : 'Novo Pacote de Streaming'}
            onClose={onClose}
            onSave={onSave}
        >
            <ModalField label="Pacote">
                <input type="text" value={form.service} onChange={(e) => onChange({ ...form, service: e.target.value })} placeholder="Ex: LEVEDUCA+WATCH+PARAMOUNT" className={FIELD_CLASS} />
            </ModalField>

            <ModalField label="Valor Mensal">
                <input type="text" value={form.value} onChange={(e) => onChange({ ...form, value: e.target.value })} placeholder="Ex: R$ 19,90" className={FIELD_CLASS} />
            </ModalField>

            <ModalField label="Período">
                <input type="text" value={form.deadline} onChange={(e) => onChange({ ...form, deadline: e.target.value })} placeholder="Ex: Mensal" className={FIELD_CLASS} />
            </ModalField>

            <ModalField label="Ícone">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                        <span className="material-symbols-outlined text-lg">{form.icon || 'play_circle'}</span>
                    </div>
                    <select value={form.icon} onChange={(e) => onChange({ ...form, icon: e.target.value })} className={`flex-1 ${FIELD_CLASS}`}>
                        {ICONES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </div>
            </ModalField>
        </ModalShell>
    );
}
