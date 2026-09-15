import React, { useEffect, useRef, useState } from 'react';
import { CAMPO, RING_ERRO } from './estilos';
import { obter } from './api';

/**
 * Type-ahead de cidade. Consulta /api/ti/colaborador/cidades, que já traz a
 * tabela inteira cacheada em memória. Nunca pré-seleciona com mais de um
 * resultado — a escolha é sempre explícita.
 *
 * Padrão ARIA Combobox de foco virtual: as opções nunca recebem foco real
 * (o foco fica sempre no input); a navegação por teclado move um destaque
 * lógico (`ativoIndex`) comunicado via `aria-activedescendant`.
 */
export default function CidadeCombobox({ id, rotuloId, valor, onChange, onBlur, onCidadeSelecionada, user, erro, obrigatorio, descritoPor }) {
    const [aberto, setAberto] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [opcoes, setOpcoes] = useState([]);
    const [erroBusca, setErroBusca] = useState('');
    const [ativoIndex, setAtivoIndex] = useState(-1);
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
            setAtivoIndex(-1);
            return;
        }

        setCarregando(true);
        setErroBusca('');

        timerRef.current = setTimeout(async () => {
            try {
                const dados = await obter(`/api/ti/colaborador/cidades?q=${encodeURIComponent(termo)}&limite=20`, user);
                setOpcoes(dados.cidades || []);
                setAberto(true);
                setAtivoIndex(-1);
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
        setAtivoIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (!aberto || opcoes.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setAtivoIndex(i => (i + 1) % opcoes.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setAtivoIndex(i => (i <= 0 ? opcoes.length - 1 : i - 1));
        } else if (e.key === 'Enter') {
            if (ativoIndex >= 0 && opcoes[ativoIndex]) {
                e.preventDefault();
                selecionar(opcoes[ativoIndex]);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setAberto(false);
            setAtivoIndex(-1);
        }
    };

    const listaId = `${id}-lista`;
    const opcaoId = (i) => `${id}-opcao-${i}`;

    return (
        <div ref={wrapperRef} className="relative">
            <input
                id={id}
                type="text"
                className={`${CAMPO} ${erro ? RING_ERRO : ''}`}
                value={valor}
                onChange={e => onChange(e.target.value)}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
                placeholder="Digite o nome da cidade"
                autoComplete="off"
                role="combobox"
                aria-autocomplete="list"
                aria-labelledby={rotuloId}
                aria-expanded={aberto}
                aria-haspopup="listbox"
                aria-controls={listaId}
                aria-activedescendant={aberto && ativoIndex >= 0 ? opcaoId(ativoIndex) : undefined}
                aria-required={obrigatorio || undefined}
                aria-invalid={erro || undefined}
                aria-describedby={descritoPor}
            />
            {carregando && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-faint">…</span>
            )}
            {aberto && (
                <ul
                    id={listaId}
                    role="listbox"
                    className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-surface shadow-lg"
                >
                    {erroBusca ? (
                        <li className="px-3 py-2 text-xs text-red-600">{erroBusca}</li>
                    ) : opcoes.length === 0 ? (
                        <li className="px-3 py-2 text-xs text-faint">Nenhuma cidade encontrada.</li>
                    ) : (
                        opcoes.map((c, i) => (
                            <li
                                key={c.id}
                                id={opcaoId(i)}
                                role="option"
                                aria-selected={i === ativoIndex}
                                onMouseDown={(e) => { e.preventDefault(); selecionar(c); }}
                                onMouseEnter={() => setAtivoIndex(i)}
                                className={`min-h-[44px] cursor-pointer px-3 py-2 text-left text-[13px] flex items-center ${
                                    i === ativoIndex ? 'bg-[var(--accent-soft)]' : 'hover:bg-surface-raised'
                                }`}
                            >
                                {c.nome} <span className="ml-1 text-faint">({c.uf})</span>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}
