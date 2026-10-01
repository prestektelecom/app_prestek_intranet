## Why

Quem é da equipe de cada setor (Comercial, TI…) vem só do IXC, de `funcionarios.id_departamento`, e a intranet não deixa corrigir isso. Quando o cadastro do IXC está errado, ou quando alguém atende dois setores, Setores e Colaboradores mostram a equipe errada, e a única saída hoje é mexer no IXC. A tela de Responsáveis já deixa definir o responsável de cada setor só na intranet; falta o mesmo para a equipe.

## What Changes

- Nova tabela local de ajustes de equipe por setor: cada ajuste **inclui** uma pessoa num setor ou **exclui** uma pessoa que o IXC colocou lá. Nada é escrito no IXC.
- A equipe efetiva de um setor passa a ser: quem o IXC põe no setor, mais os incluídos, menos os excluídos. A regra atual de ATENDIMENTO (que absorve Suporte 15 e Relacionamento 68) continua como está e é aplicada antes dos ajustes.
- Desfazer é apagar o ajuste: a pessoa volta ao que o IXC diz.
- Uma pessoa pode estar em mais de um setor. O setor do IXC continua sendo o principal dela.
- Setores e o filtro por setor de Colaboradores passam a usar a equipe efetiva; o contador de colaboradores únicos continua sem contar ninguém duas vezes.
- O responsável automático do setor (membro de grupo de supervisão) passa a ser escolhido entre a equipe efetiva. O responsável manual segue independente.
- Quem foi ajustado à mão aparece marcado como "definido na intranet", para ninguém achar que o cadastro do IXC mudou.
- Nova edição de equipe dentro de cada setor na aba **Responsáveis** do Painel Admin, com confirmação antes de gravar e registro em Auditoria. Só `is_admin` ou quem tem a capacidade `usuarios` altera.
- **Fora do escopo, de propósito:** Plantão (a escala continua usando o departamento oficial do IXC), Organograma (conteúdo editorial) e a regra de ATENDIMENTO (não vira configurável por tela).

## Capabilities

### New Capabilities
- `setores-membros-manuais`: ajustes locais de equipe por setor (incluir e excluir), cálculo da equipe efetiva, marcação "definido na intranet", permissão, auditoria e a tela de edição.

### Modified Capabilities
- `setores-diretorio`: o total de membros e o responsável automático de cada setor passam a refletir a equipe efetiva, e o setor ajustado é sinalizado.
- `department-chip-filter`: o filtro e a contagem por departamento passam a considerar os setores efetivos da pessoa (quem está em dois setores conta nos dois chips).

## Impact

- **Banco:** migration `024_setores_membros_manuais.sql` (`CREATE TABLE IF NOT EXISTS`, sem seed, idempotente). Mesmo banco de produção e sem staging; aplicar só com autorização e só o arquivo 024, nunca `run.js` inteiro.
- **Backend (`backend/server.js`):** `/api/setores` aplica os ajustes (cache `setores:lista:v2` vira `v3` e é invalidado ao gravar); `/api/colaboradores` devolve os ajustes de cada pessoa; rota nova `POST /api/admin/setores-membros-manuais` (`gate('usuarios')`), que devolve a lista atual de ajustes (a tela lê os ajustes de cada pessoa em `/api/colaboradores`, sem `GET` próprio); novas ações de Auditoria. Função pura compartilhada para aplicar ajustes, para os dois lados não divergirem.
- **Frontend:** `ResponsaveisManual.jsx` (+ componente novo de equipe), `Sectors.jsx` e cartões de setor (marca), `Directory.jsx` (filtro, chips, rótulo), util `setoresDaPessoa`, `iconeAcao.js` e filtro da Auditoria. Toca interface, então exige `/impeccable audit` antes de concluir (CLAUDE.md).
- **Dependência:** reaproveita a capacidade `usuarios` da change `permissoes-por-capacidade` (já arquivada).
- **Risco principal:** o setor de uma pessoa é lido em três lugares (Setores, Colaboradores, Plantão). Só os dois primeiros mudam; a verificação precisa provar que Setores e Colaboradores batem entre si.
