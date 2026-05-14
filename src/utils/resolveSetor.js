/**
 * Resolve o nome do setor de um funcionário.
 * Prioridade: nome_grupo (usuarios_grupo) > empresa_setor > departamento > su_ticket_setor > fallback
 */
export async function resolveNomeSetor(safeDepto, safeRole, nomeGrupo) {
    if (nomeGrupo) return nomeGrupo;
    if (!safeDepto && !safeRole) return 'Colaborador';

    const [resDept, resCargo, resDeptEmp] = await Promise.all([
        fetch('/api/departamentos').catch(() => null),
        fetch('/api/cargos').catch(() => null),
        fetch('/api/departamentos-empresa').catch(() => null)
    ]);

    let departamentos = [], cargos = [], deptosEmpresa = [];
    if (resDept?.ok)   { const d = await resDept.json();   if (d.sucesso) departamentos = d.departamentos || []; }
    if (resCargo?.ok)  { const d = await resCargo.json();  if (d.sucesso) cargos        = d.cargos        || []; }
    if (resDeptEmp?.ok){ const d = await resDeptEmp.json();if (d.sucesso) deptosEmpresa = d.departamentos || []; }

    if (safeDepto) {
        const foundCargo   = cargos.find(c => String(c.id).trim() === String(safeDepto).trim());
        const foundDeptEmp = deptosEmpresa.find(d => String(d.id).trim() === String(safeDepto).trim());
        const foundDept    = departamentos.find(d => String(d.id).trim() === String(safeDepto).trim());

        const nome = foundCargo?.setor || foundDeptEmp?.departamento || foundDept?.setor;
        if (nome) return nome;
    }

    if (safeRole && safeRole !== 'Colaborador') {
        const foundRole = cargos.find(c => String(c.id).trim() === String(safeRole).trim());
        if (foundRole?.setor) return foundRole.setor;
    }

    return safeDepto || safeRole || 'Colaborador';
}
