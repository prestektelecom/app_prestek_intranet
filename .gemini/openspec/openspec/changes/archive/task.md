# 🐛 Correção: Avatar do Usuário Aparecendo em Todos os Perfis

## Diagnóstico do Bug

**Causa raiz identificada:** A chave do `localStorage` que armazena o avatar (`stitch_profile_${safeId}`) pode colidir entre usuários distintos quando `safeId` é resolvido incorretamente como `'0000'`.

### Como o bug ocorre

```
safeId = func.id ?? user?.id ?? '0000'
```

Se `func.id` for `undefined` (funcionário não vinculado ao usuário IXC) e `user?.id` também for falsy, todos os usuários nessa condição usam a chave **`stitch_profile_0000`** — ou seja, o avatar salvo por um usuário é lido por todos que têm o mesmo `safeId` degenerado.

Adicionalmente, o `Header.jsx` tem um **polling de 1.500ms** que sincroniza o avatar do localStorage na sessão ativa, propagando o vazamento de forma contínua.

### Arquivos afetados

| Arquivo | Problema |
|---------|----------|
| `src/components/Header.jsx` (L52, L103) | `safeId` pode ser `'0000'`; polling lê chave genérica |
| `src/components/Configuracoes.jsx` (L40, L274) | Mesma resolução de `safeId`; salva com chave possivelmente inválida |
| `src/components/TeamAvailability.jsx` (L101) | Lê `stitch_profile_${user.funcionario?.id ?? user.id}` — dupla fonte de ID |

---

## Checklist de Correção

### 1. Validação de `safeId` antes de usar o localStorage
- `[ ]` **Header.jsx** — Bloquear o `useEffect` de sync do avatar se `safeId === '0000'` ou se for falsy/inválido
- `[ ]` **Configuracoes.jsx** — Bloquear leitura/escrita no localStorage se `safeId === '0000'`
- `[ ]` **TeamAvailability.jsx** — Usar mesma chave que Header/Configuracoes e validar antes de ler

### 2. Unificar a resolução de `safeId`
- `[ ]` Criar utilitário `resolveUserStorageKey(user)` em `src/utils/storageKey.js`
  - Prioridade: `user.funcionario?.id` → `user.id` → `null`
  - Retornar `null` se nenhum ID válido (nunca '0000')
- `[ ]` Substituir a resolução inline nos 3 componentes pelo utilitário

### 3. Proteção contra gravação com chave inválida
- `[ ]` Qualquer `localStorage.setItem('stitch_profile_...')` deve ser protegido por `if (storageKey) { ... }`

### 4. Limpeza de dados corrompidos (migração única)
- `[ ]` No carregamento do app (`App.jsx`), verificar se existe `stitch_profile_0000` no localStorage e removê-lo automaticamente

### 5. Testes de verificação
- `[ ]` Login com dois usuários diferentes (em abas separadas ou navegadores distintos) e verificar que os avatares são independentes
- `[ ]` Salvar avatar como Usuário A → verificar que Usuário B não herda o avatar

---

## Implementação proposta

### `src/utils/storageKey.js` (novo arquivo)
```js
/**
 * Retorna a chave de localStorage para o perfil do usuário.
 * Retorna null se não houver ID válido — nunca usa '0000'.
 */
export function resolveUserStorageKey(user) {
    const id = user?.funcionario?.id ?? user?.id;
    if (!id || String(id) === '0' || String(id) === '0000') return null;
    return `stitch_profile_${id}`;
}
```

### Mudança no `Header.jsx`
```diff
- const safeId = func.id ?? user?.id ?? '0000';
+ const safeId = func.id ?? user?.id ?? null;

  useEffect(() => {
-   if (!safeId || safeId === '0000') return;
+   if (!safeId) return;
    ...
  }, [safeId]);
```

### Mudança no `Configuracoes.jsx`
```diff
- const safeId = func.id ?? user?.id ?? '0000';
+ const safeId = func.id ?? user?.id ?? null;

  // No handleSave:
+ if (!safeId) return; // Nunca salvar sem ID válido
  localStorage.setItem(`stitch_profile_${safeId}`, ...);
```

### Limpeza em `App.jsx`
```js
// Executa uma vez ao montar — remove chave degenerada se existir
useEffect(() => {
    localStorage.removeItem('stitch_profile_0000');
}, []);
```

---

## Status

- `[ ]` Criar `src/utils/storageKey.js`
- `[ ]` Corrigir `Header.jsx`
- `[ ]` Corrigir `Configuracoes.jsx`
- `[ ]` Corrigir `TeamAvailability.jsx`
- `[ ]` Adicionar limpeza em `App.jsx`
- `[ ]` Verificar funcionamento com múltiplos usuários
