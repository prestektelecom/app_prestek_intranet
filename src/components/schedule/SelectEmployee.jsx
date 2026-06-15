import React from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';

export default function SelectEmployee({ label, value, onChange, options, allowEmpty }) {
    const C = useBentoTheme();
    return (
        <label className="flex flex-col gap-2">
            <span className="text-xs sm:text-[10px] font-black uppercase text-[#475467] tracking-widest flex items-center gap-1.5 ml-1">
                {label} {allowEmpty && <span className="text-[8px] opacity-60 font-medium">(Opcional)</span>}
            </span>
            <div className="relative group">
                <select 
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#E4ECF5] bg-[#F7FAFD] px-3 py-3 sm:px-4 sm:py-3.5 pr-10 text-[#0B1B2E] text-sm sm:text-base focus:ring-2 focus:ring-[#4A9EF5] focus:border-[#4A9EF5] outline-none cursor-pointer font-bold transition-all shadow-sm group-hover:bg-white"
                >
                    <option value="">-- Não Atribuído --</option>
                    {options.map(func => (
                        <option key={func.funcionario_id} value={func.funcionario_id}>
                            {func.funcionario_nome}
                        </option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#475467] transition-transform group-hover:translate-y-[-40%] group-hover:text-[#4A9EF5]">expand_more</span>
            </div>
        </label>
    );
}