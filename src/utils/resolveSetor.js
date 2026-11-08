import { listarCargos, listarDepartamentos, listarDepartamentosEmpresa } from './referenciaSetores.js'

/**
 * Resolve o nome do setor de um funcionário.
 * Prioridade: nome_grupo (usuarios_grupo) > empresa_setor > departamento > su_ticket_setor > fallback
 */
export async function resolveNomeSetor(safeDepto, safeRole, nomeGrupo) {
    if (nomeGrupo) return nomeGrupo;
    if (!safeDepto && !safeRole) return 'Colaborador';

    // Listas compartilhadas e guardadas por 5 min (utils/referenciaSetores.js):
    // o Início e a barra lateral perguntavam as mesmas 3 rotas cada um por si.
    const [departamentos, cargos, deptosEmpresa] = await Promise.all([
        listarDepartamentos(),
        listarCargos(),
        listarDepartamentosEmpresa(),
    ]);

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
