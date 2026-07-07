## 1. Tokens CSS no Design System

- [x] 1.1 Adicionar `--hover-border-from`, `--hover-border-to` e `--hover-border-glow` no bloco `:root` do `src/index.css` com valores Light (`#4A9EF5`, `#2D7BD4`, `rgba(74,158,245,0.40)`)
- [x] 1.2 Adicionar os mesmos tokens no bloco `.dark` do `src/index.css` com valores Cyber (`#00F2FE`, `#4A9EF5`, `rgba(0,242,254,0.45)`)
- [x] 1.3 Adicionar os tokens no bloco `.dark-cyber` do `src/index.css` (mesmos valores de `.dark`)
- [x] 1.4 Adicionar os tokens no bloco `.dark-aurora` do `src/index.css` com valores Aurora (`#8A2BE2`, `#A04DF0`, `rgba(138,43,226,0.50)`)
- [x] 1.5 Adicionar os tokens no bloco `.dark-amoled` do `src/index.css` com valores AMOLED (`#4A9EF5`, `#7AB8F8`, `rgba(74,158,245,0.50)`)

## 2. Classe Utilitária CSS `.bento-hover-border`

- [x] 2.1 Criar a classe `.bento-hover-border` em `src/index.css` com `transition: box-shadow 250ms ease`
- [x] 2.2 Adicionar o estado `:hover` da classe com `box-shadow` de duas camadas (usando `!important`): borda sólida `0 0 0 2px var(--hover-border-from)` + glow externo `0 0 24px 0px var(--hover-border-glow)`
- [x] 2.3 Adicionar override que suprime o efeito dentro de `.layout.is-editing .bento-hover-border:hover` (reseta `box-shadow` ao valor default do card com `!important`)
- [x] 2.4 Verificar visualmente nos 4 temas (Light, Cyber, Aurora, AMOLED) que as cores corretas estão sendo aplicadas

## 3. Atualização do BentoCard Base

- [x] 3.1 Ler o arquivo `src/components/common/BentoCard.jsx` na íntegra antes de editar
- [x] 3.2 Adicionar a prop `hoverBorder` (boolean, default `true`) na assinatura da função `BentoCard`
- [x] 3.3 Aplicar `bento-hover-border` condicionalmente no `className` do `div` raiz quando `hoverBorder === true`
- [x] 3.4 Ler o arquivo após edição e verificar que props existentes (`glow`, `accent`, `className`) continuam funcionando

## 4. Aplicação nos Cards Tailwind de Serviços

- [x] 4.1 Ler `src/components/services/TechBentoCard.jsx` e adicionar `bento-hover-border` ao `className` do `div` raiz
- [x] 4.2 Verificar que o `hover:-translate-y-1` existente coexiste sem conflito (a classe utilitária não define `transform`, então a elevação do Tailwind continua funcionando normalmente)
- [x] 4.3 Ler `src/components/services/PlanoBentoCard.jsx` e adicionar `bento-hover-border` ao `className` do `div` raiz
- [x] 4.4 Ler `src/components/services/StreamingBentoCard.jsx` e adicionar `bento-hover-border` ao `className` do `div` raiz

## 5. Ajuste do KpiCard no Dashboard

- [x] 5.1 Ler `src/components/Dashboard.jsx` e localizar o componente `KpiCard` (usa inline styles)
- [x] 5.2 Adicionar a classe `bento-hover-border` ao `div` raiz do `KpiCard` via `className` prop ou diretamente no JSX
- [x] 5.3 Confirmar que a `transition` do inline style existente não conflita com a da classe utilitária

## 6. Verificação Final

- [x] 6.1 Iniciar o servidor de desenvolvimento com `npm run dev` e abrir o browser
- [x] 6.2 Testar o efeito nos cards do Dashboard no tema Light
- [x] 6.3 Alternar para tema Dark (Cyber) via ThemeSwitcher e verificar o glow ciano
- [x] 6.4 Alternar para tema Aurora e verificar o glow roxo
- [x] 6.5 Alternar para tema AMOLED e verificar o glow azul de alto contraste
- [x] 6.6 Testar no Dashboard em modo edição (react-grid-layout) e confirmar que o efeito está suprimido
- [x] 6.7 Testar em viewport mobile (< 768px) que os cards com toque também recebem feedback visual adequado
