import React from 'react';

export default function MultiSelectEmployee({ label, values, onChange, options, allowEmpty }) {
    const toggleValue = (val) => {
        if (values.includes(val)) {
            onChange(values.filter(v => v !== val));
        } else {
            onChange([...values, val]);
        }
    };
    
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between ml-0.5">
                <span className="text-[10px] font-black uppercase text-secondary tracking-widest">
                    {label}
                </span>
                {allowEmpty && values.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onChange([])}
                        className="text-[10px] text-red-500 font-bold hover:underline"
                    >
                        Limpar
                    </button>
                )}
            </div>
            <div className="rounded-lg border border-surface-container-high bg-surface-container-low p-1.5 max-h-28 overflow-y-auto">
                <div className="flex flex-col gap-0.5">
                    {options.map(func => (
                        <label key={func.funcionario_id} className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 px-1.5 py-1 rounded-md transition-colors">
                            <input
                                type="checkbox"
                                checked={values.includes(String(func.funcionario_id))}
                                onChange={() => toggleValue(String(func.funcionario_id))}
                                className="w-4 h-4 rounded border-surface-container-high text-primary focus:ring-primary shrink-0"
                            />
                            <span className="font-medium text-on-surface text-xs leading-tight">{func.funcionario_nome}</span>
                        </label>
                    ))}
                </div>
            </div>
            {values.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                    {values.map(val => {
                        const func = options.find(o => String(o.funcionario_id) === val);
                        return func ? (
                            <span key={val} className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">
                                {func.funcionario_nome.split(' ')[0]}
                            </span>
                        ) : null;
                    })}
                </div>
            )}
        </div>
    );
}
