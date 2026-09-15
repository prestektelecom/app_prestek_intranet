## Why

A crítica dual-agent isolada (Assessment A 23/40, Assessment B com achados ao vivo) e o audit técnico (10/20) da Fase 14 do programa Impeccable (`programa-impeccable/tasks.md`, seção 14) encontraram 2 problemas P0 e 7 P1 na aba TI (`src/components/Ti.jsx` + `src/components/ti/**`), a tela mais nova nunca antes tocada pelo programa:

- **P0**: 5 controles Sim/Não (`Segmentado`) — incluindo "Criar usuário do sistema" e "Possui deficiência" — têm `label[for]` órfão (o `id` nunca chega ao componente) e nenhum dos 33 campos do formulário tem `required`/`aria-required`. Um leitor de tela encontra um par "Sim"/"Não" sem nome nenhum antes de decidir um dado que entra num registro de ERP.
- **P0**: zero regiões `aria-live` na tela inteira. O toast de resultado da simulação e o card de resultado do dry-run — a saída principal desta ferramenta — não anunciam nada para leitor de tela.
- **P1**: `text-[var(--accent)]` sobre `bg-[var(--accent-soft)]` no pill ativo da bandeja de ferramentas e no toggle Sim/Não ativo — 2,63:1, mesmo antipadrão já corrigido em `SectorsToolbar` (Fase 7).
- **P1**: `text-muted` como texto real em 37+ rótulos, subtítulos, dicas **e mensagens de erro de validação** — 3,01:1 no claro, passa em AMOLED — 7ª+ recorrência do antipadrão mais repetido do programa.
- **P1**: o botão "Simular cadastro" usa um gradiente que reprova contraste com o próprio texto branco na ponta mais clara (7,31→2,79:1), e o toast de erro (fundo vermelho translúcido) reprova a 3,41:1 — falha em TODOS os temas, não é um problema de tema específico.
- **P1**: alvos de toque abaixo de 44px generalizados (toggle Sim/Não 30px, pill da bandeja 35,5px, selects 36px, campos de texto 37,5px, datas 39,5px, botão "Simular cadastro" 40px) — nenhum com expansão por pseudo-elemento, ou seja, nenhum falso-positivo.
- **P1**: o combobox de cidade é hostil a teclado — Escape não fecha, seta não navega entre opções, indicador de foco a 1,048:1, `role="combobox"` ausente.
- **P1**: o rótulo "Etapa 1 de 3 · Ficha" no hero é decorativo — nunca avança, mesmo depois de rodar a simulação, e não existe um "passo 3" real (a criação é um stub 501) — a tela promete uma jornada linear que não existe.
- **P1**: abaixo do breakpoint `xl` (a maioria das larguras reais), o botão "Simular cadastro" fica 3,4 a 5,7 telas de rolagem abaixo da dobra, junto com toda a contagem de erros.

## What Changes

- **Adiciona** nome acessível aos 5 controles Sim/Não (`role="group"` + `aria-labelledby` apontando para o rótulo já existente) e `required`/`aria-required` aos campos obrigatórios, incluindo `aria-invalid`/`aria-describedby` ligando cada campo à sua mensagem de erro.
- **Adiciona** `role="alert"` ao toast e `role="status"`/`aria-live="polite"` ao card de resultado do dry-run.
- **Corrige** `text-[var(--accent)]`→`text-[var(--accent-dark)]` no pill ativo e no toggle Sim/Não.
- **Corrige** `text-muted`→`text-faint` nos 37+ rótulos/subtítulos/dicas, e separa as mensagens de erro de validação para um estilo distinto (`text-red-600`/`dark:text-red-400`, já usado em outras partes da mesma ferramenta) em vez de reusar o estilo de dica neutra.
- **Corrige** o gradiente do botão "Simular cadastro" para dois tons escuros o bastante para o texto branco passar em toda a extensão, e escurece o fundo do toast de erro.
- **Corrige** os alvos de toque de todos os controles listados para no mínimo 44px efetivos.
- **Adiciona** navegação por teclado ao combobox de cidade (Escape fecha, setas navegam, Enter seleciona, `aria-activedescendant`, `role="combobox"`) e corrige o contraste do indicador de destaque.
- **Corrige** o rótulo "Etapa 1 de 3" para refletir o estado real (preenchendo/simulado), em vez de uma contagem fixa que nunca muda e promete um passo que não existe.
- **Adiciona** uma barra de ação fixa (abaixo de `xl`) com o botão "Simular cadastro" e a contagem de erros sempre visíveis, sem depender de rolar a página inteira.

## Capabilities

### Modified Capabilities

- `ti-hub`: ganha requisitos de contraste do pill de navegação e de alcance da ação primária em qualquer largura.
- `ti-cadastro-colaborador`: ganha requisitos de acessibilidade (nome acessível, obrigatoriedade programática, regiões live), contraste, alvos de toque, navegação por teclado no combobox e comunicação honesta de progresso.

## Impact

- **Arquivos**: `src/components/Ti.jsx`, `src/components/ti/TiHero.jsx` (não tocado, já ok), `src/components/ti/CadastroColaborador.jsx`, `src/components/ti/cadastro/{estilos.js,CampoForm.jsx,CidadeCombobox.jsx,DryRunResultado.jsx,PainelLateral.jsx,SecaoForm.jsx,UploadFicha.jsx}`
- **Sem impacto** em dado real — a ferramenta continua dry-run only, nenhuma mudança toca a integração com o IXC
- **Fora de escopo** (registrado em Pendências): defaults pré-marcados contados como "preenchidos" antes de qualquer interação; contagem de erros divergente entre o painel lateral e o card do dry-run; reselecionar o mesmo PDF após uma falha de parse não faz nada; sem guarda global de drag/drop (soltar um PDF fora da zona navega para fora da página); o estado de progresso de OCR "Página X · Y%" é UI morta, nunca alcançável; o tamanho de 10px dos rótulos é transversal a 12+ arquivos (Fase 16, não local); "Copiar JSON" falha calado em navegador sem clipboard seguro.
