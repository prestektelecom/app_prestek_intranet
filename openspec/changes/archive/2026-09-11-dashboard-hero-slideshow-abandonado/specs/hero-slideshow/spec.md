## ADDED Requirements

### Requirement: Slideshow automático de imagens no Hero Card
O Hero Card SHALL exibir as imagens salvas em rotação automática com crossfade, sem interação do usuário. Quando houver apenas uma imagem, ela SHALL ser exibida estaticamente. Quando não houver imagens, o Hero Card SHALL exibir o gradiente padrão de accent.

#### Scenario: Rotação automática entre imagens
- **WHEN** o usuário tem 2 ou mais imagens salvas e o Hero Card é renderizado
- **THEN** as imagens SHALL alternar automaticamente a cada 8 segundos com transição de crossfade (opacity 0→1) de 1 segundo

#### Scenario: Imagem única sem rotação
- **WHEN** o usuário tem exatamente 1 imagem salva
- **THEN** o Hero Card SHALL exibir essa imagem de forma estática, sem slideshow

#### Scenario: Fallback para gradiente padrão
- **WHEN** o usuário não tem nenhuma imagem salva
- **THEN** o Hero Card SHALL exibir o gradiente de accent com o grid SVG decorativo (comportamento atual)

### Requirement: Crossfade sem flash ou reflow
O slideshow SHALL usar dois layers `<img>` absolutamente posicionados com transição de `opacity` via CSS, garantindo que a troca entre imagens seja visualmente suave, sem flash branco ou reflow de layout.

#### Scenario: Troca visual suave
- **WHEN** o intervalo de 8 segundos expira
- **THEN** a próxima imagem SHALL aparecer com transição de opacity de 1 segundo, enquanto a imagem atual desaparece simultaneamente

### Requirement: Ciclo contínuo
O slideshow SHALL ciclar indefinidamente (última imagem → primeira imagem) enquanto o Hero Card estiver montado.

#### Scenario: Ciclo voltando ao início
- **WHEN** a última imagem da lista está sendo exibida e o intervalo expira
- **THEN** o slideshow SHALL retornar para a primeira imagem com crossfade

### Requirement: Exibição somente da imagem
Quando imagens estiverem presentes, o Hero Card SHALL exibir apenas a imagem (banner limpo), sem textos, botões de conteúdo ou overlay escuro sobre ela. Os textos de saudação (nome, data/hora, botão Assistente) SHALL ser exibidos apenas quando não houver imagens (fallback de gradiente).

#### Scenario: Banner limpo com imagem
- **WHEN** qualquer imagem está sendo exibida
- **THEN** o Hero Card SHALL exibir somente a imagem em `object-cover`, sem textos nem overlay escuro por cima

#### Scenario: Textos apenas no fallback
- **WHEN** o usuário não tem nenhuma imagem salva
- **THEN** o Hero Card SHALL exibir o gradiente de accent com os textos de saudação e o botão Assistente (comportamento original)
