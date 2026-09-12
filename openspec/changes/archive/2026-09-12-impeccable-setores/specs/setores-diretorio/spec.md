## ADDED Requirements

### Requirement: Situação de setor e de responsável não vaza como texto cru
Quando o nome de um setor ou de um responsável vem do backend com um prefixo entre parênteses indicando situação (ex.: `(INATIVO)`, `(AFASTADO)`, `(FÉRIAS)`), a tela SHALL extrair esse prefixo, exibir o nome limpo e apresentar a situação como um badge visual, na mesma paleta (`coresSituacao`) já usada pelo Diretório de Colaboradores.

Setores cuja situação extraída não for "Ativo" SHALL ser ordenados sempre depois de todos os setores sem situação especial, independente do critério de ordenação escolhido (nome ou número de membros).

#### Scenario: Setor inativo não aparece primeiro
- **WHEN** a lista de setores é ordenada por nome (A-Z)
- **THEN** um setor cujo nome tem o prefixo `(INATIVO)` aparece depois de todos os setores sem esse prefixo, mesmo que seu nome comece com uma letra anterior

#### Scenario: Badge de situação no card e na linha
- **WHEN** um setor ou seu responsável tem uma situação diferente de "Ativo"
- **THEN** um badge com o rótulo da situação (ex.: "Inativo", "Afastado") é exibido junto ao nome, na visão em cards e na visão em lista

### Requirement: Contraste e tipografia do diretório de setores
Os textos reais de `SectorCard`, `SectorRow` e `SectorsToolbar` (rótulos "Responsável"/"Equipe"/"Composição", contadores, textos de botão) SHALL usar um tom de texto secundário com no mínimo 4,5:1 de contraste (`C.ink2`/`text-faint`) em vez de `C.muted`/`text-muted`, e SHALL usar tamanhos da rampa tipográfica documentada em `DESIGN.md` (Overline 11px, Label/Mono 13px, Body 14px, título de card 18px).

O toggle de visão (Cards/Lista) ativo SHALL usar um tom de texto que inverte por tema (`--accent-dark`), não o tom de marca (`--accent`) diretamente.

#### Scenario: Rótulos do card legíveis nos cinco temas
- **WHEN** os rótulos "Responsável", "Equipe" e "Composição" são renderizados em qualquer tema
- **THEN** seu contraste contra o fundo é de no mínimo 4,5:1

### Requirement: Alvos de toque mínimos
O toggle de visão (Cards/Lista) e o botão "Ver mais" da descrição do card SHALL ter área de toque efetiva de no mínimo 44px, mesmo quando a caixa visual for menor (via expansão por pseudo-elemento, sem alterar o layout).

#### Scenario: "Ver mais" com alvo de 44px
- **WHEN** o botão "Ver mais" é renderizado
- **THEN** sua área de toque efetiva (incluindo a expansão invisível) mede no mínimo 44px de altura
