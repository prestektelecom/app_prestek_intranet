## Why

O Dashboard é a página inicial do portal, vista por todo colaborador todo dia. A crítica de design (26/40) e o audit técnico (12/20) de 2026-09-11 encontraram um botão de ação primária invisível no tema claro por uma colisão de classes CSS, um modal central (Suporte de TI) sem nenhuma semântica de diálogo nem gerenciamento de foco, o gesto de interação mais repetido da tela usando a paleta de demonstração de um componente de terceiro em vez do laranja da marca, e badges de estado abaixo do contraste mínimo de acessibilidade. Também confirmou que o grid "customizável" descrito no PRODUCT.md está travado desde uma reescrita anterior, sem UI de edição, embora os endpoints de backend continuem funcionando.

Referências: `docs/impeccable/audit-dashboard-2026-09-11.md` e `.impeccable/critique/2026-09-11T00-15-42Z__src-components-dashboard-jsx.md`.

## What Changes

- **Botão de ação do widget de OS**: corrige a colisão `bg-surface`/`bg-primary` que deixava "Gerenciar Meus Chamados" branco sobre branco no tema claro; passa a usar uma constante de estilo dedicada para ação primária, sem herdar os utilitários de base do card.
- **`TiSupportModal`**: ganha semântica de diálogo (`role="dialog"`, `aria-modal`, `aria-labelledby`), foco movido para dentro ao abrir, trap de Tab, e fecha com Escape — mesmo padrão do `ModalShell` já documentado no DESIGN.md.
- **`GlowingEffect` no Dashboard**: os 9 usos passam a usar a variante on-brand (laranja da marca) em vez das quatro cores de demonstração do componente de terceiro (rosa, dourado, verde, azul-acinzentado).
- **Badges de estado**: textos de "sucesso"/"aviso"/"perigo" sobre fundo `-soft` passam a usar os tokens `-strong` (já existentes no DESIGN.md) em vez dos tokens `-bento` (pensados para uso gráfico, não para texto).
- **BREAKING (documentação, não código)**: a capacidade `dashboard-customization` (arrastar/redimensionar widgets) é removida da especificação — o código atual não entrega isso (`isDraggable`/`isResizable` fixos em `false`) e a decisão, tomada com o Felix em 2026-09-11, é documentar o grid como fixo por ora, não reativar o modo de edição nesta change. O PRODUCT.md é atualizado para não descrever mais essa capacidade como ativa.

Fora de escopo desta change (registrado para uma rodada de polish futura): nome de aniversariante com anotação do IXC vazando, requisições redundantes de `/api/comunicados` e `/api/departamentos-empresa`, links mortos do rodapé, ausência de `aria-live` no carrossel, teto de exibição do badge de variação percentual, tamanhos de fonte fora da rampa, alvos de toque abaixo de 44px no celular.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `dashboard-view`: ganha requisitos de contraste e coerência visual para ações primárias, badges de estado e o efeito de hover dos cards.
- `ti-modal-solicitante-selector`: ganha um requisito de acessibilidade de teclado e leitor de tela para o modal, complementar aos requisitos de negócio já existentes.
- `dashboard-customization`: os dois requisitos de modo de edição e arrastar/redimensionar são removidos — a capacidade não é entregue pelo código atual.

## Impact

- `src/components/Dashboard.jsx` (constantes de estilo, `KpiCard`, `OsBento`, `SetorBento`).
- `src/components/TiSupportModal.jsx` (semântica de diálogo, foco, Escape).
- `src/components/ui/glowing-effect.tsx` (paleta do efeito).
- `PRODUCT.md` (remover a menção ao grid customizável como capacidade ativa).
- `MEMORIA.md` (registrar a decisão sobre o grid).
- Sem migração de dados; sem mudança de API.
