# processos-integridade-acessibilidade Specification

## Purpose
Garante que o diálogo de gerenciamento de categorias tenha semântica completa, que a tela seja honesta sobre a não-persistência atual do CRUD de processos, que a permissão de edição de processo seja consistente com a de categorias, que a categoria padrão de um processo novo nunca aponte para um id inexistente, e que os controles de filtro/administração atendam ao alvo mínimo de toque.

## Requirements

### Requirement: Diálogo de gerenciamento de categorias tem semântica completa

O `CategoriasAdminModal` SHALL ter `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, foco inicial dentro do diálogo, fechar via Escape, e Tab preso dentro do diálogo enquanto aberto.

#### Scenario: Escape fecha o diálogo de categorias
- **WHEN** o administrador pressiona Escape com o diálogo de gerenciamento de categorias aberto
- **THEN** o diálogo fecha

#### Scenario: Tab não escapa para a página por trás
- **WHEN** o administrador pressiona Tab repetidamente dentro do diálogo de categorias aberto
- **THEN** o foco permanece circulando entre os controles do próprio diálogo, nunca alcançando um botão da página por trás (ex: "Novo Processo")

### Requirement: A tela informa que os processos exibidos não são persistidos

Enquanto a lista de processos não for apoiada por uma API real, a tela SHALL exibir um aviso visível informando que os dados de processo são de demonstração e não são salvos permanentemente.

#### Scenario: Aviso visível ao usar a tela
- **WHEN** a tela de Processos Operacionais é exibida
- **THEN** um aviso visível informa que os processos são dados de demonstração, não persistidos

### Requirement: Criar ou editar um processo é restrito a administradores

A ação de criar um novo processo e de abrir um processo existente para edição SHALL estar disponível apenas para usuários com `is_admin`, no mesmo padrão já aplicado ao gerenciamento de categorias.

#### Scenario: Usuário não-admin não vê o botão de criar processo
- **WHEN** um usuário sem `is_admin` acessa a tela de Processos Operacionais
- **THEN** o botão "Novo Processo" do hero não é exibido para esse usuário

### Requirement: Categoria padrão de um processo novo nunca é órfã

O formulário de novo processo SHALL usar como categoria padrão um id presente na lista de categorias atualmente carregada, e SHALL validar no envio que a categoria escolhida ainda existe nessa lista.

#### Scenario: Categoria padrão calculada a partir da lista carregada
- **WHEN** o formulário de novo processo é aberto
- **THEN** a categoria pré-selecionada é a primeira da lista de categorias carregada, não um identificador fixo no código

#### Scenario: Envio com categoria inexistente é bloqueado
- **WHEN** o formulário é enviado com uma categoria que não está mais entre as categorias carregadas
- **THEN** o envio é bloqueado com uma mensagem de erro, em vez de gravar um processo com categoria órfã

### Requirement: Alvos de toque mínimos nos controles de Processos

Os chips de filtro de categoria e os ícones de editar/excluir do gerenciamento de categorias SHALL ter área de toque efetiva de no mínimo 44×44px.

#### Scenario: Chip de categoria alcança o mínimo de toque
- **WHEN** um chip de filtro de categoria é renderizado
- **THEN** sua altura é de no mínimo 44px
