## ADDED Requirements

### Requirement: Seleção de planos para comparação
O sistema SHALL permitir ao usuário selecionar entre 2 e 3 planos para comparação através de um checkbox "Comparar" presente em cada card de plano na `ServicesDirectory`.

#### Scenario: Seleção do primeiro plano
- **WHEN** o usuário marca o checkbox "Comparar" em um card
- **THEN** o card é marcado visualmente como selecionado (ex: borda destacada)
- **AND** um indicador flutuante aparece informando quantos planos foram selecionados

#### Scenario: Seleção de um segundo plano ativa o comparador
- **WHEN** o usuário marca o checkbox "Comparar" em um segundo card
- **THEN** o drawer de comparação aparece na parte inferior da tela com os 2 planos selecionados lado a lado

#### Scenario: Tentativa de selecionar um 4º plano
- **WHEN** 3 planos já estão selecionados e o usuário tenta marcar um 4º checkbox
- **THEN** o sistema exibe um toast de aviso: "Máximo de 3 planos para comparação"
- **AND** o 4º plano NÃO é adicionado à seleção

#### Scenario: Desmarcação de um plano
- **WHEN** o usuário desmarca o checkbox de um plano já selecionado
- **THEN** esse plano é removido do drawer de comparação
- **AND** se restar menos de 2 planos selecionados, o drawer fecha

#### Scenario: Fechar o comparador via botão
- **WHEN** o usuário clica em "Fechar comparação" dentro do drawer
- **THEN** o drawer fecha com animação
- **AND** todos os checkboxes são desmarcados

---

### Requirement: Drawer de comparação lado a lado
O sistema SHALL exibir um drawer fixo na parte inferior da tela com uma tabela comparativa dos planos selecionados, permanecendo visível independentemente do scroll da página.

#### Scenario: Layout com 2 planos
- **WHEN** o drawer exibe 2 planos selecionados
- **THEN** cada plano ocupa uma coluna de igual largura na tabela

#### Scenario: Layout com 3 planos
- **WHEN** o drawer exibe 3 planos selecionados
- **THEN** cada plano ocupa uma das 3 colunas de igual largura na tabela

#### Scenario: Campos exibidos na comparação
- **WHEN** o drawer está aberto com planos selecionados
- **THEN** a tabela exibe as seguintes linhas para cada plano:
  - Nome do plano (`descricao`)
  - Valor Mensal (`valor_mensal` formatado como moeda)
  - Taxa de Instalação (`taxa_instalacao` formatado como moeda, ou "R$ 0,00" se ausente)
  - Prazo de Entrega (`prazo_instalacao` ou "A consultar" se ausente)
  - Streaming Inclusos (sempre exibe "—")

#### Scenario: Destaque do melhor valor
- **WHEN** o drawer compara 2 ou 3 planos com valores monetários diferentes
- **THEN** o plano com menor `valor_mensal` tem sua coluna de valor destacada visualmente (ex: cor verde ou badge "Melhor Preço")

#### Scenario: Animação de entrada do drawer
- **WHEN** o segundo plano é selecionado e o drawer deve aparecer
- **THEN** o drawer entra deslizando de baixo para cima com transição suave (300ms)

#### Scenario: Animação de saída do drawer
- **WHEN** o drawer é fechado (via botão ou ao restar menos de 2 planos)
- **THEN** o drawer sai deslizando para baixo com transição suave (300ms)
