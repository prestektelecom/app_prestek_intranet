import React from 'react';
import ModalShell, { ModalField, FIELD_CLASS } from './ModalShell';

const ICONES = [
    ['router', 'Router'], ['swap_horiz', 'Swap Horizontal'], ['settings', 'Settings'],
    ['build', 'Build'], ['people', 'People'], ['info', 'Info'], ['password', 'Password'],
    ['lan', 'LAN'], ['dns', 'DNS'], ['wifi_tethering', 'Wi-Fi Tethering'],
    ['wifi_lock', 'Wi-Fi Lock'], ['swap_vertical_circle', 'Swap Circle'], ['add_task', 'Add Task'],
];

export default function TechServiceModal({ service, form, onChange, onClose, onSave }) {
    return (
        <ModalShell
            title={service?.id ? 'Editar Serviço Técnico' : 'Novo Serviço Técnico'}
            onClose={onClose}
            onSave={onSave}
        >
            <ModalField label="Serviço">
                <input type="text" value={form.service} onChange={(e) => onChange({ ...form, service: e.target.value })} className={FIELD_CLASS} />
            </ModalField>

            <ModalField label="Valor">
                <input type="text" value={form.value} onChange={(e) => onChange({ ...form, value: e.target.value })} placeholder="Ex: R$ 50,00" className={FIELD_CLASS} />
            </ModalField>

            <ModalField label="Prazo">
                <input type="text" value={form.deadline} onChange={(e) => onChange({ ...form, deadline: e.target.value })} placeholder="Ex: Até 5 dias úteis" className={FIELD_CLASS} />
            </ModalField>

            <ModalField label="Pagamento">
                <input type="text" value={form.payment} onChange={(e) => onChange({ ...form, payment: e.target.value })} placeholder="Ex: À vista ou 2x Boleto" className={FIELD_CLASS} />
            </ModalField>

            <ModalField label="Ícone">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                        <span className="material-symbols-outlined text-lg">{form.icon || 'build'}</span>
                    </div>
                    <select value={form.icon} onChange={(e) => onChange({ ...form, icon: e.target.value })} className={`flex-1 ${FIELD_CLASS}`}>
                        {ICONES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </div>
            </ModalField>
        </ModalShell>
    );
}
