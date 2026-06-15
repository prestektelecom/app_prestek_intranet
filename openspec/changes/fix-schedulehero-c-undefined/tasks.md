## 1. Correção no ScheduleHero

- [x] 1.1 Abrir `src/components/Schedule.jsx` e localizar a função `ScheduleHero` (linha 20).
- [x] 1.2 Adicionar `const C = useBentoTheme();` como primeira linha do corpo da função `ScheduleHero`, antes de qualquer lógica ou retorno.
- [x] 1.3 Verificar se `useBentoTheme` já está importado no topo do arquivo (linha 10). Não deve ser necessário alterar imports.

## 2. Validação

- [ ] 2.1 Iniciar o servidor de desenvolvimento e acessar a página de Escala.
- [ ] 2.2 Confirmar que o console do navegador não exibe mais `ReferenceError: C is not defined`.
- [ ] 2.3 Verificar visualmente se o hero da Escala renderiza com o gradiente e as cores esperadas.
- [ ] 2.4 Rodar `npm run build` (ou equivalente) para garantir que não há erros de compilação.
