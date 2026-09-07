## REMOVED Requirements

### Requirement: Estrutura comum de página responsiva
**Reason**: `PageShell` não é importado por nenhuma página; cada página monta o próprio hero e barra de filtros. Manter a spec e o componente faz o DESIGN.md descrever um esqueleto que não existe.
**Migration**: remover `src/components/responsive/PageShell.jsx`. O padding inferior para a barra inferior continua sendo responsabilidade do `App.jsx` (`--bottom-nav-h`). A seção Layout do DESIGN.md é corrigida no `document` da Fase 16 do programa.
