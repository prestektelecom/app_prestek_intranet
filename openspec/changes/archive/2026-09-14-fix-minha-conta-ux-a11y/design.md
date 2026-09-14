## Context

`Configuracoes.jsx` já tem toda a infraestrutura de estado necessária (`formData`, `isLoading`, `isSaving`, `saveSuccess`, `handleSave`, `handleInputChange`) — os problemas listados no proposal.md são lacunas pontuais de fiação (wiring), não falta de arquitetura. `handleSave` já salva qualquer chave presente em `formData` genericamente (`Object.entries(dadosFinais)`), então novas chaves persistem sem precisar tocar o backend ou o formato do payload.

Os toggles de notificação hoje usam Tailwind arbitrary-value (`peer-checked:!bg-[#EC7D23]`) para cor — string estática, não pode referenciar os tokens `C.*` (que mudam em runtime conforme o tema). Isso é a causa raiz do problema de dark mode nos toggles, não apenas um valor de cor errado.

Ver proposal.md - Why para a motivação completa.

## Goals / Non-Goals

**Goals:**
- Fechar as lacunas de wiring (persistência dos toggles, loading, erro, a11y, tokens de cor) sem alterar contrato de API nem introduzir dependências novas.
- Reaproveitar os padrões visuais já existentes na página (toast de sucesso, `sCard`, `tone()`) para os novos estados (skeleton, toast de erro) em vez de criar um sistema visual paralelo.

**Non-Goals:**
- Redesenhar a página ou adicionar novas seções (segurança, sessões).
- Extrair um design system de "toggle"/"skeleton" reutilizável para outras páginas — o escopo é local a este arquivo.
- Mudar o endpoint `/api/configuracoes/:id` ou seu formato de request.

## Decisions

**Toggles de notificação: chave própria em `formData`, controlada, sem Tailwind arbitrary-value para cor.**
Cada toggle passa a ter uma chave estável (`notif_comunicados_departamento`, `notif_manutencao_sistema`, `notif_atualizacoes_colaboradores`) lida de `formData` com fallback para o default atual (`true`, `true`, `false` respectivamente) quando a chave ainda não existe nas preferências salvas — isso evita que usuários com preferências já salvas antes desta mudança vejam os toggles "resetarem" visualmente. Por já entrarem em `formData`, `handleSave` os persiste automaticamente, sem mudar sua lógica de payload.
A cor do track do toggle (hoje `peer-checked:!bg-[#EC7D23]` fixo) passa a ser controlada por `style` inline (`background: checked ? C.accent : C.line`), já que o componente precisa de um `checked` controlado de qualquer forma para a persistência — a mesma mudança resolve wiring e dark mode juntos. A animação do thumb (`translate-x`) continua via classe Tailwind `peer-checked`, pois não depende de cor dinâmica.
Alternativa descartada: interpolar hex em classe Tailwind (`` `peer-checked:!bg-[${C.accent}]` ``) — não funciona de forma confiável porque o content-scanner do Tailwind precisa de strings de classe completas e estáticas no código-fonte.

**Loading: skeleton inline reaproveitando os tokens existentes, sem biblioteca nova.**
Enquanto `isLoading` é `true`, os 3 cards de formulário renderizam blocos de skeleton (retângulos com `background: C.lineSoft` e animação `pulse` simples via `@keyframes`, mesmo padrão de `<style>` inline já usado no toast) do mesmo tamanho dos inputs reais, para não causar layout shift na transição.

**Erro de salvamento: toast de erro espelhando o toast de sucesso já existente.**
Novo estado `saveError` (boolean), setado no `catch` de `handleSave` junto com log existente, e limpo com o mesmo padrão de auto-dismiss (`setTimeout`) do `saveSuccess`. Visualmente reaproveita a mesma estrutura de toast fixo no rodapé, trocando `C.success`/ícone `check_circle` por `C.danger`/ícone `error` e o texto para algo como "Não foi possível salvar" — sem extrair um componente de Toast genérico, para manter o diff mínimo.

**Acessibilidade: `id` derivado do `name` do campo.**
Cada input já tem um `name` único (`nome`, `sobrenome`, `email`, `telefone_celular`, `data_nascimento`, `ramal`, mais os readonly de setor/filial e os 3 toggles) — reaproveitado como `id`, com `htmlFor={name}` no `<label>` correspondente. Sem necessidade de gerar IDs sintéticos.
Botão de câmera do avatar ganha `aria-label="Alterar foto de perfil"`, mantendo o `title` existente para o tooltip visual.

## Risks / Trade-offs

- [Preferências salvas antes da mudança não têm as chaves `notif_*`] → fallback explícito para os defaults atuais ao ler `formData`/`dadosPrefs`, então o comportamento visual não muda até o usuário alterar e salvar.
- [Skeleton com dimensões diferentes dos inputs reais causaria layout shift] → dimensionar os blocos de skeleton para bater com a altura/padding de `sInput` (mesmo `border-radius`, mesma altura aproximada).
- [Mover a cor do toggle de Tailwind para `style` inline reduz um pouco a "escaneabilidade" da classe no JSX] → aceitável: é o mesmo padrão inline (`sInput`, `sCard`, etc.) já usado no resto do arquivo para valores dependentes de tema.
