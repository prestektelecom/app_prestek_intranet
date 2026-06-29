## Context

No componente [Sectors.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Sectors.jsx), os cards do diretório de setores possuem uma descrição. Para evitar que os cards tenham alturas muito discrepantes ou fiquem excessivamente grandes na grade, a descrição é truncada a no máximo 2 linhas através do estilo `-webkit-line-clamp: 2`. Desejamos permitir que descrições longas possam ser lidas por completo através de um botão expansor inline.

## Goals / Non-Goals

**Goals:**
- Permitir ler a descrição completa de setores com texto longo por meio de um controle interativo "Ver mais" / "Ver menos" (Opção 1 do estudo de design).
- Manter o comportamento padrão truncado para manter a estética inicial limpa.
- Evitar quebras indesejadas no layout geral.

**Non-Goals:**
- Alterar as descrições em si no banco de dados ou no mapa padrão.
- Mudar outras propriedades do card de setores (como ramal, gerente, contagem da equipe).

## Decisions

### 1. Estado local `isExpanded` no `SectorCard`
- **Decisão:** Introduzir um estado local no subcomponente `SectorCard` para controlar se o texto está expandido ou colapsado.
- **Racional:** Permite que cada card controle seu estado de forma independente, sem afetar os outros cards da página.

### 2. Condição de exibição do botão baseada no comprimento
- **Decisão:** Exibir o botão apenas se a descrição tiver mais de 90 caracteres (`description.length > 90`).
- **Racional:** Evita poluição visual com botões "Ver mais" para textos que já cabem perfeitamente nas 2 linhas padrão.

### 3. Ajuste dinâmico de estilo CSS
- **Decisão:** Quando `isExpanded` for `true`, mudar `display` de `-webkit-box` para `'block'`, e `WebkitLineClamp` de `2` para `'unset'`.

## Risks / Trade-offs

- **Deslocamento de Layout (Layout Shift):** A expansão do card empurrará os elementos abaixo. Como isso ocorre em resposta a uma ação explícita do usuário (clique), esse comportamento é esperado e aceitável do ponto de vista de UX.
