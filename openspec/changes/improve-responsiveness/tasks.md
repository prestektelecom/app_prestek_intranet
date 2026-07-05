## 1. Fundação e componentes compartilhados

- [ ] 1.1 Corrigir carregamento da fonte Material Symbols em `index.html` com preload/fallback
- [ ] 1.2 Criar componente `ResponsiveBreadcrumb` em `src/components/responsive/ResponsiveBreadcrumb.jsx`
- [ ] 1.3 Criar componente `MobileDrawer` em `src/components/responsive/MobileDrawer.jsx`
- [ ] 1.4 Criar componente `FilterBar` em `src/components/responsive/FilterBar.jsx`
- [ ] 1.5 Criar componente `PageShell` em `src/components/responsive/PageShell.jsx`
- [ ] 1.6 Refatorar `src/components/Header.jsx` para usar Tailwind com breakpoints responsivos
- [ ] 1.7 Refatorar `src/components/Sidebar.jsx` para desaparecer abaixo de `lg` e integrar com `MobileDrawer`
- [ ] 1.8 Adicionar botão de menu no `Header` para abrir `MobileDrawer` em telas pequenas
- [ ] 1.9 Criar hook/utilitário `useTouchOnly` ou classe para detectar hover support

## 2. Componentes de tabela e ações

- [ ] 2.1 Criar componente `ResponsiveTable` em `src/components/responsive/ResponsiveTable.jsx`
- [ ] 2.2 Implementar modo card do `ResponsiveTable` para viewports abaixo de `md`
- [ ] 2.3 Implementar modo tabela com scroll controlado do `ResponsiveTable` entre `md` e `lg`
- [ ] 2.4 Criar padrão `TouchFriendlyActions` para cards (`src/components/responsive/TouchFriendlyActions.jsx`)
- [ ] 2.5 Documentar convenção de área de toque mínima 44x44px para ações

## 3. Páginas críticas

- [ ] 3.1 Adaptar KPIs e Bento cards internos em `src/components/Dashboard.jsx`
- [ ] 3.2 Configurar `react-grid-layout` para salvar layouts em múltiplos breakpoints
- [ ] 3.3 Tornar a página de Cobertura fluida: filtros, mapa e lista de cidades
- [ ] 3.4 Converter lista de cidades da Cobertura em drawer mobile abaixo de `md`
- [ ] 3.5 Adaptar grid de cards do `Directory.jsx` para 1/2/3+ colunas por breakpoint
- [ ] 3.6 Tornar ações dos cards do Diretório acessíveis por toque

## 4. Tabelas de alta densidade

- [ ] 4.1 Aplicar `ResponsiveTable` em `src/components/Schedule.jsx` (Escala/Agenda)
- [ ] 4.2 Aplicar `ResponsiveTable` em `src/components/TicketsList.jsx` (Chamados)
- [ ] 4.3 Aplicar `ResponsiveTable` em `src/components/Processos.jsx`
- [ ] 4.4 Aplicar `ResponsiveTable` em `src/components/Offices.jsx` (Escritórios)
- [ ] 4.5 Aplicar `ResponsiveTable` em `src/components/AdminUsuarios.jsx`
- [ ] 4.6 Aplicar `ResponsiveTable` em `src/components/AdminComunicados.jsx`

## 5. Páginas restantes e polimento

- [ ] 5.1 Adaptar `src/components/Comunicados.jsx` para layout fluido
- [ ] 5.2 Adaptar `src/components/ServicesDirectory.jsx` para grids responsivos e ações por toque
- [ ] 5.3 Adaptar `src/components/Settings.jsx` ou página equivalente para mobile
- [ ] 5.4 Revisar e ajustar `src/App.jsx` para garantir padding e espaçamento responsivo
- [ ] 5.5 Adicionar classes utilitárias responsivas em `tailwind.config.js` se necessário

## 6. Testes e validação

- [ ] 6.1 Testar visualmente nos breakpoints `sm` (640px), `md` (768px), `lg` (1024px) e `xl` (1280px)
- [ ] 6.2 Validar que ícones não aparecem como texto em nenhuma página
- [ ] 6.3 Validar que não há scroll horizontal forçado em mobile nas páginas refatoradas
- [ ] 6.4 Validar que ações em cards são acessíveis por toque
- [ ] 6.5 Validar que o `MobileDrawer` abre/fecha corretamente e não quebra o layout
- [ ] 6.6 Revisar código para identificar e converter inline styles críticos restantes em Tailwind

## 7. Documentação e entrega

- [ ] 7.1 Documentar convenção de estilos responsivos no `AGENTS.md` ou arquivo de estilo do projeto
- [ ] 7.2 Atualizar CHANGELOG ou notas de release se aplicável
- [ ] 7.3 Arquivar a change com `openspec archive` após merge/validação
