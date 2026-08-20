import React, { useEffect, useRef, useState } from 'react';
import { CAMPO, RING_ERRO } from './estilos';
import { obter } from './api';

/**
 * Type-ahead de cidade. Consulta /api/ti/colaborador/cidades, que já traz a
 * tabela inteira cacheada em memória. Nunca pré-seleciona com mais de um
 * resultado — a escolha é sempre explícita.
 */
export default function CidadeCombobox({ id, valor, onChange, onBlur, onCidadeSelecionada, user, erro }) {
    const [aberto, setAberto] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [opcoes, setOpcoes] = useState([]);
    const [erroBusca, setErroBusca] = useState('');
    const timerRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const fora = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setAberto(false);
                onBlur?.();
            }
        };
        document.addEventListener('mousedown', fora);
        return () => document.removeEventListener('mousedown', fora);
    }, [onBlur]);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        const termo = String(valor || '').trim();
        if (!termo || termo.length < 2) {
            setOpcoes([]);
            setAberto(false);
            return;
        }

        setCarregando(true);
        setErroBusca('');

        timerRef.current = setTimeout(async () => {
            try {
                const dados = await obter(`/api/ti/colaborador/cidades?q=${encodeURIComponent(termo)}&limite=20`, user);
                setOpcoes(dados.cidades || []);
                setAberto(true);
            } catch (e) {
                setErroBusca(e.message);
                setOpcoes([]);
                setAberto(true);
            } finally {
                setCarregando(false);
            }
        }, 250);

        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [valor, user]);

    const selecionar = (cidade) => {
        onChange(cidade.nome);
        onCidadeSelecionada?.(cidade);
        setAberto(false);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <input
                id={id}
                type="text"
                className={`${CAMPO} ${erro ? RING_ERRO : ''}`}
                value={valor}
                onChange={e => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder="Digite o nome da cidade"
                autoComplete="off"
                aria-expanded={aberto}
                aria-haspopup="listbox"
                aria-controls={`${id}-lista`}
            />
            {carregando && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted">…</span>
            )}
            {aberto && (
                <ul
                    id={`${id}-lista`}
                    role="listbox"
                    className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-surface shadow-lg"
                >
                    {erroBusca ? (
                        <li className="px-3 py-2 text-xs text-red-600">{erroBusca}</li>
                    ) : opcoes.length === 0 ? (
                        <li className="px-3 py-2 text-xs text-muted">Nenhuma cidade encontrada.</li>
                    ) : (
                        opcoes.map(c => (
                            <li key={c.id}>
                                <button
                                    type="button"
                                    role="option"
                                    className="w-full px-3 py-2 text-left text-[13px] hover:bg-surface-raised focus:bg-surface-raised focus:outline-none"
                                    onClick={() => selecionar(c)}
                                >
                                    {c.nome} <span className="text-muted">({c.uf})</span>
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}
