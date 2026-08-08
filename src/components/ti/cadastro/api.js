// Acesso às rotas de TI. Todas exigem o cabeçalho de admin — mesmo mecanismo
// que AdminDashboard.jsx já usa (`user?.email` contra usuarios_perfil.is_admin).

export const cabecalhoAdmin = (user) => ({ 'x-admin-email': user?.email || '' });

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
