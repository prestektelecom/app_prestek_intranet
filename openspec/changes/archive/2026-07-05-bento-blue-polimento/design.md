## Context

Após a migração para Bento Blue, alguns elementos globais ainda carregam valores warm/âmbar. Esses detalhes não quebram o build, mas geram inconsistências visuais sutis e dificultam a manutenção.

## Goals / Non-Goals

**Goals:**
- Eliminar resquícios warm/âmbar nos helpers CSS globais.
- Padronizar AdminAuditoria a usar hex Bento como os demais componentes.
- Limpar aliases Tailwind sem uso.

**Non-Goals:**
- Reimplementar dark mode Bento.
- Refatorar componentes grandes ou fluxos funcionais.

## Decisions

### 1. Manter variáveis semânticas já ajustadas
As variáveis `--background`, `--primary`, `--border`, etc. já apontam para Bento. Os helpers devem aproveitá-las ou usar valores Bento explícitos.

### 2. Trocar `bg-primary` por hex em AdminAuditoria
Embora `--primary` já seja `#4A9EF5`, usar hex explícito alinha o componente ao padrão dos outros componentes Bento e reduz dependência das variáveis.

### 3. Limpar aliases legados no Tailwind
Cores como `secondary: "#a17745"` e `background-light: "#f8f7f5"` não fazem sentido no novo tema. Serão removidas para evitar reuso acidental.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| Remover alias que ainda é usado em algum lugar | Buscar por cada alias antes de remover |
| Alteração na scrollbar afetar usabilidade | Manter comportamento, apenas cor do hover |
| Login pulse mudar de âmbar para azul | Verificar se o branding aceita (é a intenção) |
