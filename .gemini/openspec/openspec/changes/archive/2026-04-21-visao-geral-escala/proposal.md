## Why

A interface "Escala de Plantão" existente era funcional mas carecia de clareza visual, organização e recursos de gestão. Precisava de um título descritivo, calendário interativo correto, modal de gerenciamento de plantões com suporte a criação, edição, exclusão e filtro de funcionários por departamento.

## What Changes

- Renomeação do título principal para "Visão Geral da Escala"
- Remoção da navegação de breadcrumb desnecessária
- Correção do alinhamento de dias da semana no mini-calendário
- Adição de modal "Gerenciar Plantão" com formulário completo
- Implementação de funcionalidade de exclusão de registros de plantão
- Fechamento do modal ao clicar fora (click-outside)
- Filtro de funcionários por departamento no modal (ATENDIMENTO/NOC para N1)
- Refatoração do `Schedule.jsx` em subcomponentes reutilizáveis
- Aplicação de estilo Material Design 3 com Tailwind CSS

## Capabilities

### New Capabilities

- `schedule-overview`: Visão geral da escala de plantão com calendário interativo e filtros por período
- `shift-management-modal`: Modal de gerenciamento de plantões com CRUD (criar, editar, excluir) e validação por departamento

### Modified Capabilities

<!-- Nenhuma spec existente foi modificada em nível de requisitos -->

## Impact

- `src/components/Schedule.jsx`: Arquivo principal refatorado com subcomponentes extraídos
- Componentes afetados: CalendarioMini, FiltroLateral, TabelaEscala, ModalGerenciarPlantao
- Sem alterações em APIs de backend ou dependências externas
- Visual alinhado com Material Design 3 + Tailwind CSS
