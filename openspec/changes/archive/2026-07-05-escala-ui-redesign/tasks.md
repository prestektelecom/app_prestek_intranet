## 1. Preparação e Auditoria Visual

- [x] 1.1 Ler `src/components/Schedule.jsx` e listar todos os componentes filhos envolvidos (`CalendarDay`, `ScheduleRow`, `ManagePlantaoModal`, `HistoricoPreviewModal`, `ScheduleHistoricoTab`, etc.).
- [x] 1.2 Localizar todas as referências a cores warm/âmbar e tokens Tailwind na página e filhos (`#ff8c00`, `bg-primary`, `surface-container-*`, `text-on-surface`, etc.).
- [x] 1.3 Definir objeto de cores local (ou importar/importar o padrão do `Dashboard.jsx`) para reutilização consistente.

## 2. Fundação Visual da Página

- [x] 2.1 Trocar o background da `Schedule.jsx` para `#F5F9FF`.
- [x] 2.2 Aplicar `font-family: "Plus Jakarta Sans"` no container principal da página.
- [x] 2.3 Ajustar padding e largura máxima para seguir o padrão das páginas de referência (`max-w-[1400px]` ou `max-w-[1920px]` conforme necessidade).

## 3. Hero Banner e Hierarquia Superior

- [x] 3.1 Criar hero banner full-width com gradiente azul `120deg #1F5BA8 → #2D7BD4 → #4A9EF5`.
- [x] 3.2 Inserir título "Visão Geral da Escala" e subtítulo descritivo no hero.
- [x] 3.3 Criar KPI pills glassmorphism com métricas: total de plantões, colaboradores escalados, dias com cobertura, alterações no mês.
- [x] 3.4 Reposicionar os botões de ação (Imprimir, Exportar iCal, Ver Histórico, Auditoria) para dentro/abaixo do hero, alinhados à direita.

## 4. Cards e Superfícies

- [x] 4.1 Refazer card de Filtros: fundo branco `#FFFFFF`, borda `#E4ECF5`, radius 20px, labels mono uppercase, inputs com foco azul.
- [x] 4.2 Refazer cards de resumo ("Plantões Filtrados", "Alterações no Mês"): fundo branco, ícones com fundo azul claro `#EAF4FF`, valores grandes em Jakarta Sans 800.
- [x] 4.3 Refazer card da tabela "Escala Detalhada de Suporte": fundo branco, borda azul clara, header azul claro.

## 5. Componentes Internos

- [x] 5.1 Reestilizar mini calendário: dia selecionado azul `#4A9EF5`, dias com plantão com dot azul, hover `#EAF4FF`.
- [x] 5.2 Reestilizar tabela `ScheduleRow`: texto `#0B1B2E`/secundário `#475467`, bordas `#E4ECF5`, hover `#EAF4FF`.
- [x] 5.3 Reestilizar badges de status para manter semântica, mas com bordas suaves e fundos no tom azul/cinza quando apropriado.
- [x] 5.4 Reestilizar botões: primários com gradiente azul, secundários branco com borda azul, danger mantendo padrão existente com radius ajustado.

## 6. Modais e Detalhes

- [x] 6.1 Revisar `ManagePlantaoModal`, `HistoricoPreviewModal` e outros modais da escala para uso de cores azuis.
- [x] 6.2 Ajustar headers, botões de ação e estados de foco dos modais para o padrão Bento Blue.

## 7. Páginas Relacionadas

- [x] 7.1 Reestilizar `PlantaoHistorico.jsx` para manter consistência com o novo padrão visual.
- [x] 7.2 Reestilizar `SelectEmployee.jsx` para usar cores azuis.

## 8. Validação Visual

- [x] 8.1 Comparar lado a lado com `Dashboard.jsx` e `Directory.jsx` para validar consistência.
- [x] 8.2 Verificar estados de hover, foco, loading e empty state.
- [x] 8.3 Rodar `npm run build` e garantir que a aplicação compila sem erros.
