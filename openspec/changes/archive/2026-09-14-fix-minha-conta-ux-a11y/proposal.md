## Why

A auditoria de UX/acessibilidade da página "Minha Conta" (`src/components/Configuracoes.jsx`) encontrou controles que aparentam funcionar mas não persistem dados, ausência de feedback de carregamento/erro e inconsistências de tema escuro herdadas de valores de cor fixos. Esses problemas corroem a confiança do usuário no botão "Salvar" e quebram a paridade visual com o resto do app nas variantes dark (cyber/aurora/amoled).

## What Changes

- Os toggles de "Notificações por E-mail" passam a ter estado controlado, entram em `formData` e são persistidos por `handleSave` (hoje usam apenas `defaultChecked` e nunca chegam a ser salvos).
- O estado `isLoading` (já existente) passa a ser usado no render: os campos do formulário exibem skeleton/placeholder enquanto perfil e preferências carregam.
- Falha em `handleSave` (hoje só `console.error`) passa a exibir feedback visual de erro ao usuário, com o mesmo padrão de toast já usado no sucesso.
- Cada `<label>` de campo passa a ter `htmlFor` associado ao `id` do respectivo `<input>`.
- O botão de upload de foto (câmera, icon-only) ganha `aria-label`.
- Cores fixas nos ícones da seção "Setor e Função" (`'#FDBA74'` / `'#EEF9FC'`) e nos toggles de notificação (`'#D0D7E1'` / `'#EC7D23'`) são substituídas pelos tokens de `useBentoTheme` (`C.*`), para renderizar corretamente nas 3 variantes dark.

Fora de escopo: redesenho visual da página, novas seções (ex: segurança/senha), e mudanças na paleta/estilo Bento já consolidada no app.

## Capabilities

### New Capabilities
- `settings-account-integrity`: comportamento correto do formulário "Minha Conta" — persistência de preferências de notificação, feedback de carregamento e de erro ao salvar, associação label/input acessível, e uso de tokens de tema (em vez de hex fixo) nos elementos visuais da página.

### Modified Capabilities
(nenhuma — `settings-responsive-layout` cobre apenas layout responsivo e não é afetada por esta mudança)

## Impact

- `src/components/Configuracoes.jsx`: lógica de estado dos toggles, uso de `isLoading`, tratamento de erro em `handleSave`, atributos `id`/`htmlFor`/`aria-label`, e troca de cores hex fixas por tokens `C.*`.
- `src/hooks/useBentoTheme.js`: nenhuma mudança de API — apenas consumo adicional dos tokens já existentes.
- Sem mudanças de schema de API ou de banco: os toggles usam o mesmo endpoint `/api/configuracoes/:id` já usado pelos demais campos de `formData`.
