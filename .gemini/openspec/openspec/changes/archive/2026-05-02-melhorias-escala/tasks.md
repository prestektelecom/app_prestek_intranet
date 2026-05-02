# Tarefas: Melhorias na Escala de Plantão (Schedule.jsx)

- [ ] **Fase 1: Preparação e Extração de Utilitários**
  - [ ] Criar arquivo `src/utils/dateHelpers.js`.
  - [ ] Mover funções `formatarData`, `getDiaSemana`, `isFimDeSemana`, e `toIsoDay` do `Schedule.jsx` para `dateHelpers.js`.
  - [ ] Criar arquivo `src/services/exportService.js` para as funções de impressão e exportação iCal (opcional, focar na limpeza do componente).

- [ ] **Fase 2: Extração de Hooks (Gerenciamento de Estado e API)**
  - [ ] Criar arquivo `src/hooks/useScheduleData.js`.
  - [ ] Mover estados de `plantoes`, `funcionarios`, e funções de fetch (`fetchPlantoes`, `fetchFuncionarios`, `fetchHistorico`) para o hook.
  - [ ] Garantir o correto retorno dos dados e funções de controle (loading, erro) para o componente principal.

- [ ] **Fase 3: Refatoração do `Schedule.jsx`**
  - [ ] Importar e utilizar `useScheduleData`.
  - [ ] Importar e utilizar funções do `dateHelpers.js`.
  - [ ] Aplicar `useMemo` na lista `filteredPlantoes` para otimizar renderizações.

- [ ] **Fase 4: UX/UI e Novas Funcionalidades**
  - [ ] Criar componente visual de *Skeleton Loading* para a tabela enquanto `loading` for true.
  - [ ] Substituir texto de "Nenhum plantão agendado" por um *Empty State* com botão de limpar filtros.
  - [ ] Adicionar destaque visual (highlight) na linha/card que corresponder ao dia de hoje na tabela.
  - [ ] Adicionar funcionalidade de filtro "Meus Plantões" (verificar o id/nome do usuário logado contra as escalas).

- [ ] **Fase 5: Verificação Final**
  - [ ] Testar carregamento da tela e filtros.
  - [ ] Testar funções de exportação/impressão com as novas importações.
  - [ ] Testar criação/edição de plantões (caso logado como admin).
