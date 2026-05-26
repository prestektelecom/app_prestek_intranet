## ADDED Requirements

### Requirement: Scroll infinito via IntersectionObserver
A lista de colaboradores SHALL exibir os primeiros 16 resultados e carregar mais 16 automaticamente quando o usuário rolar até o final da lista, usando `IntersectionObserver` nativo sem dependências externas. Ao alterar filtro (busca ou departamento), o contador de itens visíveis SHALL resetar para 16.

#### Scenario: Carga inicial com 16 cards
- **WHEN** a aba Colaboradores é carregada com sucesso
- **THEN** apenas os primeiros 16 colaboradores (filtrados) são renderizados

#### Scenario: Scroll até o sentinel carrega mais
- **WHEN** o usuário rola a página até o elemento sentinel (div no final da lista)
- **THEN** mais 16 colaboradores são adicionados à lista renderizada

#### Scenario: Reset ao filtrar
- **WHEN** o usuário altera o texto de busca ou seleciona um chip de departamento diferente
- **THEN** o `visibleCount` reseta para 16, exibindo apenas os primeiros 16 resultados do novo filtro

#### Scenario: Sentinel oculto ao atingir o total
- **WHEN** todos os colaboradores filtrados já estão renderizados (`visibleCount >= total filtrado`)
- **THEN** o sentinel deixa de ser observado e nenhum carregamento adicional ocorre

#### Scenario: Indicador de carregamento
- **WHEN** há mais colaboradores a carregar e o sentinel é visível
- **THEN** um spinner ou skeleton sutil é exibido abaixo da lista enquanto novos cards são adicionados
