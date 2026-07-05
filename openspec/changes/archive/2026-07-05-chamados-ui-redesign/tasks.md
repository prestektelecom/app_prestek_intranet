## 1. Preparação e Auditoria Visual

- [x] 1.1 Ler `src/components/TicketsList.jsx` e identificar componentes internos e estados.
- [x] 1.2 Localizar todas as referências a cores warm/âmbar e tokens Tailwind (`#a17745`, `#eaddcd`, `#fcfaf8`, `bg-primary`, `text-primary`, etc.).
- [x] 1.3 Definir objeto de paleta `C` no topo do arquivo.

## 2. Fundação Visual da Página

- [x] 2.1 Trocar o background do container principal para `#F5F9FF`.
- [x] 2.2 Aplicar `font-family: "Plus Jakarta Sans"` no container.
- [x] 2.3 Ajustar largura máxima para `max-w-[1400px]`.

## 3. Hero Banner

- [x] 3.1 Criar componente `TicketsHero` com gradiente azul `120deg #1F5BA8 → #2D7BD4 → #4A9EF5`.
- [x] 3.2 Inserir título "Meus Chamados", subtítulo e tag "Suporte Técnico".
- [x] 3.3 Criar KPI pills glassmorphism com métricas: total, abertos, finalizados, pendentes.
- [x] 3.4 Calcular KPIs a partir do array `tickets` com `useMemo`.

## 4. Tabela de Chamados

- [x] 4.1 Reestilizar container da tabela: branco `#FFFFFF`, borda `#E4ECF5`, radius 20px.
- [x] 4.2 Reestilizar header: fundo `#F7FAFD`, labels uppercase com cor `#475467`.
- [x] 4.3 Reestilizar linhas: texto `#0B1B2E`/secundário `#475467`, hover `#EAF4FF`.
- [x] 4.4 Reestilizar IDs em destaque azul `#4A9EF5`.
- [x] 4.5 Preservar cores semânticas dos badges de status.

## 5. Estados Vazio, Erro e Loading

- [x] 5.1 Loading: spinner azul `#4A9EF5` e texto `#475467`.
- [x] 5.2 Erro: ícone vermelho, texto `#0B1B2E`/`#475467`, botão "Tentar Novamente" com gradiente azul.
- [x] 5.3 Empty: ícone `#8896A8`, texto `#0B1B2E`/`#475467`.

## 6. Validação Visual

- [x] 6.1 Comparar lado a lado com `Processos.jsx` e `Offices.jsx` para validar consistência.
- [x] 6.2 Verificar estados de hover, foco, loading e empty state.
- [x] 6.3 Rodar `npm run build` e garantir que a aplicação compila sem erros.
