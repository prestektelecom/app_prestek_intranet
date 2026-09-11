## ADDED Requirements

### Requirement: Modal acessível por teclado e leitor de tela
O modal de abertura de chamado de TI SHALL ser exposto como um diálogo (`role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o título visível). Ao abrir, o foco SHALL mover-se para dentro do modal; enquanto aberto, a navegação por Tab SHALL permanecer restrita aos controles do modal; pressionar Escape SHALL fechar o modal e devolver o foco ao controle que o abriu.

#### Scenario: Abrir o modal por teclado
- **WHEN** o usuário aciona "Suporte TI" pelo teclado
- **THEN** o foco entra no modal e um leitor de tela anuncia um diálogo com o título correspondente

#### Scenario: Navegar dentro do modal aberto
- **WHEN** o modal de Suporte de TI está aberto e o usuário pressiona Tab repetidamente
- **THEN** o foco percorre apenas os controles do modal, sem visitar elementos da página por trás

#### Scenario: Fechar com Escape
- **WHEN** o modal está aberto e o usuário pressiona Escape
- **THEN** o modal fecha e o foco volta ao controle que o abriu
