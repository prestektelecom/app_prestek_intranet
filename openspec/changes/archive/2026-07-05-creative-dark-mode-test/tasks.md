# Tasks - Creative Dark Mode Testing

## Fundação
- [ ] Criar definições de variáveis em [index.css](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/index.css) para as 3 classes: `.dark-cyber`, `.dark-aurora`, `.dark-amoled`.
- [ ] Atualizar [useTheme.ts](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/hooks/useTheme.ts) para injetar e ler a classe correta no HTML e ler/escrever `dark_theme_variant` no `localStorage`.
- [ ] Adicionar as paletas de cores correspondentes em [useBentoTheme.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/hooks/useBentoTheme.js) para sincronizar o objeto JS com a variante ativa.

## Interface do Usuário
- [ ] Modificar [Configuracoes.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Configuracoes.jsx) para exibir a opção "Estilo do Tema Escuro" quando a aparência for escura (ou em qualquer caso, mostrando previews das variantes).
- [ ] Ajustar estilos dos widgets Bento do [Dashboard.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Dashboard.jsx) para garantir legibilidade impecável nas 3 variações.
- [ ] Otimizar componentes auxiliares (Header, Sidebar, MobileBottomNav, etc.) para garantir transição suave de tema e variante.

## Validação
- [ ] Testar se a alternância de variantes altera em tempo real o visual da dashboard e demais páginas.
- [ ] Verificar se a variante preferida persiste ao recarregar a página ou fazer login/logout.
