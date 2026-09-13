# cobertura-ui-redesign Specification

## Purpose
TBD - created by archiving change redesign-cobertura. Update Purpose after archive.
## Requirements
### Requirement: Collapsible Left Sidebar for cities/bairros
The list of cities and neighborhoods SHALL reside inside a collapsible left-aligned sidebar panel floating on top of the map.

#### Scenario: User toggles the left sidebar
- **WHEN** the user clicks the collapse button `[ < ]` on the left sidebar
- **THEN** the sidebar slides out or hides from view, maximizing the map area.
- **WHEN** the user clicks the expand button `[ > ]`
- **THEN** the sidebar expands back to its floating list state.

### Requirement: Sincronizar IXC Button
The main action button SHALL be styled with the standard gradient.

#### Scenario: User triggers the sync action
- **WHEN** the user looks at the floating summary panel
- **THEN** the "Sincronizar IXC" button is styled with `bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white`.

### Requirement: Override Modal aesthetic update
The configuration modal (`OverrideModal`) SHALL use modern inputs, background contrast, and focus rings (`focus:ring-[#4A9EF5]`).

#### Scenario: User opens the configuration modal
- **WHEN** the user triggers the configuration action for a neighborhood row
- **THEN** the modal renders with correct theme contrast, rounded inputs, and focused rings.

### Requirement: Layout fluido na Central de Cobertura
A página de Cobertura SHALL ter layout fluido, com filtros responsivos, mapa adaptável e lista de cidades acessível em mobile.

O container raiz da página SHALL ocupar toda a largura disponível no shell, de modo que as regras de largura máxima e centralização do conteúdo tenham efeito observável.

O mapa SHALL ser tratado como o elemento protagonista da página: sua altura SHALL absorver todo o espaço vertical não consumido pelo cromo acima dele, e nenhum limiar responsivo SHALL reduzir sua largura ou altura quando a viewport aumenta. Ao decidir um limiar, o layout SHALL considerar a largura real de conteúdo disponível (viewport menos a sidebar do shell e o padding do container), não a largura da viewport.

O espaçamento da página SHALL seguir o mesmo sistema da Central de Vendas, de modo que as duas telas leiam como o mesmo produto.

#### Scenario: A página ocupa toda a largura disponível no shell
- **WHEN** a página é exibida em qualquer largura de viewport, em qualquer nível de zoom do navegador
- **THEN** o container raiz da página SHALL ocupar toda a largura restante ao lado da sidebar do shell
- **THEN** a página SHALL NOT deixar faixa de espaço não utilizado em apenas um dos lados
- **THEN** quando o conteúdo atingir sua largura máxima, o espaço remanescente SHALL ser distribuído igualmente à esquerda e à direita

#### Scenario: Espaçamento consistente com a Central de Vendas
- **WHEN** a Central de Cobertura e a Central de Vendas são comparadas lado a lado na mesma viewport e no mesmo nível de zoom
- **THEN** ambas SHALL apresentar a mesma largura máxima de conteúdo, o mesmo padding lateral e a mesma margem lateral resultante
- **THEN** os respectivos heroes SHALL compartilhar raio de borda, padding interno e escala tipográfica de título e subtítulo
- **THEN** as diferenças remanescentes entre as duas telas SHALL decorrer apenas do conteúdo, não do sistema de espaçamento

#### Scenario: Aumentar a viewport nunca encolhe o mapa
- **WHEN** a largura da viewport aumenta em qualquer quantidade, a partir de qualquer largura
- **THEN** a largura renderizada do mapa SHALL ser maior ou igual à largura anterior
- **THEN** em particular, ao cruzar o limiar em que a sidebar do shell passa a ser exibida, o mapa SHALL NOT perder largura

#### Scenario: Split lista + mapa só quando há espaço para ambos
- **WHEN** a largura real de conteúdo é insuficiente para acomodar a lista de regiões (mínimo 288px) e um mapa utilizável (mínimo ~560px) lado a lado
- **THEN** a página SHALL exibir mapa e lista como vistas alternadas em largura cheia, com um alternador visível
- **WHEN** a largura real de conteúdo comporta ambos
- **THEN** a página SHALL exibir lista e mapa lado a lado, com a lista limitada e o mapa recebendo todo o espaço restante

#### Scenario: O respiro vertical não é pago com altura de mapa
- **WHEN** o espaçamento vertical da página é aumentado para seguir o sistema da Central de Vendas
- **THEN** a altura total do cromo acima do mapa SHALL NOT ser maior do que era antes do aumento
- **THEN** quando o orçamento não fechar, o ajuste SHALL reduzir o espaçamento adotado, e SHALL NOT reduzir a altura do mapa

#### Scenario: Instrumentação não é duplicada entre hero e filtros
- **WHEN** uma contagem ou distribuição já é exibida pelos chips de filtro ou pelo cabeçalho da lista de regiões
- **THEN** o hero SHALL NOT repetir a mesma informação
- **THEN** quando a mesma informação puder ser exibida em um controle acionável (chip de filtro) ou em um elemento estático (barra do hero), a página SHALL preservar a versão acionável

#### Scenario: Filtros responsivos
- **WHEN** a largura real de conteúdo é insuficiente para os grupos de filtro lado a lado
- **THEN** os filtros de tecnologia e status SHALL empilhar verticalmente, cada grupo mantendo rolagem horizontal própria

#### Scenario: Lista de cidades em mobile
- **WHEN** a viewport é menor que `md` (768px)
- **THEN** a lista de cidades e bairros é exibida como drawer deslizável ou bottom sheet, liberando espaço para o mapa

#### Scenario: Mapa adaptável
- **WHEN** a página é exibida em qualquer breakpoint
- **THEN** o mapa ocupa o espaço restante sem ser comprimido por elementos fixos

#### Scenario: Ícones corretos
- **WHEN** a página de Cobertura exibe ícones de localização, tune ou navegação
- **THEN** os ícones são renderizados como glifos visuais, nunca como texto

### Requirement: Configuração de região não assume classificação inexistente
O formulário de configuração de uma região (`OverrideModal`) SHALL apresentar tecnologia, status e percentual de cobertura sem nenhuma opção pré-selecionada quando a região não tiver esses dados, em vez de assumir os valores mais comuns como se já fossem a classificação real.

Enquanto um campo não tiver sido alterado pelo administrador, o formulário SHALL exibir uma indicação visual de que o valor ainda não foi definido.

#### Scenario: Região sem nenhum dado abre sem seleção
- **WHEN** o administrador abre a configuração de uma região sem `tecnologia`, `status` ou `percentual_cobertura` cadastrados
- **THEN** nenhuma opção de tecnologia ou status aparece marcada, e o percentual aparece como não definido
- **AND** cada campo exibe uma indicação de que ainda não foi definido

#### Scenario: Região já configurada preserva os valores existentes
- **WHEN** o administrador abre a configuração de uma região que já tem tecnologia, status ou percentual cadastrados
- **THEN** o formulário exibe os valores existentes normalmente, sem a indicação de "não definido"

### Requirement: Contraste e área de toque dos controles de alternância
Os controles de alternância de visão (Mapa/Lista) e de ordenação da Central de Cobertura SHALL usar, no estado ativo, um tom de texto que passa 4,5:1 de contraste em todos os cinco temas (`--accent-dark`), não o tom de marca (`--accent`) diretamente. O toggle Mapa/Lista SHALL ter altura efetiva de no mínimo 44px, e o ícone de configuração de região SHALL ter área de toque efetiva de no mínimo 44px, mesmo quando a caixa visual for menor.

#### Scenario: Toggle ativo legível nos cinco temas
- **WHEN** o toggle Mapa/Lista ou o toggle de ordenação está no estado ativo, em qualquer tema
- **THEN** seu contraste de texto contra o fundo é de no mínimo 4,5:1

#### Scenario: Alvo de toque do ícone de configuração
- **WHEN** o ícone de configuração de uma região é renderizado
- **THEN** sua área de toque efetiva (incluindo a expansão invisível) mede no mínimo 44px

