## 1. Semântica de diálogo do CategoriasAdminModal (P0)

- [x] 1.1 Aplicado `useEffect` de foco inicial + trap de Tab + Escape local (mesmo padrão de `ProcessoModal`, já no mesmo arquivo)
- [x] 1.2 Verificado ao vivo: Escape fecha; foco inicial entra em "Fechar"; Tab do último dos 54 elementos focáveis voltou para "Fechar" (primeiro), nunca escapou para "Novo Processo"

## 2. Aviso de não-persistência (P0)

- [x] 2.1 Adicionado aviso visível (estilo `AvisoDadosLocais`) logo abaixo do hero, sempre visível
- [x] 2.2 Verificado ao vivo que o aviso aparece com o texto completo

## 3. Contraste do `--foreground-faint` no AMOLED (P0)

- [x] 3.1 Corrigido `src/index.css`, bloco `.dark-amoled`: `--foreground-faint` de `#777777` para `#999999`
- [x] 3.2 Verificado ao vivo: 6,58:1 contra `--surface` (era 4,18:1) e 6,11:1 contra `--surface-raised` (era 3,88:1)
- [x] 3.3 Registrada a correção da suposição em `MEMORIA.md` (feito na consolidação final da fase)

## 4. Alvos de toque + permissão + categoria padrão (P1)

- [x] 4.1 `min-h-[44px]` nos chips de filtro de categoria e no botão "Gerenciar Categorias" — medido 44px (era ~38px)
- [x] 4.2 Ícones de editar/excluir do `CategoriasAdminModal`: `p-2`→`p-3` + expansão por pseudo-elemento (`after:-inset-1`) — medido 42×48 visual, confirmado via `elementFromPoint` que a expansão funciona
- [x] 4.3 Guarda `user?.is_admin` adicionada em "Novo Processo" (hero + `EmptyState`) e em `abrirEditar` (protege os 4 pontos de chamada de uma vez, incluindo tabela desktop e cards mobile)
- [x] 4.4 Categoria padrão de novo processo passou a ser `categorias[0]?.id` (verificado ao vivo: `os-ixc-soft`, batendo com a 1ª opção real da lista carregada — não mais o `'atendimento'` hardcoded); validação no submit bloqueia categoria que não existe mais na lista atual, com erro inline no campo
- [x] 4.5 Verificado ao vivo os itens 4.1, 4.2 e 4.4; item 4.3 (guarda de admin) verificado por leitura de código — não foi possível testar com uma sessão não-admin real nesta verificação

## 5. Fechamento

- [x] 5.1 `npx vite build` limpo
- [x] 5.2 `openspec validate impeccable-processos --strict` limpo
- [ ] 5.3 Commit
