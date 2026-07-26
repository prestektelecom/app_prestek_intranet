## 1. Componente ComunicadoBanner

- [x] 1.1 Criar função `ComunicadoBanner({ setCurrentView })` em `Dashboard.jsx` — faz fetch de `/api/comunicados` e aplica lógica de prioridade (Urgente > Importante > mais recente)
- [x] 1.2 Implementar lógica de seleção do comunicado em destaque: `find(Urgente) || find(Importante) || comunicados[0]`
- [x] 1.3 Implementar estado de loading com skeleton animado (mesmo formato e altura do banner real)
- [x] 1.4 Implementar `return null` quando a lista de comunicados estiver vazia
- [x] 1.5 Implementar exibição com imagem de capa: `background-image` via `imagem_url` (ou `foto` / `capa`) com `object-fit: cover` e overlay gradiente `rgba(0,0,0,0.55)`
- [x] 1.6 Implementar fallback de gradiente sólido temático por tipo (vermelho → Urgente, âmbar → Importante, azul → demais)
- [x] 1.7 Adicionar badge de tipo (URGENTE / IMPORTANTE / AVISO / GERAL / INFO) com cores do sistema existente (`TAG_STYLES`)
- [x] 1.8 Exibir título em bold e data relativa (reutilizar `relativeTime()` já existente no `ComunicadosCard`)
- [x] 1.9 Tornar banner clicável → `setCurrentView('announcements')`
- [x] 1.10 Adicionar animação de entrada suave (`fade-in` / `opacity` transition no mount)

## 2. Integração no Dashboard

- [x] 2.1 Inserir `<ComunicadoBanner setCurrentView={setCurrentView} />` no JSX do Dashboard entre `<DashboardHeader />` e `<ResponsiveReactGridLayout>`
- [x] 2.2 Adicionar margem inferior adequada ao banner para separar do Bento Grid (`mb-5` ou similar)

## 3. Ajuste no ComunicadosCard

- [x] 3.1 Aplicar a mesma lógica de seleção do destaque no `ComunicadosCard`: `featured = find(Urgente) || find(Importante) || comunicados[0]`
- [x] 3.2 Remover o bloco "featured" do topo do `ComunicadosCard` (a seção com gradiente de cor que mostrava o primeiro comunicado)
- [x] 3.3 Ajustar a lista para exibir `rest = comunicados.filter(c => c.id !== featured?.id)` em vez de `comunicados.slice(1)`
- [x] 3.4 Atualizar mensagem de estado vazio: "Nenhum outro comunicado." quando há destaque mas sem itens adicionais

## 4. Responsividade e Polimento

- [x] 4.1 Verificar altura do banner em mobile (sm/xs): ajustar para `h-40` ou `h-48` em telas pequenas via classes Tailwind responsivas
- [x] 4.2 Garantir que o texto do título não ultrapasse 2 linhas no banner (usar `line-clamp-2`)
- [x] 4.3 Testar visual sem imagem (fallback de gradiente) nos três tipos principais: Urgente, Importante, Geral
