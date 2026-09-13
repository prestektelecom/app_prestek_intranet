## REMOVED Requirements

### Requirement: Interactive Confetti Celebration

**Reason**: o efeito de confete foi removido da tela (change `services-directory-confetti-carousel-ux`, arquivada em 2026-09-13) por ser distrativo e disparar a cada 3s sem interação do usuário. Esta spec nunca foi atualizada para refletir a remoção — corrigido agora.

**Migration**: nenhuma; a navegação do carousel passou a ser por tabs com ícone+rótulo (ver capability `carousel-tab-navigation`).

## MODIFIED Requirements

### Requirement: Premium Visual Podiums

O sistema SHALL aplicar estilos premium de destaque de pódio contendo bordas com gradiente laranja da marca (`glow`), coroa animada flutuante no 1º lugar e badges metálicos modernos (ouro, prata e bronze) para o Top 3 de vendas. As cores internas do pódio (fundo, texto, badges) SHALL permanecer fixas independente do tema ativo — o pódio é um cartão opaco autocontido, não precisa inverter por tema. Já o cabeçalho da seção, a legenda de medalhas e as tabs de navegação, por ficarem diretamente sobre o fundo da página, SHALL usar o sistema de tokens de tema (`useBentoTheme`/`var(--accent-*)`/`var(--foreground)`) em vez de cor fixa, para permanecerem legíveis nos cinco temas.

#### Scenario: Apply Premium Styling to Top 3
- **WHEN** as posições de pódio (1º, 2º e 3º lugar) forem renderizadas na tela
- **THEN** o primeiro colocado SHALL exibir uma coroa flutuante e borda pulsante com brilho laranja, e todos os três colocados SHALL possuir seus respectivos badges de classificação visíveis
- **AND** as cores internas do cartão do pódio SHALL ser as mesmas em qualquer tema ativo

#### Scenario: Cabeçalho e legenda legíveis em todos os temas
- **WHEN** o cabeçalho "Top 3 X" e a legenda de medalhas são exibidos em qualquer um dos cinco temas
- **THEN** seu texto tem contraste de no mínimo 4,5:1 contra o fundo da página no tema ativo
