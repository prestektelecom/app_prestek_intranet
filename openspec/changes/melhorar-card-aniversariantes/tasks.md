## 1. Helpers de nome

- [x] 1.1 Criar helper de tokenização de nome em `src/components/Dashboard.jsx` que separa o nome em palavras significativas, descartando espaços extras nas bordas e as partículas de ligação (`da`, `de`, `do`, `das`, `dos`, `e`)
- [x] 1.2 Criar helper que normaliza nome em caixa alta para capitalização de nome próprio
- [x] 1.3 Criar helper que encurta o nome para primeira + última palavra significativa, tratando o caso de nome com palavra única
- [x] 1.4 Refatorar o helper `iniciais` existente (`Dashboard.jsx:870-874`) para usar a mesma tokenização, de modo que "VITOR SANTOS DA SILVA" gere iniciais "VS" e não "VD"
- [x] 1.5 Verificar manualmente os casos da spec: "ADRIANO PEREIRA GOMES DOS SANTOS" → "Adriano Santos"; "VITOR SANTOS DA SILVA" → "Vitor Silva"; "INGRID GRAZIELLE SANTOS SOUZA " (com espaço final) → "Ingrid Souza"; nome de palavra única sem erro

## 2. Rótulo temporal e data por extenso

- [x] 2.1 Estender `rotuloData` (`Dashboard.jsx:910-915`) para cobrir toda a faixa de `dias`: `0` → "Hoje", `1` → "Amanhã", demais → "em N dias"
- [x] 2.2 Criar helper que formata a data do aniversário como dia da semana abreviado + dia/mês (ex.: "seg, 04/08"), em português
- [x] 2.3 Substituir o conteúdo da linha secundária: remover o `deptoMap[...]` que renderiza vazio (`Dashboard.jsx:947`) e passar a exibir a data por extenso
- [x] 2.4 Verificar que a linha secundária nunca renderiza vazia, incluindo quando não há dado de departamento algum

## 3. Avatar com foto real

- [x] 3.1 Usar `resolveAvatarUrl(c.foto_perfil)` (já importado em `Dashboard.jsx:6`) para obter a URL da foto do colaborador
- [x] 3.2 Renderizar a foto como avatar circular com recorte sem distorção, nas mesmas dimensões do avatar de iniciais atual
- [x] 3.3 Implementar fallback para iniciais quando não houver foto — conforme decisão #3 do design, NÃO usar `AVATAR_PNGS` aqui
- [x] 3.4 Tratar falha de carregamento da imagem degradando para as iniciais, sem imagem quebrada e sem alterar a altura da linha
- [x] 3.5 Verificar que linhas com foto e linhas com iniciais têm exatamente a mesma altura e alinhamento

## 4. Hierarquia visual e interação

- [x] 4.1 Aplicar tratamento de destaque nas linhas de colaboradores com aniversário hoje ou amanhã, usando os tokens `--success-soft` / `--success-bento` já presentes no card
- [x] 4.2 Manter o tratamento padrão (`bg-surface-raised`, `text-faint`) para aniversários mais distantes
- [x] 4.3 Adicionar estado de hover nas linhas de colaborador
- [x] 4.4 Verificar que nenhuma cor nova hardcoded foi introduzida — apenas tokens de tema existentes
- [ ] 4.5 Verificar o card em tema claro e escuro
- [x] 4.6 Verificar os estados de lista vazia e de carregamento (skeleton) após as mudanças, ajustando o skeleton se a altura da row mudou

## 5. Validação da Frente 1

- [ ] 5.1 Conferir o card lado a lado com o `TeamBento`/Disponibilidade adjacente e confirmar coerência visual
- [x] 5.2 Verificar que o `GlowingEffect`, o `CARD_TITLE` e o `custom-scrollbar` continuam funcionando como antes
- [ ] 5.3 Verificar o card com lista longa (scroll) e com um único aniversariante
- [x] 5.4 Confirmar que o nome completo está acessível via atributo de título na linha

## 6. Diagnóstico do departamento (execução manual, não bloqueante)

- [ ] 6.1 Subir o backend com credenciais IXC válidas
- [ ] 6.2 Executar `/api/debug-funcionario/:id` para ao menos 3 colaboradores distintos que aparecem na lista de aniversariantes
- [ ] 6.3 Registrar em `design.md` qual das três tabelas (`su_ticket_setor`, `departamento`, `empresa_setor`) casa com `id_departamento`, ou se nenhuma casa — e se o fallback por `id_funcao` resolve
- [ ] 6.4 Se nenhuma tabela casar: registrar a conclusão, encerrar a Frente 2 sem mudança de código e pular para a tarefa 7.1

## 7. Correção do mapeamento (condicional ao resultado de 6.3)

- [x] 7.1 Corrigido em 2026-10-03 no front, não na rota: hook `useDeptoMap` em `Dashboard.jsx` busca `/api/cargos` (empresa_setor) e `/api/departamentos-empresa` e dá prioridade à `empresa_setor`; usado por `AniversariantesCard` e `TeamBento`. `npx vite build` limpo; detector com os mesmos 9 avisos de antes (fonte), nenhum nas linhas novas
- [x] 7.2 Adicionar fallback por `id_funcao` no card, seguindo o padrão já usado em `TeamBento` (`Dashboard.jsx:989`)
- [x] 7.3 Exibir o departamento como informação complementar da linha, omitindo-o por completo quando não resolver — sem reservar espaço vazio
- [x] 7.4 Verificar que colaboradores com e sem departamento resolvido convivem na mesma lista sem desalinhamento
- [x] 7.5 Confirmar que a Frente 1 continua íntegra caso a mudança de mapeamento seja revertida isoladamente

## 8. Encerramento

- [ ] 8.1 Avaliar se a rota de debug temporária `/api/debug-funcionario/:id` (`server.js:425-488`) ainda tem propósito após o diagnóstico registrado; remover se não tiver
- [x] 8.2 Rodar `openspec validate melhorar-card-aniversariantes --strict`
