## 1. Fundação e componentes compartilhados

- [x] 1.1 Corrigir carregamento da fonte Material Symbols em `index.html` com preload/fallback
- [x] 1.2 Criar componente `ResponsiveBreadcrumb` em `src/components/responsive/ResponsiveBreadcrumb.jsx`
- [x] 1.3 Criar componente `MobileDrawer` em `src/components/responsive/MobileDrawer.jsx`
- [x] 1.4 Criar componente `FilterBar` em `src/components/responsive/FilterBar.jsx`
- [x] 1.5 Criar componente `PageShell` em `src/components/responsive/PageShell.jsx`
- [x] 1.6 Refatorar `src/components/Header.jsx` para usar Tailwind com breakpoints responsivos
- [x] 1.7 Refatorar `src/components/Sidebar.jsx` para desaparecer abaixo de `lg` e integrar com `MobileDrawer`
- [x] 1.8 Adicionar botão de menu no `Header` para abrir `MobileDrawer` em telas pequenas
- [x] 1.9 Criar hook/utilitário `useTouchOnly` ou classe para detectar hover support

## 2. Componentes de tabela e ações

- [x] 2.1 Criar componente `ResponsiveTable` em `src/components/responsive/ResponsiveTable.jsx`
- [x] 2.2 Implementar modo card do `ResponsiveTable` para viewports abaixo de `md`
- [x] 2.3 Implementar modo tabela com scroll controlado do `ResponsiveTable` entre `md` e `lg`
- [x] 2.4 Criar padrão `TouchFriendlyActions` para cards (`src/components/responsive/TouchFriendlyActions.jsx`)
- [x] 2.5 Documentar convenção de área de toque mínima 44x44px para ações

## 3. Páginas críticas

- [x] 3.1 Adaptar KPIs e Bento cards internos em `src/components/Dashboard.jsx`
- [x] 3.2 Configurar `react-grid-layout` para salvar layouts em múltiplos breakpoints
- [x] 3.3 Tornar a página de Cobertura fluida: filtros, mapa e lista de cidades
- [x] 3.4 Converter lista de cidades da Cobertura em drawer mobile abaixo de `md`
- [x] 3.5 Adaptar grid de cards do `Directory.jsx` para 1/2/3+ colunas por breakpoint
- [x] 3.6 Tornar ações dos cards do Diretório acessíveis por toque

## 4. Tabelas de alta densidade

- [x] 4.1 Aplicar `ResponsiveTable` em `src/components/Schedule.jsx` (Escala/Agenda)
- [x] 4.2 Aplicar `ResponsiveTable` em `src/components/TicketsList.jsx` (Chamados)
- [x] 4.3 Aplicar `ResponsiveTable` em `src/components/Processos.jsx`
- [x] 4.4 Aplicar `ResponsiveTable` em `src/components/Offices.jsx` (Escritórios)
- [x] 4.5 Aplicar `ResponsiveTable` em `src/components/AdminUsuarios.jsx`
- [x] 4.6 Aplicar `ResponsiveTable` em `src/components/AdminComunicados.jsx`

## 5. Páginas restantes e polimento

- [x] 5.1 Adaptar `src/components/Comunicados.jsx` para layout fluido
- [x] 5.2 Adaptar `src/components/ServicesDirectory.jsx` para grids responsivos e ações por toque
- [x] 5.3 Adaptar `src/components/Settings.jsx` ou página equivalente para mobile
- [x] 5.4 Revisar e ajustar `src/App.jsx` para garantir padding e espaçamento responsivo
- [x] 5.5 Adicionar classes utilitárias responsivas em `tailwind.config.js` se necessário

## 6. Testes e validação

- [x] 6.1 Testar visualmente nos breakpoints `sm` (640px), `md` (768px), `lg` (1024px) e `xl` (1280px)
- [x] 6.2 Validar que ícones não aparecem como texto em nenhuma página
- [x] 6.3 Validar que não há scroll horizontal forçado em mobile nas páginas refatoradas
- [x] 6.4 Validar que ações em cards são acessíveis por toque
- [x] 6.5 Validar que o `MobileDrawer` abre/fecha corretamente e não quebra o layout
- [x] 6.6 Revisar código para identificar e converter inline styles críticos restantes em Tailwind

## 7. Documentação e entrega

- [x] 7.1 Documentar convenção de estilos responsivos no `AGENTS.md` ou arquivo de estilo do projeto
- [x] 7.2 Atualizar CHANGELOG ou notas de release se aplicável
- [x] 7.3 Arquivar a change com `openspec archive` após merge/validação
