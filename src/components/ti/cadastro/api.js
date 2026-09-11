// Acesso às rotas de TI. A identidade do admin agora vem do token de sessão
// (Authorization: Bearer, injetado globalmente em main.jsx), nunca de um
// cabeçalho vindo do cliente — ver G5 em GUIA-CORRECAO.md. Este helper fica
// mantido só para não quebrar as assinaturas de `obter`/`enviar` abaixo.
export const cabecalhoAdmin = () => ({});

/** GET com cabeçalho de admin e erro já desembrulhado no padrão do backend. */
export async function obter(url, user) {
    const res = await fetch(url, { headers: cabecalhoAdmin(user) });
    const dados = await res.json().catch(() => ({}));
    if (!res.ok || !dados.sucesso) {
        throw new Error(dados.erro || `Falha na requisição (HTTP ${res.status})`);
    }
    return dados;
}

/** POST JSON com cabeçalho de admin. */
export async function enviar(url, user, corpo) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { ...cabecalhoAdmin(user), 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
    });
    const dados = await res.json().catch(() => ({}));
    if (!res.ok || !dados.sucesso) {
        throw new Error(dados.erro || `Falha na requisição (HTTP ${res.status})`);
    }
    return dados;
}
