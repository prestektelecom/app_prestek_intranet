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

### Requirement: Ordenação padrão prioriza quem está na empresa hoje
Quando nenhum chip de situação está ativo, a lista filtrada SHALL ser ordenada de forma estável por situação: Ativo, depois Férias, depois Afastado, depois Inativo, depois qualquer situação não reconhecida — na mesma ordem em que os chips aparecem na toolbar.

Quando um chip de situação específico já está ativo, a ordenação por situação SHALL ser dispensada, já que todo o conjunto compartilha a mesma situação.

#### Scenario: Carga inicial mostra ativos primeiro
- **WHEN** a aba é carregada sem nenhum filtro de situação ativo
- **THEN** os primeiros itens exibidos têm todos situação "Ativo", antes de qualquer item Férias/Afastado/Inativo

#### Scenario: Ordem preservada dentro de cada situação
- **WHEN** dois colaboradores têm a mesma situação
- **THEN** a ordem relativa entre eles é a mesma que a API retornou, sem reordenação adicional

### Requirement: Contraste e tipografia do contador e do rodapé
O texto do contador (`aria-live`) e o rodapé "Todos os N colaboradores exibidos" SHALL usar um tom de texto secundário com no mínimo 4,5:1 de contraste (`C.ink2` no sistema de tokens JS, `text-faint` no sistema de variáveis CSS) em vez do tom `muted`/`C.muted`, reservado a ícone inativo e placeholder.

Esses textos SHALL usar 13px (papel Mono da rampa tipográfica), não um tamanho arbitrário fora da rampa documentada em `DESIGN.md`.

#### Scenario: Contador legível nos cinco temas
- **WHEN** o contador de resultados é renderizado em qualquer tema
- **THEN** seu contraste contra o fundo é de no mínimo 4,5:1

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
