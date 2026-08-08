import { useCallback, useEffect, useState } from 'react';
import { obter } from './cadastro/api';

const VAZIO = { filiais: [], departamentos: [], funcoes: [], grupos: [], contas: [] };

/**
 * Carrega as listas de referência do cadastro de colaborador num round-trip.
 *
 * `derivados` nomeia as listas que NÃO vêm de um cadastro próprio do IXC — os
 * recursos `fl_funcoes`, `usuarios_grupo` e `grupo` não estão disponíveis nesta
 * instalação, então funções e grupos são inferidos do uso real em
 * `funcionarios`/`usuarios`, e contas são o subconjunto de
 * `planejamento_analitico` efetivamente em uso.
 *
 * A UI precisa exibir esse aviso: um valor pode existir no IXC sem que nenhum
 * colaborador atual o utilize, e nesse caso não aparece na lista.
 */
export default function useTaxonomiasIxc(user) {
    const [taxonomias, setTaxonomias] = useState(VAZIO);
    const [derivados, setDerivados] = useState([]);
    const [vazios, setVazios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const dados = await obter('/api/ti/colaborador/taxonomias', user);
            setTaxonomias({ ...VAZIO, ...dados.taxonomias });
            setDerivados(dados.derivados || []);
            setVazios(dados.vazios || []);
        } catch (e) {
            setErro(e.message);
            setTaxonomias(VAZIO);
        } finally {
            setCarregando(false);
        }
    }, [user]);

    useEffect(() => { carregar(); }, [carregar]);

    return { taxonomias, derivados, vazios, carregando, erro, recarregar: carregar };
}
