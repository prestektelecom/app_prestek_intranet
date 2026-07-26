# Implementation Tasks: GlowingEffect Card Integration

## 1. Preparação do Ambiente e Dependências

- [x] 1.1 Instalar pacotes NPM (`motion`, `clsx`, `tailwind-merge`, `lucide-react`).
- [x] 1.2 Atualizar [vite.config.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/vite.config.js) com alias `@` para `./src`.
- [x] 1.3 Criar `jsconfig.json` na raiz do projeto configurando `paths` para `@/*`.

## 2. Estrutura Shadcn & Utilitários

- [x] 2.1 Criar diretório `src/lib/` e o arquivo `src/lib/utils.ts` contendo a função `cn`.
- [x] 2.2 Criar diretório `src/components/ui/` e adicionar o componente `glowing-effect.tsx`.

## 3. Integração nos Componentes de Card

- [x] 3.1 Integrar `GlowingEffect` em [BentoCard.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/common/BentoCard.jsx).
- [x] 3.2 Integrar `GlowingEffect` em `KpiCard` no [Dashboard.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Dashboard.jsx).
- [x] 3.3 Garantir que os conteúdos dentro dos cards possuam ordenação de camada (`relative z-10`) para permitir cliques.

## 4. Validação e Responsividade

- [x] 4.1 Verificar efeito de brilho responsivo ao cursor em desktop.
- [x] 4.2 Testar comportamento no modo escuro e claro da aplicação.
- [x] 4.3 Garantir fallback para dispositivos touchscreen.
