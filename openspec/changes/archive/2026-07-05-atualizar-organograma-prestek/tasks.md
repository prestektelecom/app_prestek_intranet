## 1. Preparação

- [x] 1.1 Abrir `src/components/Sectors.jsx` e identificar o componente `OrgChart` e `OrgNode`
- [x] 1.2 Confirmar as cores/estilos disponíveis no `useBentoTheme()` que serão reutilizados

## 2. Modelagem da hierarquia

- [x] 2.1 Criar estrutura de dados representando CEO → 6 áreas → sub-setores
- [x] 2.2 Atualizar o nó raiz para CEO Severino Júnior (Sócio Diretor)
- [x] 2.3 Incluir as 6 áreas: Gerente Operacional, Supervisor Comercial, Supervisor Relacionamento com Cliente, Controladoria, RH/Cultura/Performance e TI/Sistemas/BI
- [x] 2.4 Incluir sub-setores abaixo de cada área conforme organograma alvo

## 3. Componentes de nó

- [x] 3.1 Criar componente `OrgAreaNode` para áreas de primeiro nível com ícones apropriados
- [x] 3.2 Criar componente `OrgLeafNode` para sub-setores compactos
- [x] 3.3 Implementar `AreaColumn` para empilhar sub-setores verticalmente abaixo de cada área

## 4. Layout e conectores

- [x] 4.1 Renderizar CEO centralizado com gradiente roxo
- [x] 4.2 Renderizar as 6 áreas em grid horizontal
- [x] 4.3 Implementar conectores verticais/horizontes do CEO para cada área
- [x] 4.4 Implementar conectores verticais entre cada área e seus sub-setores
- [x] 4.5 Garantir `min-width` e `overflowX: auto` para scroll horizontal em telas pequenas

## 5. Estilo e identificação de staff

- [x] 5.1 Diferenciar áreas de staff (RH e TI) com borda tracejada e fundo sutil
- [x] 5.2 Manter fundo dark, bordas sutis e sombras nos demais nós
- [x] 5.3 Ajustar tamanhos de fonte/padding para manter proporção visual

## 6. Editor no-code/low-code

- [x] 6.1 Extrair dados do organograma para `src/data/orgchart.json`
- [x] 6.2 Criar hook `useOrgChartData` para carregar JSON base e persistir overrides no `localStorage`
- [x] 6.3 Criar componente `OrgChartEditor` com UI visual para editar CEO, áreas e sub-setores
- [x] 6.4 Adicionar aba de exportação/importação de JSON
- [x] 6.5 Integrar botão "Editar" no card do organograma na página de Setores

## 7. Validação

- [x] 7.1 Verificar se todos os 6 braços e sub-setores estão presentes conforme spec
- [x] 7.2 Confirmar que as áreas de staff são identificadas visualmente
- [x] 7.3 Validar que não houve alterações em APIs ou banco de dados
- [x] 7.4 Rodar o linter/build para garantir que não há erros de sintaxe
