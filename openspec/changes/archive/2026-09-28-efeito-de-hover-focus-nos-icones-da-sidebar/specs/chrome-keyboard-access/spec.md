## ADDED Requirements

### Requirement: Paridade de tratamento visual entre hover de mouse e foco de teclado na Sidebar
Cada item de navegação da Sidebar SHALL aplicar o mesmo tratamento visual de ênfase (fundo, cor e efeito no ícone) tanto quando recebe hover de mouse quanto quando recebe foco de teclado, sem depender só do anel `:focus-visible` global. O ícone SHALL crescer de forma sutil (`transform: scale(1.1)`) e aumentar o traço (`stroke-width` de 1.7 para 2) em ~160ms `ease-out`, sem alterar `width`/`height` e sem causar deslocamento de layout nos itens vizinhos. O item ativo da rota atual SHALL manter prioridade visual sobre o estado de ênfase.

#### Scenario: Hover de mouse
- **WHEN** o ponteiro passa sobre um item da Sidebar
- **THEN** o ícone do item cresce e ganha traço mais grosso, e o fundo e a cor do texto assumem o estado de ênfase

#### Scenario: Foco de teclado
- **WHEN** um item da Sidebar recebe foco por Tab
- **THEN** ele mostra o mesmo efeito de ícone, fundo e cor do hover de mouse, além do anel `:focus-visible` de 2px em torno do botão

#### Scenario: Anel e efeito não se sobrepõem
- **WHEN** um item está focado por teclado
- **THEN** o anel `outline` envolve o botão inteiro e o efeito de `transform` afeta só o ícone interno, sem sobreposição espacial entre os dois

#### Scenario: Item ativo
- **WHEN** o item da rota atual recebe hover ou foco
- **THEN** o fundo e a cor de item ativo continuam prevalecendo sobre o estado de ênfase

#### Scenario: Movimento reduzido
- **WHEN** o sistema tem `prefers-reduced-motion: reduce` ativo
- **THEN** a transição do ícone é neutralizada pela regra global de `index.css`, sem regra adicional
