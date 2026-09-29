# Documentação — Sistema de Permissões por Grupos

**Versão:** 1.0  
**Data:** 2026-09-28  
**Escopo:** Limitar tabs/abas do AdminDashboard e views do aplicativo por grupos de usuários  
**Arquivos principais:** `src/navigation.js`, `src/components/AdminDashboard.jsx`, `src/App.jsx`

---

## 1. Visão Geral

### Problema Atual

O sistema de permissões atual é **binário**: um usuário é `is_admin` (true/false). Se `is_admin === true`, o usuário tem acesso a **todas** as telas administrativas. Não há controle granular por grupos.

```
Usuario → is_admin: true  → acesso TOTAL a admin, ti, plantao-historico
Usuario → is_admin: false → NENHUM acesso a admin, ti, plantao-historico
```

### Objetivo

Permitir que determinados grupos vejam apenas as tabs/abas que lhes foram atribuídas, sem depender da flag `is_admin`:

```
Supervisor de TI    → vê: ti, plantao-historico
Supervisor RH       → vê: grupos-supervisores
Equipe Comunicados  → vê: comunicados_admin
Admin Full          → vê: TODAS as tabs
```

### O que Já Existe

O login já retorna `nome_grupo` do backend/IXC:

```javascript
// App.jsx → login callback
const userData = {
  ...resultado.usuario,
  funcionario: resultado.funcionario,
  nome_grupo: resultado.nome_grupo || null,  // ← JÁ EXISTE
  is_admin: resultado.usuario?.is_admin || false
};
```

**O campo existe. Falta a lógica de filtrar abas com base nele.**

---

## 2. Arquitetura Proposta

### 2.1 Modelo de Dados

```
Usuário
  ├── is_admin: boolean        (admin full — acesso a tudo)
  ├── nome_grupo: string       (grupo vindo do IXC, ex: "TI", "Supervisores")
  └── (futuro) permissoes: []  (grupos extras atribuídos no admin)

Grupo → Permissões de views
  ├── "TI"              → ["ti", "plantao-historico"]
  ├── "Supervisores"    → ["grupos-supervisores"]
  ├── "Comunicadores"   → ["comunicados_admin"]
  └── "Admin Full"      → ["*"] (tudo)
```

### 2.2 Fluxo de Decisão

```
Usuário tenta acessar view "ti"
        ↓
App.jsx → canAccess('ti', user)
        ↓
navigation.js → podeVerView('ti', user)
        ↓
  user.is_admin? → true → return true (admin vê tudo)
        ↓ false
  user.nome_grupo? → "TI"
        ↓
  VIEW_GRUPOS['ti'] → ['admin_full', 'ti']
        ↓
  "TI".includes("TI")? → SIM → return true
```

### 2.3 Componentes Afetados

| Componente | O que muda |
|------------|------------|
| `src/navigation.js` | Nova função `podeVerView()` + mapeamento `VIEW_GRUPOS` |
| `src/App.jsx` | Usa `canAccess()` existente (já chama `navigation.canAccess`) |
| `src/components/AdminDashboard.jsx` | Filtra `menuItens` pelo grupo do usuário |
| `src/components/admin/AdminUsuarios.jsx` | (futuro) permitir atribuir grupos a usuários |

---

## 3. Implementação Passo a Passo

### Passo 1 — Definir os grupos e suas views

**Arquivo:** `src/navigation.js`

Adicionar próximo às imports/exports atuais:

```javascript
// ─── Mapeamento de views por grupo ───────────────────────────────
// Chave: id da view (igual ao usado no NAV_ITEMS e no switch do App.jsx)
// Valor: array de grupos que podem ver essa view
// Admin full (is_admin: true) sempre vê tudo, independente disso.

export const VIEW_GRUPOS = {
  // Admin Dashboard tabs
  'painel':                ['admin_full', 'ti', 'supervisores', 'comunicadores'],
  'usuarios':              ['admin_full'],
  'grupos-supervisores':   ['admin_full', 'supervisores'],
  'comunicados':           ['admin_full', 'comunicadores'],
  'auditoria':             ['admin_full'],
  'plantao-historico':     ['admin_full', 'ti'],

  // Views públicas (qualquer colaborador logado)
  'dashboard':      [],
  'services':       [],
  'coverage':       [],
  'directory':      [],
  'sectors':        [],
  'schedule':       [],
  'processes':      [],
  'announcements':  [],
  'settings':       [],
  'tickets':        [],
  'offices':        [],
};

// ─── Função de verificação ────────────────────────────────────────

/**
 * Verifica se um usuário pode acessar uma view específica.
 * @param {string} view - ID da view (ex: 'ti', 'dashboard')
 * @param {Object} user - Objeto do usuário logado (com is_admin, nome_grupo)
 * @returns {boolean}
 */
export function podeVerView(view, user) {
  if (!user) return false;

  // Admin full tem acesso a tudo
  if (user.is_admin) return true;

  // Views sem restrição de grupo (array vazio) — qualquer um vê
  const gruposPermitidos = VIEW_GRUPOS[view];
  if (!gruposPermitidos) return false;
  if (gruposPermitidos.length === 0) return true;

  // Verifica se o grupo do usuário está na lista
  const grupo = user.nome_grupo || '';
  
  // O usuário pode ver se seu grupo está na lista OU se é admin_full
  // (para suporte a grupos personalizados no futuro)
  return gruposPermitidos.includes(grupo);
}

/**
 * Versão legada — mantida para compatibilidade com código existente.
 * @deprecated Use podeVerView() diretamente.
 */
export function canAccess(view, user) {
  return podeVerView(view, user);
}
```

### Passo 2 — Filtrar as tabs do AdminDashboard

**Arquivo:** `src/components/AdminDashboard.jsx`

Alterar a definição de `menuItens` para incluir a propriedade `grupos`:

```javascript
const menuItens = [
  { id: 'painel',                label: 'Painel',          icon: 'dashboard',        grupos: ['admin_full', 'ti', 'supervisores', 'comunicadores'] },
  { id: 'usuarios',              label: 'Usuários',        icon: 'group',            grupos: ['admin_full'] },
  { id: 'grupos-supervisores',   label: 'Responsáveis',    icon: 'manage_accounts', grupos: ['admin_full', 'supervisores'] },
  { id: 'comunicados',           label: 'Comunicados',     icon: 'campaign',         grupos: ['admin_full', 'comunicadores'] },
  { id: 'auditoria',             label: 'Auditoria',       icon: 'description',      grupos: ['admin_full'] },
  { id: 'plantao-historico',     label: 'Plantões',        icon: 'manage_history',   grupos: ['admin_full', 'ti'] },
];
```

Adicionar filtro antes de renderizar (dentro do return do componente):

```javascript
// ─── FILTRO POR GRUPO ─────────────────────────────────────────────
// Admin full vê todas as tabs. outros grupos veem só suas tabs.
const menuFiltrado = useMemo(() => {
  if (user?.is_admin) return menuItens;
  const grupo = user?.nome_grupo || '';
  return menuItens.filter(item => {
    if (!item.grupos) return true;  // sem restrição = visível
    return item.grupos.includes(grupo) || item.grupos.includes('admin_full');
  });
}, [user, menuItens]);

// No JSX — substituir {menuItens.map(...)} por {menuFiltrado.map(...)}
// Linha ~205-213:
{menuFiltrado.map(item => (
    <NavRow
        key={item.id}
        C={C}
        {...item}
        active={abaAtiva === item.id}
        onClick={setAbaAtiva}
    />
))}
```

### Passo 3 — Garantir que o App.jsx usa a nova função

O `App.jsx` já importa e usa `canAccess`:

```javascript
import { canAccess, viewTitleFor } from './navigation';

// Linha ~194
const permitido = canAccess(currentView, user);
```

**Não precisa de alteração** — o `canAccess` já delega para `podeVerView` (veja Passo 1).

### Passo 4 — Atualizar o mobile bottom bar (se necessário)

**Arquivo:** `src/components/AdminDashboard.jsx`

O mobile bottom bar está em ~linha 234-250. Ele usa `menuItens` diretamente.

Se o AdminDashboard for a tela principal no mobile, aplicar o mesmo filtro:

```javascript
// No bottom bar mobile (~linha 234)
{menuFiltrado.map(item => {
    const ativo = abaAtiva === item.id;
    return (
        <button
            key={item.id}
            onClick={() => setAbaAtiva(item.id)}
            aria-current={ativo ? 'page' : undefined}
            className="flex min-h-[44px] flex-1 flex-col items-center gap-0.5 py-2 transition-colors"
            style={{ color: ativo ? (isDark ? C.accentDark : C.accentDeep) : C.ink2 }}
        >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
        </button>
    );
})}
```

---

## 4. Configuração dos Grupos

### 4.1 Grupos Pré-definidos

| Grupo | Views Permitidas | Observação |
|-------|-----------------|------------|
| `admin_full` | TODAS | Admin master — acesso irrestrito |
| `ti` | `ti`, `plantao-historico` | TI opera plantões e tickets |
| `supervisores` | `grupos-supervisores` | Supervisores gerenciam equipes |
| `comunicadores` | `comunicados` | Equipe de comunicação gerencia comunicados |
| *(nenhum)* | `dashboard`, `services`, etc. | Todos os colaboradores logados |

### 4.2 Como Vincular Usuário a Grupo

**Via IXC (já existe):** O login retorna `nome_grupo` do backend. Se o IXC já tem grupos, usar esse valor.

**Via banco (futuro):** Criar tabela `usuarios_grupos`:

```sql
CREATE TABLE usuarios_grupos (
  usuario_id INTEGER REFERENCES usuarios(usuario_id),
  grupo VARCHAR(50) NOT NULL,
  principal BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (usuario_id, grupo)
);
```

**Via admin (futuro):** Na tela `AdminUsuarios`, adicionar dropdown para atribuir grupo ao usuário.

---

## 5. Como Testar

### 5.1 Teste Manual

1. **Entrar como admin:** `marciofelix@prestek.com.br` → verificar que TODAS as tabs aparecem
2. **Entrar como usuário de grupo TI:** (precisa de usuário com `nome_grupo: "TI"` e `is_admin: false`) → verificar que só `ti` e `plantao-historico` aparecem no AdminDashboard
3. **Entrar como usuário de grupo Supervisores:** (`nome_grupo: "Supervisores"`) → verificar que só `grupos-supervisores` aparece
4. **Entrar como usuário sem grupo definido:** (`nome_grupo: null`) → verificar que nenhuma tab administrativa aparece (só painel se incluído no array)
5. **Acessar via URL direta:** entrar no admin, abrir `http://localhost:5000/?view=admin` ou navegar para tab restrita → verificar que não carrega (NotFound ou redirecionamento)

### 5.2 Teste Automatizado (Playwright)

**Arquivo:** `tests/permissoes-grupos.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test('usuário TI vê apenas tabs TI no admin', async ({ page }) => {
  // Simula login como usuário TI (mock do backend ou usar credencial real)
  await page.goto('http://localhost:5000/login');
  
  // Preencher credenciais de usuário TI
  await page.fill('input[name=username]', 'usuario_ti@prestek.com.br');
  await page.fill('input[name=password]', 'SENHA_DO_USUARIO');
  await page.click('button[type=submit]');
  
  // Aguardar login
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
  
  // Navegar para admin
  await page.click('text=Admin'); // ou clicar no menu
  await page.waitForSelector('.fixed.inset-0'); // admin dashboard carregou
  
  // Verificar quais tabs estão visíveis
  const tabsVisiveis = await page.locator('.group.flex.w-full').allTextContents();
  
  // TI deve ver: "Painel", "Plantões" (e talvez outros se incluídos)
  // TI NÃO deve ver: "Usuários", "Responsáveis", "Comunicados", "Auditoria"
  expect(tabsVisiveis).toContain('Painel');
  expect(tabsVisiveis).toContain('Plantões');
  expect(tabsVisiveis).not.toContain('Usuários');
});
```

---

## 6. Considerações de Segurança

### 6.1 Gate no Backend Também

A filtragem no frontend (**React**) é **apenas UI** — não impede que alguém faça requisição direta à API. O backend também deve validar:

```javascript
// backend/server.js — exemplo de middleware por grupo
function requerGrupo(gruposPermitidos) {
  return async (req, res, next) => {
    const user = req.usuario; // middleware de auth já deve ter carregado
    if (!user) return res.status(401).json({ sucesso: false, erro: 'Não autenticado' });
    
    if (user.is_admin) return next(); // admin full passa sempre
    
    const grupo = user.nome_grupo || '';
    if (!gruposPermitidos.includes(grupo)) {
      return res.status(403).json({ sucesso: false, erro: 'Sem permissão para este recurso' });
    }
    
    next();
  };
}

// Uso:
app.get('/api/admin/usuarios', requerGrupo(['admin_full']), async (req, res) => { ... });
```

### 6.2 Don't Trust Client-Side Alone

| Risco | Mitigação |
|-------|-----------|
| Usuário modifica `user.nome_grupo` no console | Backend valida permissões em cada requisição |
| Acesso direto à API sem passar pelo frontend | Backend verifica grupo em cada endpoint protegido |
| Usuário compartilha credenciais | Login com tentativa de acesso negado gera log no backend |

---

## 7. Extensões Futuras

### 7.1 Permissões por Setor/Departamento

Adicionar nível adicional: mesmo grupo "TI" pode ter acesso só ao setor "Produto" ou só "Vendas":

```
 usuario → nome_grupo: "TI" + setores: ["produto", "vendas"]
```

Implementar com:

```javascript
// VIEW_GRUPOS com condição de setor
const VIEW_GRUPOS = {
  'ti': {
    grupos: ['admin_full', 'ti'],
    setores: ['produto', 'vendas']  // opcional — se vazio, todos os setores do grupo vesem
  }
};
```

### 7.2 Permissões Granulares por Ação

Em vez de só "ver tab", permitir ações específicas:

```
 usuario → permissoes: ['usuarios:ler', 'usuarios:editar', 'comunicados:criar']
```

```javascript
export const PERMISSOES_ACAO = {
  'usuarios_listar':    { grupos: ['admin_full', 'supervisores'] },
  'usuarios_editar':    { grupos: ['admin_full'] },
  'comunicados_criar':  { grupos: ['admin_full', 'comunicadores'] },
  'comunicados_excluir': { grupos: ['admin_full'] },
};

export function podeExecutarAcao(acao, user) {
  if (!user) return false;
  if (user.is_admin) return true;
  
  const perm = PERMISSOES_ACAO[acao];
  if (!perm) return false;
  
  const grupo = user.nome_grupo || '';
  return perm.grupos.includes(grupo);
}
```

### 7.3 Herança de Grupos

Permitir que um usuário pertença a múltiplos grupos simultaneamente:

```javascript
// user.grupos = ['ti', 'comunicadores']  (em vez de apenas nome_grupo)
// VIEW_GRUPOS['comunicados'] → ['admin_full', 'comunicadores']
// Usuário vê comunicados porque 'comunicadores' está no array
```

### 7.4 ABIlidade de Auditoria por Grupo

Na tela de auditoria (`AdminAuditoria.jsx`), permitir filtrar logs por grupo:

```javascript
// Filtro adicionado na auditoria
const [filtroGrupo, setFiltroGrupo] = useState('');

// API: GET /api/admin/auditoria?grupo=ti&pagina=1
```

---

## 8. Checklist de Implementação

### Essencial
- [ ] Adicionar `VIEW_GRUPOS` em `navigation.js`
- [ ] Adicionar `podeVerView()` em `navigation.js`
- [ ] Atualizar `AdminDashboard.jsx` com `menuFiltrado`
- [ ] Atualizar mobile bottom bar com o mesmo filtro
- [ ] Testar com 3 perfis: admin, TI, supervisor

### Backend
- [ ] Validar que endpoints administrativos verifiquem grupo (não só `is_admin`)
- [ ] Adicionar log de tentativas de acesso negado

### Avançado (futuro)
- [ ] Tabela `usuarios_grupos` no banco
- [ ] UI no `AdminUsuarios` para atribuir grupo ao usuário
- [ ] Permissões por ação (não só por view)
- [ ] Herança de grupos (múltiplos grupos por usuário)
- [ ] Filtro por setor/departamento dentro de grupo

---

## 9. Referências

- `src/navigation.js` — navegação e gate de permissão atual
- `src/App.jsx` — layout principal e gate de renderização
- `src/components/AdminDashboard.jsx` — admin dashboard com tabs
- `src/components/admin/AdminUsuarios.jsx` — gerenciamento de usuários
- `docs/PLAN_admin_permissoes_config.md` — planejamento complementar
