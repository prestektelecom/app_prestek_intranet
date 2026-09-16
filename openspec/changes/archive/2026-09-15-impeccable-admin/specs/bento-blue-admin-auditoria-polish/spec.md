## REMOVED Requirements

### Requirement: Botão de filtro da Auditoria usa hex Bento Blue

Descrevia cores hex "Bento Blue" (azul `#4A9EF5`) abandonadas — substituída pela versão que usa o tom de marca real via variável CSS.

## ADDED Requirements

### Requirement: Botão de filtro da Auditoria usa o tom de marca com par de contraste correto
O botão de filtro em `src/components/admin/AdminAuditoria.jsx` SHALL usar o tom de marca do tema ativo (via variável CSS) para o fundo, pareado com o token de texto calibrado para uso sobre esse fundo — nunca um hex hardcoded independente do tema.

#### Scenario: Estado normal
- **WHEN** o botão "Filtrar" é renderizado em qualquer tema suportado
- **THEN** o fundo SHALL usar o tom de marca do tema ativo e o texto SHALL manter ao menos 4,5:1 de contraste contra esse fundo

#### Scenario: Estado hover
- **WHEN** o usuário passa o mouse sobre o botão "Filtrar"
- **THEN** o fundo SHALL escurecer para a variante "dark" do tom de marca, mantendo o mesmo par de contraste do estado normal
