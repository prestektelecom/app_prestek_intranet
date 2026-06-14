## 1. Preparação e Auditoria Visual

- [x] 1.1 Ler `src/components/Processos.jsx` e listar todos os componentes internos (`ProcessosHero`, `StatusBadge`, `ProcessoModal`).
- [x] 1.2 Localizar todas as referências a cores warm/âmbar e tokens Tailwind na página (`#a17745`, `#1d150c`, `#fcfaf8`, `#eaddcd`, `bg-primary`, `text-primary`, `text-secondary`, etc.).
- [x] 1.3 Definir objeto de cores local `C` para reutilização consistente com as páginas de referência.

## 2. Fundação Visual da Página

- [x] 2.1 Trocar o background do container principal de `Processos.jsx` para `#F5F9FF`.
- [x] 2.2 Aplicar `font-family: "Plus Jakarta Sans"` no container principal da página.
- [x] 2.3 Ajustar padding e largura máxima para seguir o padrão das páginas de referência (`max-w-[1400px]`).

## 3. Hero Banner e Hierarquia Superior

- [x] 3.1 Criar hero banner full-width com gradiente azul `120deg #1F5BA8 → #2D7BD4 → #4A9EF5`.
- [x] 3.2 Inserir título "Processos Operacionais" e subtítulo descritivo no hero.
- [x] 3.3 Criar KPI pills glassmorphism com métricas: total de processos, ativos, em revisão e categorias.
- [x] 3.4 Posicionar botão "Novo Processo" dentro do hero, alinhado à direita.

## 4. Ações Secundárias e Filtros

- [x] 4.1 Reestilizar botão "Exportar Lista" para fundo branco com borda `#E4ECF5` e texto `#0B1B2E`.
- [x] 4.2 Refazer card de busca/filtros: fundo branco `#FFFFFF`, borda `#E4ECF5`, radius 20px.
- [x] 4.3 Reestilizar input de busca com fundo `#F7FAFD`, borda `#E4ECF5` e foco azul `#4A9EF5`.
- [x] 4.4 Reestilizar pills de categoria: ativo com gradiente azul, inativo com fundo `#F7FAFD`, borda `#E4ECF5` e texto `#475467`.

## 5. Tabela Desktop e Cards Mobile

- [x] 5.1 Reestilizar container da tabela: fundo branco, borda `#E4ECF5`, radius 20px.
- [x] 5.2 Reestilizar header da tabela: fundo `#F7FAFD`, labels uppercase com cor `#475467`.
- [x] 5.3 Reestilizar linhas da tabela: texto `#0B1B2E`/secundário `#475467`, bordas `#E4ECF5`, hover `#EAF4FF`.
- [x] 5.4 Reestilizar IDs em destaque azul `#4A9EF5` e ícones de ação com hover azul.
- [x] 5.5 Reestilizar cards mobile com os mesmos padrões de cor, tipografia e hover da tabela.

## 6. Paginação

- [x] 6.1 Reestilizar barra de paginação: fundo `#F7FAFD`, borda `#E4ECF5`.
- [x] 6.2 Reestilizar botões "Anterior"/"Próximo" com borda `#E4ECF5`, hover `#EAF4FF` e texto `#475467`/`#0B1B2E`.

## 7. Modal CRUD

- [x] 7.1 Reestilizar backdrop e container do modal para fundo branco com borda `#E4ECF5` e radius 20px.
- [x] 7.2 Reestilizar header do modal com título `#0B1B2E` e botão fechar `#8896A8`.
- [x] 7.3 Reestilizar inputs e selects com fundo `#F7FAFD`, borda `#E4ECF5` e foco azul.
- [x] 7.4 Reestilizar botão salvar com gradiente azul e botão cancelar branco com borda azul.

## 8. Cards de Resumo por Categoria

- [x] 8.1 Refazer cards de categoria: fundo branco, borda `#E4ECF5`, radius 20px.
- [x] 8.2 Aplicar ícones com fundo `#EAF4FF` e cor `#4A9EF5`, com hover no gradiente azul.
- [x] 8.3 Reestilizar valores grandes em Jakarta Sans 800, texto `#0B1B2E`.
- [x] 8.4 Reestilizar barra de progresso de ativos com gradiente azul sobre fundo `#F7FAFD`.

## 9. Validação Visual

- [x] 9.1 Comparar lado a lado com `Schedule.jsx` e `Offices.jsx` para validar consistência.
- [x] 9.2 Verificar estados de hover, foco, loading e empty state.
- [x] 9.3 Rodar `npm run build` e garantir que a aplicação compila sem erros.
