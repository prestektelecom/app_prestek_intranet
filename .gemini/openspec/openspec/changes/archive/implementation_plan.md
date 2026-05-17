# Corrigir Presença Online após Logout

## Problema

Quando um usuário clica em **Sair**, o sistema apenas apaga dados do `localStorage`/`sessionStorage` e redireciona para o login — mas **não notifica o backend**. A coluna `ultima_atividade` na tabela `usuarios_perfil` permanece com o timestamp da última atualização de presença.

O endpoint `/api/colaboradores/online` considera "online" quem teve atividade nos últimos **5 minutos**. Então o usuário que saiu fica visível por até 5 minutos depois do logout.

---

## Diagnóstico (fluxo atual)

```
[Frontend] Usuário clica "Sair"
    → localStorage.removeItem + sessionStorage.removeItem
    → setCurrentView('login')
    ← NÃO avisa o backend

[Backend] ultima_atividade = ainda tem o valor antigo
    → /api/colaboradores/online retorna o usuário por até 5 min
```

```
[usePresence.js] heartbeat a cada 2 min → POST /api/presenca/:id
[Backend] /api/presenca/:id → UPDATE usuarios_perfil SET ultima_atividade = NOW()
[Backend] /api/colaboradores/online → WHERE ultima_atividade > NOW() - interval '5 minutes'
```

---

## Solução Proposta

### 1. Novo endpoint de logout no backend

**`POST /api/presenca/:usuarioId/logout`**

Zera a `ultima_atividade` para um valor muito antigo (ou `NULL`), removendo o usuário imediatamente da lista de online:

```js
app.post('/api/presenca/:usuarioId/logout', async (req, res) => {
    await pool.query(
        "UPDATE usuarios_perfil SET ultima_atividade = '1970-01-01' WHERE usuario_id = $1",
        [usuarioId]
    );
    return res.json({ sucesso: true });
});
```

### 2. Chamar o endpoint no botão "Sair" (Header.jsx)

Antes de limpar o storage e redirecionar, disparar a chamada:

```js
// Header.jsx — botão Sair
onClick={async () => {
    // Notifica o backend antes de sair
    if (user?.id) {
        try {
            await fetch(`/api/presenca/${user.id}/logout`, { method: 'POST' });
        } catch (_) {} // falha silenciosa — o timeout de 5 min cobre como fallback
    }
    localStorage.removeItem('@Stitch:user');
    localStorage.removeItem('@Stitch:currentView');
    sessionStorage.removeItem('@Stitch:user');
    sessionStorage.removeItem('@Stitch:currentView');
    setCurrentView('login');
}}
```

### 3. Fallback via `navigator.sendBeacon` (fechamento de aba)

Para cobrir o caso onde o usuário fecha a aba/navegador sem clicar em Sair, adicionar um listener de `beforeunload` usando a **BeaconAPI** (fire-and-forget que o browser envia mesmo ao fechar):

Isso será adicionado no hook `usePresence.js`:

```js
useEffect(() => {
    if (!user?.id) return;
    const handleUnload = () => {
        navigator.sendBeacon(`/api/presenca/${user.id}/logout`);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
}, [user?.id]);
```

> [!NOTE]
> `sendBeacon` é assíncrono e não garantido em 100% dos browsers, mas é o mecanismo recomendado para essa finalidade. O timeout de 5 min do backend funciona como fallback definitivo.

---

## Arquivos a Modificar

### Backend

#### [MODIFY] [server.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/backend/server.js)
- Adicionar rota `POST /api/presenca/:usuarioId/logout`
- Zerar `ultima_atividade` para remover imediatamente da lista de online

---

### Frontend

#### [MODIFY] [Header.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Header.jsx)
- Tornar o `onClick` do botão Sair assíncrono
- Chamar `POST /api/presenca/:id/logout` antes de limpar o storage

#### [MODIFY] [usePresence.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/hooks/usePresence.js)
- Adicionar listener `beforeunload` com `navigator.sendBeacon` para cobrir fechamento de aba

---

## Opção Adicional: Reduzir o timeout do backend

> [!IMPORTANT]
> O backend atualmente considera "online" quem teve atividade nos últimos **5 minutos**, mas o heartbeat é a cada **2 minutos**. Isso significa que mesmo sem logout, um usuário que fecha a aba demora até 5 min para sumir.
>
> Podemos reduzir o intervalo de `5 minutes` para **3 minutes** no backend (tempo razoável dado o heartbeat de 2 min + margem) para melhorar a responsividade geral.

---

## Verificação

1. Usuário A loga e aparece em "Disponibilidade da Equipe"
2. Usuário A clica "Sair"
3. Usuário B (em outro browser) atualiza o dashboard → Usuário A some imediatamente
4. Fechar aba sem clicar "Sair" → após ≤3 min, o usuário some (via timeout ajustado)

---

## Questões Abertas

> [!IMPORTANT]
> **Deseja também reduzir o timeout de "5 minutos" para "3 minutos" no backend?**
> Isso deixa a lista mais precisa mesmo em casos de fechamento abrupto de aba.

