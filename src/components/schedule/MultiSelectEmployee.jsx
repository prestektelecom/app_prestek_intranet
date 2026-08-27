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
    const getInitial = (name) => (name.trim()[0] || '?').toUpperCase();

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
        <div className="flex flex-col gap-1.5">
            {/* Busca */}
            <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-bento)] text-[16px]">search</span>
                <input
                    type="text"
                    placeholder="Buscar nome..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-[var(--surface-soft)] border border-transparent rounded-lg py-2.5 pl-8 pr-8 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none placeholder-[var(--muted-bento)]/70 transition-all"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch('')}
                        aria-label="Limpar busca"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--muted-bento)] hover:text-[var(--ink)] transition-colors p-1 rounded-full"
                    >
                        <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                )}
            </div>

            {/* Ações rápidas */}
            {(hasFiltered || values.length > 0) && (
                <div className="flex items-center justify-between px-0.5 min-h-[18px]">
                    {hasFiltered && !allFilteredSelected ? (
                        <button
                            type="button"
                            onClick={selectFiltered}
                            className="text-[11px] text-[var(--accent-dark)] font-bold hover:underline"
                        >
                            Selecionar {filtered.length} resultado{filtered.length > 1 ? 's' : ''}
                        </button>
                    ) : <span />}
                    {values.length > 0 && (
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-[11px] text-[var(--danger-strong)] font-bold hover:underline ml-auto"
                        >
                            Limpar seleção
                        </button>
                    )}
                </div>
            )}

            {/* Lista */}
            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-1.5 max-h-44 overflow-y-auto">
                <div className="flex flex-col gap-0.5">
                    {filtered.length === 0 ? (
                        <div className="text-xs text-[var(--muted-bento)] italic text-center py-3 px-2">
                            {hasFiltered ? `Nenhum nome encontrado para "${search.trim()}".` : 'Nenhum colaborador disponível.'}
                        </div>
                    ) : (
                        filtered.map(opt => {
                            const id = getId(opt);
                            const name = getName(opt);
                            const checked = values.includes(id);
                            return (
                                <label
                                    key={id}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-[var(--accent-soft)] px-1.5 py-2 rounded-md transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleValue(id)}
                                        className="w-4 h-4 rounded border-[var(--line)] text-[var(--accent-dark)] focus:ring-[var(--accent)] shrink-0"
                                    />
                                    <span className={`font-medium text-xs leading-tight ${checked ? 'text-[var(--ink)]' : 'text-[var(--ink)]/85'}`}>
                                        {name}
                                    </span>
                                </label>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chips dos selecionados (removíveis) */}
            {values.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {values.map(val => {
                        const opt = options.find(o => getId(o) === val);
                        if (!opt) return null;
                        const name = getName(opt);
                        const parts = name.trim().split(' ');
                        const shortName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
                        return (
                            <span
                                key={val}
                                className="flex items-center gap-1 text-[11px] bg-[var(--accent-soft)] text-[var(--accent-dark)] pl-1 pr-1.5 py-0.5 rounded-full font-bold"
                            >
                                <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-black shrink-0">
                                    {getInitial(name)}
                                </span>
                                {shortName}
                                <button
                                    type="button"
                                    onClick={() => toggleValue(val)}
                                    aria-label={`Remover ${name}`}
                                    className="hover:text-[var(--danger-strong)] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[13px] block">close</span>
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
