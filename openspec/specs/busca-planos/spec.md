## ADDED Requirements

### Requirement: Busca textual em tempo real nos planos
O sistema SHALL filtrar os cards de planos exibidos na `ServicesDirectory` em tempo real conforme o usuário digita no campo de busca do Header, correspondendo ao texto nos campos `descricao`, `valor_mensal` e `id` do plano.

#### Scenario: Filtro por nome do plano
- **WHEN** o usuário digita "fibra" no campo de busca estando na view `services`
- **THEN** apenas os cards cujo campo `descricao` contém "fibra" (case-insensitive) são exibidos

#### Scenario: Filtro por valor
- **WHEN** o usuário digita "99,90" no campo de busca
- **THEN** apenas os cards cujo `valor_mensal` formatado como moeda contém "99,90" são exibidos

#### Scenario: Filtro por ID do IXC
- **WHEN** o usuário digita "1042" no campo de busca
- **THEN** apenas os cards cujo campo `id` contém "1042" são exibidos

#### Scenario: Sem resultados
- **WHEN** o termo digitado não corresponde a nenhum plano
- **THEN** a grid exibe estado vazio com mensagem "Nenhum plano encontrado para essa busca."

#### Scenario: Busca ignorada fora da view services
- **WHEN** o usuário digita no campo de busca estando em outra view que não `services`
- **THEN** nenhuma filtragem ocorre em nenhuma parte da interface

#### Scenario: Reset da busca ao trocar de view
- **WHEN** o usuário navega para qualquer view diferente de `services`
- **THEN** o campo de busca é limpo automaticamente e os planos voltam a exibir todos

---

### Requirement: Atalho de teclado Ctrl+K para foco na busca
O sistema SHALL dar foco ao campo de busca do Header quando o usuário pressionar `Ctrl+K` (Windows/Linux) ou `⌘K` (macOS), a partir de qualquer view da intranet.

#### Scenario: Atalho foca o input
- **WHEN** o usuário pressiona `Ctrl+K` (ou `⌘K`) em qualquer view
- **THEN** o campo de busca do Header recebe foco e o cursor de texto aparece nele
- **AND** o comportamento padrão do navegador para esse atalho é suprimido

#### Scenario: Esc limpa e desfoca
- **WHEN** o campo de busca está focado e o usuário pressiona `Escape`
- **THEN** o conteúdo do campo é apagado e o foco é removido do input
