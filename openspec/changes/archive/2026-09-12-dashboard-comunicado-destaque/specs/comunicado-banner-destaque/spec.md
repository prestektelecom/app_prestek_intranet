## ADDED Requirements

### Requirement: Banner de comunicado em destaque no Dashboard
O componente `ComunicadoBanner` SHALL ser exibido estaticamente entre o `DashboardHeader` e o Bento Grid no Dashboard, mostrando o comunicado de maior prioridade da lista.

#### Scenario: Comunicado urgente tem prioridade no banner
- **WHEN** há comunicados carregados e um ou mais possuem tipo `Urgente`
- **THEN** o banner exibe o primeiro comunicado com tipo `Urgente`, independentemente de data de criação

#### Scenario: Comunicado importante assume destaque na ausência de urgentes
- **WHEN** não há comunicados com tipo `Urgente` e existe ao menos um com tipo `Importante`
- **THEN** o banner exibe o primeiro comunicado com tipo `Importante`

#### Scenario: Comunicado mais recente como fallback
- **WHEN** não há comunicados com tipo `Urgente` ou `Importante`
- **THEN** o banner exibe o comunicado mais recente (topo do array ordenado por `criado_em DESC`)

#### Scenario: Sem comunicados disponíveis
- **WHEN** a lista de comunicados está vazia
- **THEN** o banner NÃO é renderizado (retorna null), sem espaço vazio na página

---

### Requirement: Exibição visual com imagem de capa
Quando o comunicado em destaque possuir um campo de imagem (`imagem_url` ou `foto` ou `capa`) com valor não-nulo e não-vazio, o banner SHALL exibir essa imagem como fundo com overlay gradiente escuro na parte inferior.

#### Scenario: Imagem disponível
- **WHEN** o comunicado em destaque tem campo de imagem populado
- **THEN** o banner exibe a imagem como background-image com `object-fit: cover`
- **THEN** um overlay gradiente `rgba(0,0,0,0.55)` cobre a imagem de cima para baixo
- **THEN** título e badge são exibidos sobre o overlay com texto branco

#### Scenario: Sem campo de imagem (fallback)
- **WHEN** o comunicado em destaque não tem imagem associada
- **THEN** o banner exibe um gradiente sólido temático (tom do tipo: vermelho para Urgente, âmbar para Importante, azul para demais)
- **THEN** título e badge são exibidos normalmente sobre o gradiente

---

### Requirement: Badge de tipo e texto sobreposto
O banner SHALL exibir, sobre a imagem ou gradiente, um badge de tipo (URGENTE / IMPORTANTE / AVISO / GERAL), o título do comunicado e um subtítulo opcional com data relativa.

#### Scenario: Elementos textuais visíveis
- **WHEN** o banner está renderizado com um comunicado em destaque
- **THEN** badge de tipo é exibido no canto superior esquerdo com cor correspondente ao tipo
- **THEN** título do comunicado é exibido com fonte bold e tamanho destacado
- **THEN** data relativa (ex: "há 2h", "há 3d") é exibida abaixo do título

#### Scenario: Clique no banner
- **WHEN** o usuário clica em qualquer área do banner
- **THEN** a view é alterada para `announcements` (via `setCurrentView('announcements')`)

---

### Requirement: Estado de carregamento do banner
O banner SHALL exibir um skeleton de loading enquanto os dados são buscados da API.

#### Scenario: Carregamento em andamento
- **WHEN** o fetch para `/api/comunicados` ainda não foi concluído
- **THEN** o banner exibe um bloco animado de skeleton com as mesmas dimensões do banner real

---

## MODIFIED Requirements

### Requirement: ComunicadosCard exibe somente comunicados secundários
O widget `ComunicadosCard` dentro do Bento Grid SHALL excluir da sua lista o comunicado que está sendo exibido no `ComunicadoBanner`, evitando duplicação.

#### Scenario: Banner e card compartilham mesma fonte de dados
- **WHEN** o Dashboard é carregado com comunicados disponíveis
- **THEN** o `ComunicadoBanner` exibe o comunicado de maior prioridade
- **THEN** o `ComunicadosCard` exibe a lista dos comunicados restantes (excluindo o destacado)
- **THEN** o comunicado em destaque NÃO aparece duplicado na lista do card

#### Scenario: Apenas um comunicado disponível
- **WHEN** há exatamente um comunicado na lista
- **THEN** o `ComunicadoBanner` exibe esse comunicado
- **THEN** o `ComunicadosCard` exibe a mensagem "Nenhum outro comunicado."
