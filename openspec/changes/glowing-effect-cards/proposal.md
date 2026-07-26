# Proposal: Integriação do Componente GlowingEffect nos Cards

## Why

Os cards de métricas (KPIs), Bento Cards e cards de serviços da intranet possuem atualmente bordas de hover estáticas ou sombras simples. A inclusão do efeito interativo `GlowingEffect` (inspirado no Aceternity UI / Shadcn) traz uma experiência moderna com iluminação por leque de gradiente orientada pelo cursor do usuário, aumentando o dinamismo visual da aplicação.

## What Changes

- Instalação dos pacotes de suporte: `motion`, `clsx`, `tailwind-merge` e `lucide-react`.
- Configuração do alias `@/` no `vite.config.js` e suporte de editor via `jsconfig.json` para arquivos TypeScript/React.
- Criação do diretório e utilitário `src/lib/utils.ts` para a função `cn(...)`.
- Criação do componente `src/components/ui/glowing-effect.tsx` (Shadcn UI structure).
- Atualização do componente `BentoCard` ([BentoCard.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/common/BentoCard.jsx)) e cards de métricas no `Dashboard` ([Dashboard.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Dashboard.jsx)) para incorporar a borda de efeito com ponteiro ativo.
- Otimização para telas sensíveis ao toque (Mobile / Touch), desativando animações pesadas de ponteiro usando o hook `useTouchOnly`.

## Capabilities

### New Capabilities
- `glowing-effect-ui`: Suporte a bordas dinâmicas iluminadas com gradientes radiais/cônicos interativos via mouse em componentes React.

### Modified Capabilities
- `bento-card-ui`: O componente `BentoCard` e derivados passam a integrar a animação `GlowingEffect`.

## Impact

- **Dependências**: Adição de `motion`, `lucide-react`, `clsx` e `tailwind-merge` ao `package.json`.
- **Configuração**: Alteração do `vite.config.js` (inclusão de `resolve.alias`).
- **Novos Arquivos**: `jsconfig.json`, `src/lib/utils.ts`, `src/components/ui/glowing-effect.tsx`.
- **Arquivos Alterados**: `src/components/common/BentoCard.jsx`, `src/components/Dashboard.jsx`.
