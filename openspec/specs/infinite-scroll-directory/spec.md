# infinite-scroll-directory Specification

## Purpose
O carregamento incremental da lista de colaboradores, e os estados que a lista assume enquanto carrega, falha ou fica vazia.

## Requirements

### Requirement: Scroll infinito via IntersectionObserver
A lista SHALL exibir os primeiros 16 resultados e carregar mais 16 quando o usuário rolar até o sentinel, usando `IntersectionObserver` nativo. Ao alterar busca ou departamento, o contador de itens visíveis SHALL resetar para 16.

#### Scenario: Carga inicial com 16 itens
- **WHEN** a aba é carregada com sucesso
- **THEN** apenas os primeiros 16 colaboradores filtrados são renderizados

#### Scenario: Scroll até o sentinel carrega mais
- **WHEN** o usuário rola até o sentinel
- **THEN** mais 16 colaboradores são adicionados

#### Scenario: Reset ao filtrar
- **WHEN** o usuário altera a busca ou seleciona outro departamento
- **THEN** a contagem visível reseta para 16

#### Scenario: Sentinel some ao esgotar
- **WHEN** todos os colaboradores filtrados já estão renderizados
- **THEN** o sentinel deixa de ser observado e o observer é desconectado ao desmontar

### Requirement: Carregamento incremental anunciado
O contador de resultados SHALL ter `aria-live="polite"`.

Sem isso, o scroll infinito injeta 16 itens no DOM sem nenhum anúncio — o recurso simplesmente não existe para quem usa leitor de tela.

#### Scenario: Novos itens são anunciados
- **WHEN** um novo lote é carregado
- **THEN** o texto "Exibindo X de Y colaboradores" é atualizado e anunciado

### Requirement: Lista semântica
O container dos colaboradores SHALL ser `<ul>` e cada colaborador SHALL ser um `<li>`, tanto na visão em grid quanto na visão em lista.

#### Scenario: Leitor de tela anuncia a lista
- **WHEN** um leitor de tela entra na lista
- **THEN** anuncia a quantidade de itens e delimita cada colaborador

### Requirement: Esqueleto espelha o resultado final
O esqueleto SHALL ser renderizado na mesma quantidade do primeiro lote (16) e com o mesmo layout do item real da visão ativa.

Um esqueleto que não prevê o layout final não reduz espera percebida — produz um salto visível quando os dados chegam.

#### Scenario: Grid não salta ao carregar
- **WHEN** os dados chegam com a visão em grid ativa
- **THEN** os cards ocupam a mesma área que os esqueletos ocupavam

#### Scenario: Esqueleto acompanha a visão
- **WHEN** a visão em lista está ativa e os dados carregam
- **THEN** esqueletos de linha são exibidos, não esqueletos de card

### Requirement: Falha de carregamento é distinguida de lista vazia
Quando `/api/colaboradores` não responde ou responde sem sucesso, a tela SHALL exibir um estado de erro com ação de "Tentar novamente", e SHALL NOT exibir o estado vazio.

Quando os colaboradores chegam mas **nenhuma** das tabelas de departamento responde, a tela SHALL exibir um aviso não-bloqueante acima da lista, mantendo os colaboradores listados.

#### Scenario: Backend indisponível
- **WHEN** a requisição de colaboradores falha
- **THEN** um bloco com `role="alert"` é exibido, explicando a falha e oferecendo "Tentar novamente"

#### Scenario: Retentativa
- **WHEN** o usuário aciona "Tentar novamente"
- **THEN** todas as requisições são refeitas e a tela volta ao estado de carregamento

#### Scenario: Falha parcial de taxonomia
- **WHEN** os colaboradores carregam mas nenhuma tabela de departamento responde
- **THEN** um aviso com `role="status"` informa que o setor aparece como "N/D" e que o filtro está indisponível
- **AND** os colaboradores continuam listados

#### Scenario: Lista genuinamente vazia
- **WHEN** as requisições têm sucesso e nenhum colaborador casa com os filtros
- **THEN** o estado vazio é exibido, com "Limpar filtros" quando houver filtro ativo
