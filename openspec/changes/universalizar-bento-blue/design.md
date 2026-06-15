## Context

A intranet Prestek possui hoje dois sistemas visuais ativos simultaneamente:

1. **Tema warm/âmbar legado**: definido nas variáveis semânticas de `src/index.css` (`--background #f8f7f5`, `--primary #ff8c00`, `--border #eaddcd`, fonte `Manrope`).
2. **Tema Bento Blue**: implementado via inline styles em ~37 componentes, com fundo `#F5F9FF`, accent `#4A9EF5`, bordas `#E4ECF5`, texto `#0B1B2E` e fontes `Plus Jakarta Sans` + `JetBrains Mono`.

A base do aplicativo (`App.jsx`) ainda usa as variáveis warm, enquanto as páginas migradas sobrescrevem localmente o fundo e as cores. Isso gera inconsistências visuais, especialmente quando um componente warm é renderizado dentro de uma página Bento (ex: aba Auditoria do admin) ou quando páginas legadas herdam o fundo warm.

## Goals / Non-Goals

**Goals:**
- Tornar o Bento Blue a identidade visual padrão de todo o frontend.
- Redefinir as variáveis semânticas globais para refletir a paleta Bento Blue.
- Migrar os componentes React restantes que ainda usam o tema warm/âmbar.
- Remover componentes órfãos que não são utilizados, reduzindo a superfície de manutenção.
- Garantir que não haja regressões visuais graves nas páginas já migradas.

**Non-Goals:**
- Redesenhar fluxos funcionais ou alterar comportamento de negócio.
- Criar uma paleta dark mode completa para Bento Blue (será mantido o suporte básico existente ou simplificado).
- Migrar o backend (não possui estilos visuais).

## Decisions

### 1. Alterar as variáveis semânticas CSS para Bento Blue
**Decisão:** Em `src/index.css`, redefinir `--background`, `--card`, `--surface`, `--surface-raised`, `--border`, `--border-subtle`, `--foreground`, `--foreground-muted`, `--foreground-faint`, `--primary`, `--primary-hover`, `--primary-subtle`, `--primary-muted`, `--input`, `--input-focus`, `--ring` para valores Bento Blue.

**Rationale:** Componentes que usam classes Tailwind semânticas (`bg-primary`, `text-foreground`, `border-border`) virão Bento automaticamente. Isso unifica a base sem exigir reescrever cada classe em cada arquivo.

**Alternativa considerada:** Manter as vars warm e criar novos utilitários Tailwind (`bg-bento`, `text-bento`). Rejeitada porque perpetuaria a duplicidade de tokens e não alinharia com o objetivo de universalização.

### 2. Manter tokens Bento específicos com nomes explícitos
**Decisão:** Preservar as variáveis já existentes `--accent`, `--accent-dark`, `--accent-deep`, `--accent-soft`, `--surface-soft`, `--ink`, `--ink2`, `--muted-bento`, `--line`, `--line-soft`, `--success-bento`, `--warning-bento`, `--danger-bento` e seus respectivos `-soft`.

**Rationale:** Esses tokens já são usados por componentes Bento e permitem controles finos (gradientes, estados semânticos) que não cabem nas variáveis semânticas genéricas.

### 3. Atualizar `App.jsx` para fonte Jakarta
**Decisão:** Trocar `font-display` por `font-jakarta` no container raiz, mantendo `bg-background text-foreground` (agora resolvendo para Bento).

**Rationale:** `Plus Jakarta Sans` é a fonte display do Bento Blue. Manter `bg-background text-foreground` reduz o risco de hardcoding e aproveita as novas variáveis CSS.

### 4. Remover componentes órfãos em vez de migrá-los
**Decisão:** `QuickShortcuts.jsx`, `AnnouncementsList.jsx`, `StatCard.jsx`, `TeamAvailability.jsx` e `GruposSupervisores.jsx` não são importados em nenhum lugar. Serão removidos após confirmação.

**Rationale:** Migrar código morto é trabalho desperdiçado. A remoção reduz bundle e confusão.

### 5. Abordar dark mode de forma pragmática
**Decisão:** Os componentes Bento existentes usam inline styles fixos e não reagem a `.dark`. A migração dos componentes warm para Bento manterá o suporte dark mínimo apenas onde já existir, sem expandir para uma paleta dark completa nesta mudança.

**Rationale:** Criar um dark mode Bento consistente é um escopo separado e maior. O objetivo aqui é consolidar o visual light.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| **Quebra visual em páginas legadas** que ainda misturam warm/amber ao herdar fundo Bento. | Revisar visualmente `Login`, `ServicesDirectory`, `Coverage`, `Directory`, `Sectors`, `Schedule`, `Processos`, `TicketsList`, `Offices` após a troca de tokens. Ajustes pontuais serão tratados como follow-up. |
| **Inconsistência temporária** enquanto componentes warm coexistem com fundo Bento. | Fasear a implementação: tokens globais primeiro, depois componentes vivos, depois limpeza. |
| **Dark mode sem suporte Bento** pode ficar visualmente estranho. | Manter o tema dark funcional para as partes warm restantes; aceitar que páginas Bento permanecem light-first até uma migração dark dedicada. |
| **Componentes órfãos podem ser referenciados dinamicamente** ou em código não rastreado. | Antes de deletar, fazer grep por cada nome de componente em todo o repositório (incluindo backend se houver templates). |
| **Ausência de testes visuais** pode permitir regressões não detectadas. | Validação manual em ambiente de desenvolvimento; checklist visual por página principal. |

## Migration Plan

1. **Backup/branch**: garantir que a mudança seja feita em um contexto isolado.
2. **Tokens globais**: editar `src/index.css` para Bento Blue.
3. **Container raiz**: ajustar `src/App.jsx`.
4. **Componentes vivos**: migrar `AdminAuditoria.jsx`, `ThemeSwitcher.tsx`, `LottieAvatar.jsx`.
5. **Fallback admin**: corrigir `AdminDashboard.jsx`.
6. **Limpeza**: remover componentes órfãos confirmados.
7. **Revisão visual**: navegar pelas principais páginas e anotar ajustes necessários.
8. **Rollback**: se necessário, reverter `src/index.css` e `src/App.jsx` para restaurar o tema warm.

## Open Questions

- Os componentes órfãos podem ser removidos sem impacto? (será confirmado com grep durante a implementação)
- O dark mode deve ser desabilitado temporariamente ou mantido como está?
- Há alguma página ou recurso que intencionalmente deve permanecer warm/âmbar (ex: login específico, branding antigo)?
