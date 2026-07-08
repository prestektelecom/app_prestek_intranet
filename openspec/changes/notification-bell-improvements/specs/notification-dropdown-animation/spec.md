## ADDED Requirements

### Requirement: Dropdown abre com animação suave
O dropdown do sino SHALL aparecer com uma animação de entrada combinando `opacity` (0→1), `scale` (0.97→1) e `translateY` (-6px→0), com duração de ~160ms e easing `cubic-bezier(0.4, 0, 0.2, 1)`.

#### Scenario: Dropdown anima ao abrir
- **WHEN** o usuário clica no botão do sino para abrir o dropdown
- **THEN** o dropdown aparece com fade-in + scale-up + slide-down suave em ~160ms

#### Scenario: Dropdown fecha sem animação de saída
- **WHEN** o usuário fecha o dropdown (click fora ou no botão)
- **THEN** o dropdown some imediatamente (sem animação de saída, comportamento atual mantido)

#### Scenario: Animação usa keyframes CSS inline
- **WHEN** o Header é renderizado
- **THEN** a tag `<style>` contém `@keyframes notif-dropdown-in` acessível para o dropdown
