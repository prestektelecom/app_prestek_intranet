## Purpose

Gestão de comunicados a partir do Painel Admin (`AdminComunicados.jsx`), tela irmã da página pública de Comunicados (`Comunicados.jsx`), usada exclusivamente por administradores.

## Requirements

### Requirement: Cards de comunicado com tokens de tema

Os cards da lista de comunicados em `AdminComunicados.jsx` SHALL usar tokens de superfície do tema ativo em vez de cor fixa, para que o painel permaneça legível em qualquer um dos cinco temas.

#### Scenario: Painel Admin em tema escuro
- **WHEN** o administrador abre "Gerenciar Comunicados" com um tema escuro ativo
- **THEN** o fundo de cada card usa `C.surface` do tema ativo, não um branco fixo
- **AND** o título de cada card (`C.ink`) mantém contraste WCAG AA contra esse fundo
