## 1. Banco e permissão

- [x] 1.1 Criar `backend/migrations/025_sugestoes.sql` (idempotente, sem seed)
- [x] 1.2 Acrescentar `sugestoes` em `CAPACIDADES` (`backend/middleware/permissoes.js`) e em `src/constants/permissoes.js`

## 2. Backend

- [x] 2.1 `POST /api/sugestoes` com validação de tipo/título/descrição e limite de 5 por 24 h
- [x] 2.2 `GET /api/sugestoes/minhas`
- [x] 2.3 `GET /api/sugestoes` (filtros status/tipo) e `PATCH /api/sugestoes/:id` com `gate('sugestoes')`
- [x] 2.4 Auditoria `sugestao_status` / `sugestao_resposta`
- [x] 2.5 Teste das regras (`node scripts/testar-sugestoes.mjs`, 18 casos) e SQL rodado no banco real em 2026-10-05, após aplicar a 025: leituras ok e INSERT com limite (5 gravam, o 6º é barrado) dentro de transação desfeita. Isso pegou um bug que o teste com `pool` falso não pega: `inconsistent types deduced for parameter $1`, corrigido com casts

## 3. Frontend

- [x] 3.1 View `Sugestoes` (formulário, "Minhas sugestões", estados vazio/erro/carregando)
- [x] 3.2 Aba "Todas" para gestores: filtros, mudança de status e resposta
- [x] 3.3 Item de menu, `MobileBottomNav`/"Mais" e rótulo da capacidade no Painel Admin
- [x] 3.4 Textos em português; lista em cards (sem `ResponsiveTable`/`FilterBar`: os filtros são só dois selects); alvos de toque ≥ 44px

## 4. Impeccable e fechamento

- [x] 4.1 `/impeccable audit` da tela (contraste nos 5 temas, alvos de toque, tipografia, foco) e `critique`; corrigir P0/P1 e registrar o resultado
  - Resultado (2026-10-05, só leitura de código + contraste calculado nos 5 temas, sem navegador): texto passa 4,5:1 em todos os temas. Corrigidos: borda de campo com 1,2:1 (agora `ink2`, ≥5:1), radios feitos à mão (agora `<input type=radio>` nativo, setas funcionam), abas inativas fora do Tab, `border-l-4` apontado pelo detector, fonte 16px nos campos no celular (sem zoom do iOS), foco no primeiro campo inválido, título de seção para leitor de tela. Sem P0/P1 abertos. Pendente: conferência visual no navegador
- [x] 4.2 Atualizar `CHANGELOG.md` ([Unreleased]) e `PENDENCIAS_PRODUCAO.md` (aplicar só a migration 025)
- [ ] 4.3 Branch `feat/suggestion-box`, PR para a `main` com descrição em português e resultado do Impeccable; merge é do Felix
- [ ] 4.4 Após o deploy: `/opsx:archive` e registrar a decisão em `MEMORIA.md`
