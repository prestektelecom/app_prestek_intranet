import React from 'react';

export default function SelectEmployee({ label, value, onChange, options, allowEmpty }) {
    return (
        <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-[10px] font-black uppercase text-secondary tracking-widest flex items-center gap-1.5 ml-1">
                {label} {allowEmpty && <span className="text-[8px] opacity-60 font-medium">(Opcional)</span>}
            </span>
            <div className="relative group">
                <select 
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-surface-container-high bg-surface-container-low px-3 py-3 sm:px-4 sm:py-3.5 pr-10 text-on-surface text-sm sm:text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer font-bold transition-all shadow-sm group-hover:bg-white dark:group-hover:bg-surface-container-lowest"
                >
                    <option value="">-- Não Atribuído --</option>
                    {options.map(func => (
                        <option key={func.funcionario_id} value={func.funcionario_id}>
                            {func.funcionario_nome}
                        </option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary transition-transform group-hover:translate-y-[-40%] group-hover:text-primary">expand_more</span>
            </div>
        </label>
    );
}
