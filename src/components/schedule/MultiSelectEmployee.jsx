import React, { useState, useMemo } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';

export default function MultiSelectEmployee({
    values,
    onChange,
    options,
    allowEmpty,
    idField = 'funcionario_id',
    nameField = 'funcionario_nome',
}) {
    const C = useBentoTheme();
    const [search, setSearch] = useState('');

    const getId = (opt) => String(opt[idField] ?? opt.id ?? '');
    const getName = (opt) => opt[nameField] ?? opt.nome ?? '';

    const filtered = useMemo(() => {
        if (!search.trim()) return options;
        const term = search.toLowerCase();
        return options.filter(o => getName(o).toLowerCase().includes(term));
    }, [options, search, nameField]);

    const toggleValue = (val) => {
        if (values.includes(val)) {
            onChange(values.filter(v => v !== val));
        } else {
            onChange([...values, val]);
        }
    };

    const selectFiltered = () => {
        const filteredIds = filtered.map(o => getId(o));
        const merged = Array.from(new Set([...values, ...filteredIds]));
        onChange(merged);
    };

    const clearAll = () => onChange([]);

    const hasFiltered = search.trim().length > 0;
    const allFilteredSelected = filtered.length > 0 && filtered.every(o => values.includes(getId(o)));

    return (
        <div className="flex flex-col gap-1">
            {/* Busca */}
            <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[#8896A8] text-[15px]">search</span>
                <input
                    type="text"
                    placeholder="Buscar nome..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-[#F7FAFD] border border-transparent rounded-lg py-1.5 pl-7 pr-7 text-xs text-[#0B1B2E] focus:border-[#4A9EF5] focus:ring-1 focus:ring-[#4A9EF5] focus:outline-none placeholder-[#8896A8]/50 transition-all"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8896A8] hover:text-[#0B1B2E] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                )}
            </div>

            {/* Ações rápidas */}
            <div className="flex items-center justify-between px-0.5">
                {hasFiltered && !allFilteredSelected && (
                    <button
                        type="button"
                        onClick={selectFiltered}
                        className="text-[10px] text-[#4A9EF5] font-bold hover:underline"
                    >
                        Selecionar {filtered.length} resultado{filtered.length > 1 ? 's' : ''}
                    </button>
                )}
                {(allowEmpty || true) && values.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="text-[10px] text-[#E84545] font-bold hover:underline ml-auto"
                    >
                        Limpar
                    </button>
                )}
            </div>

            {/* Lista */}
            <div className="rounded-lg border border-[#E4ECF5] bg-[#F7FAFD] p-1.5 max-h-44 overflow-y-auto">
                <div className="flex flex-col gap-0.5">
                    {filtered.length === 0 ? (
                        <div className="text-xs text-[#8896A8] italic text-center py-2">Nenhum resultado.</div>
                    ) : (
                        filtered.map(opt => {
                            const id = getId(opt);
                            const name = getName(opt);
                            return (
                                <label key={id} className="flex items-center gap-2 cursor-pointer hover:bg-[#EAF4FF] px-1.5 py-1 rounded-md transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={values.includes(id)}
                                        onChange={() => toggleValue(id)}
                                        className="w-4 h-4 rounded border-[#E4ECF5] text-[#4A9EF5] focus:ring-[#4A9EF5] shrink-0"
                                    />
                                    <span className="font-medium text-[#0B1B2E] text-xs leading-tight">{name}</span>
                                </label>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Badges dos selecionados */}
            {values.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                    {values.map(val => {
                        const opt = options.find(o => getId(o) === val);
                        if (!opt) return null;
                        const name = getName(opt);
                        const parts = name.split(' ');
                        const shortName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
                        return (
                            <span key={val} className="text-[10px] bg-[#EAF4FF] text-[#4A9EF5] px-2 py-0.5 rounded-full font-bold">
                                {shortName}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}