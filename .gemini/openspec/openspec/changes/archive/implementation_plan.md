# Bug: Usuário 59832 (LUANA SILVA) exibindo "Recursos Humanos" em vez de "ATENDIMENTO"

## Diagnóstico

A LUANA SILVA está no setor **ATENDIMENTO** no IXC Soft, mas o card "Meu Setor" no Dashboard (e o subtítulo no Header) mostra **"Recursos Humanos"**.

### Causa Raiz: Lógica de resolução de departamento ambígua em dois componentes

O campo `funcionario.id_departamento` retornado pelo IXC é consultado contra **três fontes** em paralelo — e a prioridade errada pode causar uma correspondência falsa:

```
Dashboard.jsx (linha 55–59) e Header.jsx (linha 106–109):

foundDeptEmp?.departamento  ← /api/departamentos-empresa  (tabela "departamento" IXC)
|| foundDept?.setor          ← /api/departamentos           (tabela "su_ticket_setor")
|| foundCargo?.setor         ← /api/cargos                  (tabela "empresa_setor")
|| safeDepto                 ← fallback: usa o próprio ID numérico
```

**O problema**: O `id_departamento` de LUANA é o ID do seu setor no IXC (`ATENDIMENTO`).
Porém, esse mesmo ID também existe em outra tabela (`departamento` ou `empresa_setor`) com o nome **"Recursos Humanos"** — e como `deptosEmpresa` tem prioridade máxima (`foundDeptEmp` é verificado primeiro), ele "vence" com o nome errado.

### Evidências

| Local | Linha | Código problemático |
|---|---|---|
| `Dashboard.jsx` | 55–59 | `foundDeptEmp?.departamento \|\| foundDept?.setor \|\| foundCargo?.setor` |
| `Header.jsx` | 106–109 | Lógica idêntica duplicada |

O campo correto para nome do setor é `su_ticket_setor.setor` (rota `/api/departamentos`) — que reflete os setores de atendimento do IXC onde o funcionário está registrado.

---

## Solução Proposta

### Estratégia

1. **Adicionar rota de diagnóstico no backend** (temporária, para confirmar os dados brutos do IXC para o funcionário 59832)
2. **Corrigir a ordem de prioridade** nas duas lógicas de lookup (Dashboard + Header) para respeitar a hierarquia correta:
   - Primeiro: `su_ticket_setor` (setor de atendimento — mais específico, fonte direta de `id_departamento`)
   - Segundo: `departamento` organizacional (fallback)  
   - Terceiro: `empresa_setor` (cargo/lotação geral — último recurso)
3. **Extrair a lógica duplicada** para um utilitário compartilhado `src/utils/resolveSetor.js`

> [!IMPORTANT]
> A lógica de resolução está **duplicada** em `Dashboard.jsx` e `Header.jsx`. Qualquer correção deve ser feita nos dois arquivos (ou melhor, extraída para um helper).

> [!WARNING]
> Antes de inverter a prioridade, precisamos confirmar via API quais IDs cada tabela retorna para a Luana. A rota de diagnóstico evita corrigir no escuro.

---

## Alterações Propostas

### 1. Backend — Rota de diagnóstico temporária

#### [MODIFY] [server.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/backend/server.js)

Adicionar uma rota GET `/api/debug-funcionario/:id` que retorna os dados brutos de departamento para um ID de funcionário, permitindo confirmar qual tabela está causando a colisão.

---

### 2. Frontend — Utilitário compartilhado

#### [NEW] [resolveSetor.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/utils/resolveSetor.js)

```js
/**
 * Resolve o nome do setor/departamento de um funcionário.
 * Prioridade correta:
 *  1. su_ticket_setor (setor de atendimento — fonte direta de id_departamento)
 *  2. departamento organizacional
 *  3. empresa_setor (cargo geral)
 *  4. Fallback: ID bruto
 */
export async function resolveNomeSetor(safeDepto, safeRole) {
    if (!safeDepto && !safeRole) return 'Colaborador';
    
    const [resDept, resCargo, resDeptEmp] = await Promise.all([
        fetch('/api/departamentos').catch(() => null),
        fetch('/api/cargos').catch(() => null),
        fetch('/api/departamentos-empresa').catch(() => null)
    ]);

    let departamentos = [], cargos = [], deptosEmpresa = [];
    if (resDept?.ok) { const d = await resDept.json(); if (d.sucesso) departamentos = d.departamentos || []; }
    if (resCargo?.ok) { const d = await resCargo.json(); if (d.sucesso) cargos = d.cargos || []; }
    if (resDeptEmp?.ok) { const d = await resDeptEmp.json(); if (d.sucesso) deptosEmpresa = d.departamentos || []; }

    if (safeDepto) {
        // PRIORIDADE CORRETA: su_ticket_setor primeiro (mais específico)
        const foundDept    = departamentos.find(d => String(d.id).trim() === String(safeDepto).trim());
        const foundDeptEmp = deptosEmpresa.find(d => String(d.id).trim() === String(safeDepto).trim());
        const foundCargo   = cargos.find(c => String(c.id).trim() === String(safeDepto).trim());
        
        const nome = foundDept?.setor || foundDeptEmp?.departamento || foundCargo?.setor;
        if (nome) return nome;
    }

    // Fallback: tenta pelo id_funcao
    if (safeRole && safeRole !== 'Colaborador') {
        const foundRole = cargos.find(c => String(c.id).trim() === String(safeRole).trim());
        if (foundRole?.setor) return foundRole.setor;
    }

    return safeDepto || safeRole || 'Colaborador';
}
```

#### [MODIFY] [Dashboard.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Dashboard.jsx)

- Remover o `useEffect` de `fetchCargoESetor` (linhas 24–77)
- Importar e usar `resolveNomeSetor` do utilitário

#### [MODIFY] [Header.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Header.jsx)

- Remover o `useEffect` de `fetchCargoESetor` (linhas 90–123)
- Importar e usar `resolveNomeSetor` do utilitário

---

## Plano de Verificação

### 1. Diagnóstico prévio (via API de debug)
- Acessar `/api/debug-funcionario/59832` e verificar qual tabela está retornando "Recursos Humanos" para o `id_departamento` de LUANA

### 2. Após a correção
- Logar como LUANA SILVA (ou simular via localStorage com seus dados)
- Verificar o card "Meu Setor" no Dashboard → deve exibir **ATENDIMENTO**
- Verificar o subtítulo no Header → deve exibir **ATENDIMENTO**
- Verificar outros usuários para garantir que nenhum setor foi quebrado

### 3. Regressão
- Testar 2–3 usuários de outros setores (TI, Financeiro, etc.) para confirmar que a mudança de prioridade não afeta casos já corretos

---

## Perguntas em Aberto

> [!IMPORTANT]
> **Antes de aplicar a correção**, precisamos confirmar: o `id_departamento` de LUANA no IXC — qual é o número? E qual tabela tem esse ID com o nome "Recursos Humanos"?
>
> Se tiver acesso ao painel do IXC ou puder rodar a rota de debug, isso confirma a causa raiz com 100% de certeza.

> [!NOTE]
> A extração do helper `resolveSetor.js` é opcional — posso corrigir apenas invertendo a prioridade nos dois arquivos existentes, sem criar o novo arquivo, se preferir uma mudança mais cirúrgica.
