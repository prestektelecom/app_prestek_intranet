## ADDED Requirements

### Requirement: Ações primárias de widgets legíveis em todos os temas
Toda ação primária de um widget do Dashboard (botão sólido no accent da marca) SHALL ter contraste mínimo de 4,5:1 entre o texto e o preenchimento, nos cinco temas, e SHALL NOT herdar uma cor de fundo de uma constante de estilo base que contradiga a cor de preenchimento pretendida.

#### Scenario: Botão de gerenciar chamados no tema claro
- **WHEN** o widget de OS é exibido no tema claro
- **THEN** o botão "Gerenciar Meus Chamados" tem fundo no accent da marca e texto legível, com contraste ≥ 4,5:1

#### Scenario: Botão de gerenciar chamados nos temas escuros
- **WHEN** o widget de OS é exibido em qualquer tema escuro
- **THEN** o botão mantém a mesma cor de preenchimento e o mesmo contraste do tema claro, não um resultado diferente por acidente de especificidade CSS

### Requirement: Badges de estado com contraste de texto AA
Todo texto de badge que comunica um estado semântico (sucesso, aviso, perigo) sobre um fundo "-soft" do tema SHALL usar o token de texto correspondente (`-strong`), não o token pensado para preenchimento gráfico (`-bento`), e SHALL manter contraste mínimo de 4,5:1 nos cinco temas.

#### Scenario: Badge "Tudo em dia"
- **WHEN** o widget de OS mostra o badge de status "Tudo em dia"
- **THEN** o texto do badge rende no mínimo 4,5:1 contra o fundo, em todos os temas

### Requirement: Brilho de hover na paleta da marca
O efeito de brilho de proximidade do mouse usado nos cards do Dashboard SHALL usar as cores do tema ativo (accent e suas variações), não uma paleta fixa alheia à marca, mantendo o comportamento de seguir o cursor.

#### Scenario: Hover num card do Dashboard
- **WHEN** o cursor se aproxima da borda de um card do Dashboard
- **THEN** o brilho que aparece é derivado do accent do tema ativo, não das cores fixas de demonstração do componente
