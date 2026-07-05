## Requirements

### Requirement: Helpers globais usam paleta Bento Blue
Os helpers CSS em `src/index.css` SHALL usar cores Bento Blue em vez de warm/âmbar.

#### Scenario: Glassmorphism
- **WHEN** um elemento usa a classe `.glass`
- **THEN** o background SHALL usar `rgba(245, 249, 255, 0.85)` no light e `rgba(11, 27, 46, 0.80)` no dark

#### Scenario: Scrollbar
- **WHEN** o usuário interage com uma área `.custom-scrollbar`
- **THEN** o thumb hover SHALL usar `#8896A8`

#### Scenario: Login pulse
- **WHEN** o botão de login está em estado pulse
- **THEN** a animação SHALL usar `#4A9EF5` ao invés de `#ff8c00`

### Requirement: Tailwind config não mantém aliases warm/âmbar legados
O arquivo `tailwind.config.js` SHALL remover ou substituir aliases de cor warm/âmbar que não fazem parte do design system Bento Blue.

#### Scenario: Alias secondary
- **WHEN** o arquivo `tailwind.config.js` é inspecionado
- **THEN** não SHALL existir `secondary: "#a17745"` ou `background-light: "#f8f7f5"` sem uso justificado
