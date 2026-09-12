## ADDED Requirements

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
