# gamificacao-podio-vendas Specification

## Purpose
TBD - created by archiving change podio-gamificado. Update Purpose after archive.
## Requirements
### Requirement: Deterministic Avatar Resolution
O sistema SHALL carregar e exibir um avatar 3D correspondente a cada vendedora do Top 3 de forma determinística com base em seu ID e nome, mapeando-o através da lista `AVATAR_PNGS` exportada por `avatarPngs.js`.

#### Scenario: Display 3D Avatar for Salesperson
- **WHEN** os dados das vendedoras do Top 3 são carregados com sucesso no painel de Serviços Internos
- **THEN** o sistema SHALL renderizar a imagem do avatar 3D correspondente determinado por `resolveAvatarUrl` ao invés de um ícone genérico de usuário

### Requirement: Interactive Confetti Celebration
O sistema SHALL disparar uma comemoração visual de confetes na tela usando a biblioteca `canvas-confetti` sempre que a aba de pódios de vendas ("Pódio") for exibida para o usuário.

#### Scenario: Trigger Confetti when Tab is Active
- **WHEN** o usuário seleciona e visualiza a aba de Pódio de Vendas no diretório de serviços
- **THEN** o sistema SHALL injetar dinamicamente o script de `canvas-confetti` (caso não esteja carregado) e disparar confetes flutuantes pelas laterais e centro da tela

### Requirement: Premium Visual Podiums
O sistema SHALL aplicar estilos premium de destaque de pódio contendo bordas brilhantes com gradiente azul/ciano (`glow`), coroas animadas flutuantes no 1º lugar e badges metálicos modernos (ouro, prata e bronze) para o Top 3 de vendas.

#### Scenario: Apply Premium Styling to Top 3
- **WHEN** as posições de pódio (1º, 2º e 3º lugar) forem renderizadas na tela
- **THEN** o primeiro colocado SHALL exibir uma coroa flutuante e borda pulsante com brilho azul/ciano, e todos os três colocados SHALL possuir seus respectivos badges de classificação visíveis.

