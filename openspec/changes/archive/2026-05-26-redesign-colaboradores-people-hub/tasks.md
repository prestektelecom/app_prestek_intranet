## 1. Preparação e estrutura base

- [x] 1.1 Ler o `Directory.jsx` atual completo e mapear todos os hooks, estados e funções utilitárias a preservar
- [x] 1.2 Definir o objeto de paleta `C` no topo do arquivo (idêntico ao Dashboard.jsx)
- [x] 1.3 Criar a função `getDeptColor(deptName)` com o mapa `DEPT_COLORS` por palavra-chave → cor hex
- [x] 1.4 Adicionar o `@keyframes pulse-ring` no `index.css` para o indicador de presença pulsante

## 2. Hero Banner com busca inline e KPIs

- [x] 2.1 Criar o componente `HeroBanner` dentro do `Directory.jsx` com gradiente `linear-gradient(120deg, #1F5BA8, #2D7BD4, #4A9EF5)`
- [x] 2.2 Adicionar o grid pattern SVG overlay e os dois blur orbs (cópia do `HeroCard` do Dashboard)
- [x] 2.3 Integrar o campo de busca inline no hero com estilo glassmorphism (`background: rgba(255,255,255,0.15)`, `backdropFilter: blur(6px)`)
- [x] 2.4 Renderizar os 3 KPI pills (Total, Ativos, Departamentos) conectados ao estado `colaboradores`

## 3. Chips horizontais de filtro por departamento

- [x] 3.1 Criar o componente `DeptChips` com container `overflow-x: auto` + classe `scrollbar-hide`
- [x] 3.2 Derivar `deptChips` dos `colaboradoresFiltrados` (antes do filtro de depto) com contagem de membros por depto
- [x] 3.3 Renderizar o chip "Todos" com contagem total como primeiro item
- [x] 3.4 Aplicar estilos de chip ativo (`accentSoft`/`accentDeep`) vs inativo (branco/`ink2`) com transição suave
- [x] 3.5 Ao clicar em chip, atualizar `deptoFiltro` e resetar `visibleCount` para 16

## 4. Card de colaborador v2

- [x] 4.1 Criar o componente `EmployeeCardV2` substituindo `EmployeeCard`
- [x] 4.2 Adicionar borda esquerda colorida (4px, `borderLeft: '4px solid <deptColor>'`)
- [x] 4.3 Aplicar ring colorido no avatar (`boxShadow: '0 0 0 3px <deptColor>'`)
- [x] 4.4 Adicionar indicador de presença pulsante: bolinha verde com `animation: pulse-ring` para colaborador ativo
- [x] 4.5 Renderizar badge do departamento com `background: rgba(<deptColor>, 0.12)` e `color: <deptColor>`
- [x] 4.6 Implementar hover reveal das ações de contato (email + telefone) com `opacity: 0→1` + `translateY` via `useState(hover)`
- [x] 4.7 Tratar fallback: botão desabilitado quando email ou ramal ausente

## 5. Scroll infinito via IntersectionObserver

- [x] 5.1 Adicionar estado `const [visibleCount, setVisibleCount] = useState(16)` ao componente principal
- [x] 5.2 Criar `useRef(null)` para o elemento sentinel (div no final da lista)
- [x] 5.3 Implementar `useEffect` com `IntersectionObserver` que incrementa `visibleCount` em 16 ao detectar interseção do sentinel
- [x] 5.4 Desconectar o observer quando `visibleCount >= colaboradoresFiltrados.length`
- [x] 5.5 Adicionar `useEffect([busca, deptoFiltro])` que reseta `visibleCount` para 16
- [x] 5.6 Renderizar o sentinel com spinner/skeleton sutil somente quando há mais itens a carregar
- [x] 5.7 Remover completamente a lógica de paginação anterior (`pagina`, `totalPaginas`, `paginasVisiveis`, etc.)

## 6. Montagem final e limpeza

- [x] 6.1 Substituir o JSX de retorno do `Directory` pela nova estrutura: Hero → Chips → Grid → Sentinel
- [x] 6.2 Remover variáveis de estado de paginação não mais utilizadas
- [x] 6.3 Verificar que `sessionStorage.getItem('@Stitch:directoryFilter')` ainda funciona corretamente com chips
- [x] 6.4 Testar scroll infinito: carregar +16 ao rolar, resetar ao filtrar, parar ao esgotar a lista
- [x] 6.5 Testar responsividade: grid 1 col (mobile), 2 col (sm), 3 col (lg), 4 col (xl)
- [x] 6.6 Confirmar que ações de contato (email/telefone) funcionam corretamente no hover
