## 1. Preparação

- [x] 1.1 Verificar se os componentes órfãos (`QuickShortcuts.jsx`, `AnnouncementsList.jsx`, `StatCard.jsx`, `TeamAvailability.jsx`, `GruposSupervisores.jsx`) não possuem imports em nenhum outro arquivo
- [x] 1.2 Criar branch ou contexto isolado para a mudança

## 2. Tokens globais Bento Blue

- [x] 2.1 Atualizar `src/index.css`: redefinir variáveis semânticas warm/âmbar para a paleta Bento Blue (`--background`, `--card`, `--surface`, `--surface-raised`, `--border`, `--border-subtle`, `--foreground`, `--foreground-muted`, `--foreground-faint`, `--primary`, `--primary-hover`, `--primary-subtle`, `--primary-muted`, `--input`, `--input-focus`, `--ring`)
- [x] 2.2 Ajustar `src/App.jsx`: trocar `font-display` por `font-jakarta` no container raiz, mantendo `bg-background text-foreground`
- [x] 2.3 Corrigir fallback de ícone em `src/components/AdminDashboard.jsx` (`bg-surface-raised text-muted`) para usar tokens Bento (`bg-[#F7FAFD] text-[#8896A8]`)

## 3. Migração de componentes em uso

- [x] 3.1 Migrar `src/components/admin/AdminAuditoria.jsx` para Bento Blue (fundo branco, bordas `#E4ECF5`, texto `#0B1B2E`, primária `#4A9EF5`)
- [x] 3.2 Migrar `src/components/ThemeSwitcher.tsx` para Bento Blue (fundo `#F7FAFD`, borda `#E4ECF5`, estado selecionado `#4A9EF5`)
- [x] 3.3 Migrar placeholder em `src/components/common/LottieAvatar.jsx` para usar `bg-[#F7FAFD]`

## 4. Limpeza de componentes órfãos

- [x] 4.1 Remover `src/components/QuickShortcuts.jsx` se confirmado como órfão
- [x] 4.2 Remover `src/components/AnnouncementsList.jsx` se confirmado como órfão
- [x] 4.3 Remover `src/components/StatCard.jsx` se confirmado como órfão
- [x] 4.4 Remover `src/components/TeamAvailability.jsx` se confirmado como órfão
- [x] 4.5 Remover `src/components/GruposSupervisores.jsx` se confirmado como órfão

## 5. Validação visual

- [x] 5.1 Revisar visualmente o Dashboard
- [x] 5.2 Revisar visualmente o Painel Admin (abas Painel, Auditoria, Usuários, Comunicados)
- [x] 5.3 Revisar visualmente Configurações
- [x] 5.4 Revisar visualmente páginas legadas que herdaram fundo Bento (Login, Serviços, Cobertura, Diretório, Setores, Escala, Processos, Chamados, Escritórios, Comunicados)
- [x] 5.5 Verificar o ThemeSwitcher em modo claro
- [x] 5.6 Anotar e corrigir inconsistências pontuais encontradas na revisão (exportService.js ajustado para Bento Blue)

## 6. Finalização

- [x] 6.1 Garantir que a aplicação inicia sem erros (`npm run dev` ou equivalente)
- [x] 6.2 Verificar que não há referências warm/âmbar óbvias restantes nos componentes vivos
- [x] 6.3 Atualizar esta lista de tarefas marcando todos os itens concluídos
