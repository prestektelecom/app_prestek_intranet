## 1. Preparação

- [ ] 1.1 Abrir `src/components/Sectors.jsx` e identificar o componente `OrgChart` e `OrgNode`
- [ ] 1.2 Confirmar as cores/estilos disponíveis no `useBentoTheme()` que serão reutilizados

## 2. Modelagem da árvore

- [ ] 2.1 Substituir o array flat `directors` por uma estrutura de árvore aninhada representando CEO → áreas → sub-setores
- [ ] 2.2 Incluir flag `isStaff` nas áreas RH / Cultura Performance e TI / Sistemas / BI
- [ ] 2.3 Atualizar o nó raiz para CEO Severino Júnior (Sócio Diretor) e ajustar foto/avatar

## 3. Componentes de nó

- [ ] 3.1 Evoluir `OrgNode` para suportar variantes de tamanho (`size: lg | md | sm`)
- [ ] 3.2 Adicionar renderização opcional de sub-setores dentro de cada nó pai
- [ ] 3.3 Garantir que ícones por área façam sentido (ex.: `precision_manufacturing`, `storefront`, `support_agent`, `account_balance`, `groups`, `dns`)

## 4. Layout e conectores

- [ ] 4.1 Renderizar as 4 áreas operacionais em uma fileira com conectores sólidos partindo do CEO
- [ ] 4.2 Renderizar as 2 áreas de staff em uma segunda fileira, separada, com conectores tracejados
- [ ] 4.3 Implementar linhas verticais conectando cada área aos seus sub-setores empilhados
- [ ] 4.4 Garantir `min-width` e `overflowX: auto` para scroll horizontal em telas pequenas

## 5. Estilo e responsividade

- [ ] 5.1 Manter gradiente roxo no card do CEO
- [ ] 5.2 Manter fundo dark, bordas sutis e sombras nos demais nós
- [ ] 5.3 Ajustar tamanhos de fonte/padding nos nós filhos para manter proporção visual
- [ ] 5.4 Testar visualmente em diferentes larguras de viewport

## 6. Validação

- [ ] 6.1 Verificar se todos os 6 braços e sub-setores estão presentes conforme spec
- [ ] 6.2 Confirmar que as linhas de staff são tracejadas e separadas
- [ ] 6.3 Validar que não houve alterações em APIs ou banco de dados
- [ ] 6.4 Rodar o linter/build para garantir que não há erros de sintaxe
