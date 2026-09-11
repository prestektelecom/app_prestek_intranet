## REMOVED Requirements

### Requirement: Habilitar e Desabilitar Modo de Edição
**Reason**: o `Dashboard.jsx` foi reescrito após esta capacidade ter sido implementada e arquivada (`archive/2026-05-25-dashboard-drag-and-drop`); a reescrita fixou `isDraggable={false}`/`isResizable={false}` e não expõe nenhum botão "Personalizar Dashboard" ou "Modo de Edição". A especificação descrevia um comportamento que o produto não entrega desde então. Decisão registrada com o Felix em 2026-09-11 (Fase 3 do programa Impeccable): documentar o grid como fixo por ora, sem reativar o modo de edição nesta change.
**Migration**: nenhuma migração de usuário necessária (a UI nunca expôs o modo de edição desde a reescrita). Os endpoints de backend `/api/user/dashboard-layout` (GET/POST) permanecem no código, sem uso; se a capacidade for retomada no futuro, uma nova proposta parte deles.

### Requirement: Arrastar e Redimensionar Widgets
**Reason**: mesma causa do requisito acima — o grid do `Dashboard.jsx` atual é estático (`react-grid-layout` com `isDraggable`/`isResizable` fixos em `false`); não há alça de arraste nem redimensionamento na UI.
**Migration**: nenhuma. O `PRODUCT.md` deixa de citar "layout de widgets/grid customizável" como capacidade ativa.
