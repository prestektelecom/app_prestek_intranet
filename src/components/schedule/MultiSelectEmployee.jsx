import React, { useState, useMemo } from 'react';

export default function MultiSelectEmployee({
    values,
    onChange,
    options,
    allowEmpty,
    idField = 'funcionario_id',
    nameField = 'funcionario_nome',
}) {
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
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-secondary text-[15px]">search</span>
                <input
                    type="text"
                    placeholder="Buscar nome..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-surface-container-low border border-transparent rounded-lg py-1.5 pl-7 pr-7 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none placeholder-secondary/50 transition-all"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
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
                        className="text-[10px] text-primary font-bold hover:underline"
                    >
                        Selecionar {filtered.length} resultado{filtered.length > 1 ? 's' : ''}
                    </button>
                )}
                {(allowEmpty || true) && values.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="text-[10px] text-red-500 font-bold hover:underline ml-auto"
                    >
                        Limpar
                    </button>
                )}
            </div>

            {/* Lista */}
            <div className="rounded-lg border border-surface-container-high bg-surface-container-low p-1.5 max-h-44 overflow-y-auto">
                <div className="flex flex-col gap-0.5">
                    {filtered.length === 0 ? (
                        <div className="text-xs text-secondary italic text-center py-2">Nenhum resultado.</div>
                    ) : (
                        filtered.map(opt => {
                            const id = getId(opt);
                            const name = getName(opt);
                            return (
                                <label key={id} className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 px-1.5 py-1 rounded-md transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={values.includes(id)}
                                        onChange={() => toggleValue(id)}
                                        className="w-4 h-4 rounded border-surface-container-high text-primary focus:ring-primary shrink-0"
                                    />
                                    <span className="font-medium text-on-surface text-xs leading-tight">{name}</span>
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
                            <span key={val} className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">
                                {shortName}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
