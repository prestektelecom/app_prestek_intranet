# Planejamento — Melhorias de Permissões, Configurações e Admin

**Escopo:** Sistema de permissões (`navigation.js`, `App.jsx`), Painel Admin (`AdminDashboard.jsx`, `AdminUsuarios.jsx`), tela de Configurações (`Configuracoes.jsx`) e backend relacionado.
**Prioridade:** Alto (segurança + UX de administradores).
**Data base:** 2026-09-28.

---

## Diagnóstico Rápido

| Área | Estado atual | Problema principal |
|------|--------------|-------------------|
| **Permissões** | Binário: `is_admin` true/false | Sem granularidade — um admin tem acesso total, sem permisssões parciais |
| **Gate de acesso** | `canAccess()` em `navigation.js` + `App.jsx` | Espalhado entre 2 arquivos; risco de inconsistência |
| **Admin Dashboard** | 6 abas, 3 KPIs, feed de 5 logs | KPIs limitados; sem métricas de segurança |
| **Admin Usuários** | Lista + busca + conceder/revogar admin | Sem paginação, exportação, ou histórico de mudanças de privilégio |
| **Configurações** | Perfil + tema + 2 notificações + avatar | Sem troca de senha, sem notificações avançadas |
| ** auditoria** | Logs básicos de ações | Sem detalhes de contexto (IP, user agent), sem alertas |

---

## Fase 1 — Sistema de Permissões (Critical)

### 1.1 Introduzir permissões granulares

**Problema:** Hoje `is_admin` é binário. Um admin tem acesso a tudo — usuários, comunicados, auditoria, TI. Não há como conceder "só comunicados" ou "só auditoria".

**Solução sugerida:** Criar um sistema de roles com permissões acumulativas:

```javascript
// src/navigation.js — NOVO MODELO
export const PERMISSIONS = {
  // Admin completo (hoje é is_admin: true)
  admin_full: ['usuarios', 'comunicados', 'auditoria', 'ti', 'plantao-historico', 'configuracoes'],
  // Admin com acesso apenas a comunicados
  comunicados_only: ['comunicados'],
  // Admin com acesso apenas a auditoria
  auditoria_only: ['auditoria'],
  // Supervisor de setor (leitura de dados do setor)
  supervisor_setor: ['dashboard'],
};

export function hasPermission(user, permission) {
  if (!user) return false;
  // Se for admin full, tem tudo
  if (user.is_admin) return true;
  // Permissões futuras: user.permissions = ['comunicados_only']
  return (user.permissions || []).includes(permission) ||
         (user.permissions || []).some(p =>
           PERMISSIONS[p] && PERMISSIONS[p].includes(permission)
         );
}

export function canAccess(view, user) {
  // Views que exigem admin full
  const adminOnly = ['admin', 'ti'];
  if (adminOnly.includes(view)) return Boolean(user?.is_admin);

  // Views que exigem permissão específica
  const viewPermissions = {
    'comunicados': 'comunicados_only',     // ou admin
    'auditoria': 'auditoria_only',         // ou admin
    'plantao-historico': 'admin_full',     // ou admin
  };
  const required = viewPermissions[view];
  if (required) return Boolean(user?.is_admin) || hasPermission(user, required);

  return !adminOnly.includes(view) || isAdmin(user);
}
```

**Critério de aceitação:**
- [ ] Permissões granulares documentadas em `navigation.js`
- [ ] `canAccess()` é a única função de gate (centralizada)
- [ ] Sem deep-link quebrado: tentar acessar `/admin` sem permissão vai para `NotFound` com "Acesso restrito"

---

### 1.2 Centralizar o gate de permissão

**Problema:** A lógica está em `navigation.js` (esconder item do menu) e `App.jsx` (bloquear renderização). Se um novo item for adicionado em um só lugar, o outro fica desatualizado.

**Solução:** Criar um arquivo único `src/permissions.js` que exporta tudo:

```javascript
// src/permissions.js
export { canAccess, isAdmin, hasPermission, visibleNav, viewTitleFor } from './navigation.js';
```

E ambos (`navigation.js` e `App.jsx`) importam de lá. Ou refatorar tudo para `permissions.js`.

**Critério de aceitação:**
- [ ] `permissions.js` é o arquivo fonte única
- [ ] `navigation.js` e `App.jsx` importam dele
- [ ] Adicionar uma nova view restrita é só atualizar `permissions.js`

---

### 1.3 Log de tentativas de acesso negado

**Problema:** Quando um usuário não-admin tenta acessar `/admin` via URL direta, o `App.jsx` mostra `NotFound`. Não há registro de quem tentou.

**Solução:** Adicionar registro no `App.jsx`:

```javascript
// App.jsx — dentro do gate de permissão
if (!canAccess(currentView, user)) {
  // Log de tentativa de acesso negado
  fetch('/api/admin/log-acesso-negado', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user?.email,
      view_tentada: currentView,
      timestamp: new Date().toISOString()
    })
  }).catch(() => {});
  return <NotFound setCurrentView={setCurrentView} user={user} variant="sem-permissao" />;
}
```

**Critério de aceitação:**
- [ ] Tentativa de acesso negado é registrada no backend
- [ ] O log fica visível na tela de Auditoria (para admins)

---

## Fase 2 — Melhorias no Admin Dashboard

### 2.1 KPIs adicionais de segurança

**Arquivo:** `src/components/AdminDashboard.jsx`

**Problema:** Apenas 3 KPIs: usuários ativos, comunicados, ações recentes. Faltam métricas de segurança.

**Novos KPIs sugeridos:**

```javascript
// NOVO — adicionar mais 2-3 KPIs ao grid
[
  { label: 'Admins Ativos', valor: stats?.total_admins, icon: 'verified_user', stripe: C.success, ... },
  { label: 'Tentativas Falhas', valor: stats?.tentativas_login_falhas_24h, icon: 'notifications', stripe: C.danger, ... },
  { label: 'Comunicados Pendentes', valor: stats?.comunicados_aguardando_aprovacao, icon: 'campaign', ... (se houver fluxo de aprovação) },
]
```

**Critério de aceitação:**
- [ ] KPIs de segurança (admins, tentativas falhas) estão visíveis no painel
- [ ] Backend `GET /api/admin/dashboard-stats` retorna os novos campos

---

### 2.2 Página de auditoria com filtros e paginação

**Arquivo:** `src/components/admin/AdminAuditoria.jsx`

**Problema:** A auditoria mostra todos os logs sem filtro (apenas por `admin_email`). Sem paginação, pode carregar muitos registros.

**Melhorias:**

```javascript
// Adicionar filtros à Auditoria
const [filtroAcao, setFiltroAcao] = useState('');
const [filtroPeriodo, setFiltroPeriodo] = useState(''); // "7d", "30d", "90d", "todo"
const [pagina, setPagina] = useState(1);
const [totalPaginas, setTotalPaginas] = useState(1);

// API: GET /api/admin/auditoria?acao=...&periodo=...&pagina=1&limite=20
```

**Critério de aceitação:**
- [ ] Filtro por tipo de ação (grant_admin, revoke_admin, criar_comunicado, etc.)
- [ ] Filtro por período
- [ ] Paginação (20 logs por página)
- [ ] Total de páginas visível

---

### 2.3 Ações rápidas no painel

**Arquivo:** `src/components/AdminDashboard.jsx`

**Problema:** O painel só mostra visualize — não há ações rápidas.

**Melhorias:** Adicionar botões de ação direta nos KPIs ou cards:

```javascript
// Card "Admins Ativos" com botão "Gerenciar"
<button onClick={() => setAbaAtiva('usuarios')}>
  Gerenciar Usuários
</button>

// Card de ações recentes com link para auditoria completa
<button onClick={() => setAbaAtiva('auditoria')}>
  Ver Auditoria Completa
</button>
```

**Critério de aceitação:**
- [ ] Cada KPI/card com ação relevante tem botão de navegação
- [ ] Sem deep-links quebrados

---

## Fase 3 — Melhorias em Admin Usuários

### 3.1 Paginação na lista de usuários

**Arquivo:** `src/components/admin/AdminUsuarios.jsx`

**Problema:** Lista todos os usuários sem paginação. Em empresa com muitos colaboradores, pode ser lento.

**Solução:**

```javascript
const [pagina, setPagina] = useState(1);
const LIMITE = 20;

// API: GET /api/admin/usuarios?pagina=1&limite=20&busca=...
// Retorna: { sucesso, usuarios, total, pagina, totalPaginas }

// Componente de paginação no final da tabela
{pagina > 1 && (
  <button onClick={() => setPagina(p => p - 1)}>Anterior</button>
)}
<span>Página {pagina} de {totalPaginas}</span>
{pagina < totalPaginas && (
  <button onClick={() => setPagina(p => p + 1)}>Próximo</button>
)}
```

**Critério de aceitação:**
- [ ] Lista com paginação (20 por página)
- [ ] Botões anterior/próximo funcionando
- [ ] Número total de páginas visível

---

### 3.2 Exportação da lista (CSV)

**Arquivo:** `src/components/admin/AdminUsuarios.jsx`

**Problema:** Admin não pode exportar a lista de usuários para planilha.

**Solução:**

```javascript
const exportarCSV = async () => {
  try {
    const res = await fetch(`${API}/api/admin/usuarios/export`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_prestek_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Falha ao exportar:', e);
  }
};

// Botão na toolbar + ícone de download
<button onClick={exportarCSV}>
  <span className="material-symbols-outlined">download</span>
  Exportar CSV
</button>
```

**Backend:** `GET /api/admin/usuarios/export` retorna CSV com cabeçalho.

**Critério de aceitação:**
- [ ] Botão "Exportar CSV" visível na tela de usuários
- [ ] Arquivo CSV baixa com todos os usuários (nome, email, perfil, última atividade)
- [ ] Arquivo abre corretamente no Excel/Numbers

---

### 3.3 Histórico de mudanças de privilégio

**Arquivo:** `src/components/admin/AdminUsuarios.jsx` + `AdminAuditoria.jsx`

**Problema:** Não há registro de quando um usuário tornou-se admin ou perdeu acesso.

**Solução:** Usar a tabela de auditoria existente (já registra `grant_admin` e `revoke_admin`) e exibir no card do usuário ou numa aba separada.

```javascript
// Na tabela de usuários — coluna "Histórico de Admin"
// Ao clicar, abre um modal ou expande a linha mostrando:
// - Data da concessão: ...
// - Data da revogação: ...
// - Admin que concedeu: ...
```

**Critério de aceitação:**
- [ ] Histórico de concessão/revogação de admin visível para cada usuário
- [ ] Fonte: tabela de auditoria (`grant_admin`, `revoke_admin`)

---

### 3.4 Bloqueio de usuário inativo

**Problema:** Usuários inativos (`func.ativo === 'S'` para ativo) aparecem na lista mas não há ação de bloqueio explícito.

**Solução:** Adicionar ação "Desativar" ao lado do botão de admin:

```javascript
// Nova coluna/action: Desativar Usuário
// API: POST /api/admin/usuarios/:id/desativar
// Requer confirmação (modal similar ao de admin)
```

**Critério de aceitação:**
- [ ] Botão "Desativar" visível para cada usuário ativo
- [ ] Confirmação antes de desativar
- [ ] Usuário desativado fica com badge "Inativo" na lista

---

## Fase 4 — Melhorias em Configurações

### 4.1 Troca de senha

**Arquivo:** `src/components/Configuracoes.jsx`

**Problema:** Não há opção de trocar senha na tela de configurações.

**Solução:** Adicionar seção "Segurança" com troca de senha:

```javascript
// Nova seção no Configuracoes.jsx
const [oldSenha, setOldSenha] = useState('');
const [novaSenha, setNovaSenha] = useState('');
const [confirmSenha, setConfirmSenha] = useState('');

const handleTrocarSenha = async () => {
  if (novaSenha !== confirmSenha) {
    // erro: senhas não conferem
    return;
  }
  try {
    const res = await fetch('/api/usuario/trocar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: safeEmail, senha_atual: oldSenha, nova_senha: novaSenha })
    });
    if (!res.ok) throw new Error(...);
    // sucesso — mostrar toast, limpar campos
  } catch (e) {
    // erro
  }
};
```

**Critério de aceitação:**
- [ ] Seção "Segurança" com campos: senha atual, nova senha, confirmar
- [ ] Validação: nova senha == confirmar
- [ ] Backend endpoint `POST /api/usuario/trocar-senha` existe
- [ ] After successful change: limpar campos, mostrar sucesso

---

### 4.2 Verificação de email antes de alterar

**Problema:** Qualquer pessoa com acesso à conta pode alterar o email sem confirmação.

**Solução:** Ao alterar o email, pedir confirmação via código enviado ao email antigo e novo:

```javascript
// Fluxo:
// 1. Usuário muda email no form
// 2. Clicar "Salvar" pede confirmação: "Enviar código de verificação?"
// 3. Código enviado ao email atual + novo (ou só atual)
// 4. Usuário insere código
// 5. Se válido, salva o novo email
```

**Critério de aceitação:**
- [ ] Mudança de email requer verificação
- [ ] Código enviado ao email
- [ ] Sem código válido, email não é alterado

---

### 4.3 Preferências de notificação avançadas

**Arquivo:** `src/components/Configuracoes.jsx`

**Problema:** Apenas 2 toggles de notificação (comunicados do departamento, manutenção do sistema).

**Novas opções sugeridas:**

```javascript
const novasNotificacoes = [
  { label: 'Novos chamados atribuídos a mim', name: 'notif_chamados_atribuidos' },
  { label: 'Atualizações no plantão do meu setor', name: 'notif_plantao_atualizacao' },
  { label: 'Comunicados urgentes (push)', name: 'notif_comunicados_urgentes' },
  { label: 'Resposta em meu chamado', name: 'notif_resposta_chamado' },
];
```

**Critério de aceitação:**
- [ ] 2-4 novas opções de notificação visíveis
- [ ] Cada toggle salva no backend (`/api/configuracoes/:id`)
- [ ] Valores persisted corretamente

---

### 4.4 Otimização do armazenamento de avatar

**Problema:** Avatar uploaded como base64 pode ser grande (imagens de celular modernos são 3-8MB). O campo no banco pode estourar.

**Solução:**

```javascript
// Na upload:
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tamanho: 2MB (já existe)
  if (file.size > 2 * 1024 * 1024) { ... }

  // Redimensionar para max 512px antes de converter
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    const maxSize = 512;
    const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85); // JPEG 85% qualidade
    setAvatarUrl(base64);
  };
  img.src = URL.createObjectURL(file);
};
```

**Critério de aceitação:**
- [ ] Imagem redimensionada para máximo 512px antes de salvar
- [ ] Salvado como JPEG 85% em vez de PNG (menor)
- [ ] Sem estouro de campo no banco

---

## Fase 5 — Acessibilidade e UX

### 5.1 Menu admin mobile completo

**Arquivo:** `src/components/AdminDashboard.jsx`

**Problema:** O bottom bar mobile mostra 6 itens com labels truncados ("Usuários" ficava "Usuári..." se muito longo). A auditoria e plantões estavam inatingíveis em telas pequenas antes da correção.

**Melhoria:** Garantir que os 6 ícones + labels cabem em telas de 320px+:

```css
/* Bottom bar mobile */
button span.label {
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**Critério de aceitação:**
- [ ] Bottom bar mobile com 6 itens funcional em 320px
- [ ] Labels truncados com ellipsis se necessário
- [ ] Todos os 6 itens acessíveis sem scroll horizontal

---

### 5.2 Navegação entre abas do admin com teclado

**Problema:** O admin dashboard usa `useState` para abas — mudar de aba requer clique. Sem navegação por teclado entre abas.

**Melhoria:** Adicionar shortcuts de teclado ou `aria-controls`:

```jsx
// Cada NavRow (sidebar) recebe aria-controls e role
<NavRow
  role="tab"
  aria-selected={abaAtiva === item.id}
  aria-controls={`painel-${item.id}`}
  ...
/>

// Main content sections recebem id correspondente
<div id={`painel-${abaAtiva}`} role="tabpanel">
```

**Critério de aceitação:**
- [ ] Sidebar funciona como tabs ARIA
- [ ] Ctrl+Tab ou anosféreos movem entre abas (se implementado)
- [ ] Foco visível ao mudar de aba

---

## Fase 6 — Melhorias no Backend

### 6.1 Endpoints faltantes

| Endpoint | Método | Descrição | Prioridade |
|----------|--------|-----------|------------|
| `/api/admin/dashboard-stats` | GET | KPIs atualizados (admins ativos, tentativas falhas) | Alta |
| `/api/admin/usuarios/export` | GET | Exportação CSV da lista de usuários | Média |
| `/api/admin/usuarios/:id/desativar` | POST | Desativar usuário | Média |
| `/api/usuario/trocar-senha` | POST | Troca de senha pelo usuário | Alta |
| `/api/admin/log-acesso-negado` | POST | Log de tentativa de acesso negado | Média |
| `/api/admin/auditoria` | GET | Com filtros (acao, periodo, pagina) | Média |

---

## Resumo das Tarefas por Fase

| Fase | Tarefas | Esforço |
|------|---------|---------|
| 1 | Permissões granulares, centralizar gate, log acesso negado | 3-4h |
| 2 | KPIs de segurança, auditoria com filtros/paginação, ações rápidas | 2-3h |
| 3 | Paginação, export CSV, histórico de privilégio, bloqueio inativo | 3-4h |
| 4 | Troca de senha, verificação de email, novas notificações, otimização avatar | 2-3h |
| 5 | Menu mobile completo, navegação por teclado no admin | 1h |
| 6 | Endpoints backend faltantes | 2-3h |

**Total estimado:** 13-18h de trabalho.

---

## Prioridade de Implementação

| Prioridade | Fase | Justificativa |
|------------|------|---------------|
| **Critical** | 1.1, 1.2 | Segurança — sistema de permissões atual é binário e disperso |
| **Alta** | 4.1 | UX — usuário não pode trocar senha no app |
| **Alta** | 6.1 | Backend — endpoints necessários para as fases 1-4 |
| **Média** | 2.1, 3.1 | UX admin — KPIs limitados e lista sem paginação |
| **Média** | 3.2, 4.3 | QoL — exportação e novas notificações |
| **Baixa** | 3.3, 3.4, 4.2, 5.1, 5.2 | Melhorias incrementais |

---

## Arquivos a Modificar

| Arquivo | O que muda |
|---------|------------|
| `src/navigation.js` | Novo sistema de permissões granulares |
| `src/permissions.js` | **NOVO** — centralização do gate |
| `src/App.jsx` | Importar de `permissions.js`, log de acesso negado |
| `src/components/AdminDashboard.jsx` | KPIs adicionais, ações rápidas, bottom bar mobile |
| `src/components/AdminUsuarios.jsx` | Paginação, export CSV, histórico de privilégio, desativar |
| `src/components/AdminAuditoria.jsx` | Filtros, paginação |
| `src/components/Configuracoes.jsx` | Troca de senha, novas notificações, otimização avatar |
| `backend/server.js` | Novos endpoints (dashboard-stats, export, trocar-senha, log-acesso-negado, auditoria com filtros) |

---

## Bloqueios / Dependências

- [ ] Backend rodando para testar novos endpoints
- [ ] Credenciais de admin para testar permissões
- [ ] Decisão sobre model de permissões granulares (roles vs. permissões diretas)
- [ ] Confirmação se `admin_full` continua sendo `is_admin: true` ou se migrar para `permissions: ['admin_full']`
