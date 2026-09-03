## 1. Persistência dos toggles de notificação

- [x] 1.1 Adicionar `notif_comunicados_departamento`, `notif_manutencao_sistema`, `notif_atualizacoes_colaboradores` ao `formData` inicial (via `dadosPrefs`/`baseFormData`), com fallback para `true`, `true`, `false` quando ausentes
- [x] 1.2 Trocar `defaultChecked` pelos valores controlados acima e adicionar `onChange` que atualiza `formData` (handler de checkbox, análogo a `handleInputChange` mas lendo `e.target.checked`)
- [x] 1.3 Confirmar que `handleSave` envia as 3 chaves novas no payload existente (sem alterar `handleSave`)

## 2. Cor dos toggles via tokens de tema

- [x] 2.1 Substituir `background: '#D0D7E1'` do track por `C.line` (estado não marcado) e `C.accent` (estado marcado), via `style` inline condicionado ao `checked` do estado
- [x] 2.2 Remover a classe Tailwind `peer-checked:!bg-[#EC7D23]`; manter a classe de transform do thumb (`peer-checked:after:translate-x-4`) que não depende de cor dinâmica
- [x] 2.3 Verificar visualmente os 3 estados marcados/desmarcados nas variantes light, dark-cyber, dark-aurora e dark-amoled

## 3. Loading state do formulário

- [x] 3.1 Criar blocos de skeleton (usando `C.lineSoft` + animação `pulse`) com dimensões equivalentes às de `sInput`
- [x] 3.2 Renderizar os skeletons nos 3 cards de formulário (Informações Pessoais, Setor e Função, Preferências) enquanto `isLoading` é `true`
- [x] 3.3 Confirmar que não há layout shift perceptível na transição skeleton → conteúdo real

## 4. Feedback de erro ao salvar

- [x] 4.1 Adicionar estado `saveError` (boolean) setado no `catch` de `handleSave`, com auto-dismiss via `setTimeout` (mesmo padrão de `saveSuccess`)
- [x] 4.2 Renderizar toast de erro (mesma estrutura do toast de sucesso existente) usando `C.danger`/`C.dangerSoft` e ícone `error`, com texto indicando falha ao salvar
- [x] 4.3 Testar o caminho de erro simulando falha de rede/API (ex: endpoint indisponível) e confirmar que o toast de erro aparece — achado durante o teste: `handleSave` nunca checava `res.ok`, então uma resposta HTTP de erro (não só falha de rede) passava batido; corrigido lançando erro quando qualquer resposta não é `ok`

## 5. Acessibilidade — labels e botão de avatar

- [x] 5.1 Adicionar `id={name}` em cada `<input>` de "Informações Pessoais" e `htmlFor={name}` no `<label>` correspondente
- [x] 5.2 Repetir para os campos readonly de "Setor e Função" (Setor, Localização) e o campo editável de Ramal
- [x] 5.3 Adicionar `id`/`htmlFor` nos 3 toggles de notificação, ligando o `<span>` de label do toggle ao `<input type="checkbox">`
- [x] 5.4 Adicionar `aria-label="Alterar foto de perfil"` no botão de câmera do avatar (mantendo o `title` existente)

## 6. Tokens de cor — seção "Setor e Função"

- [x] 6.1 Substituir `sIconBox('#FDBA74', '#EEF9FC')` por uma versão baseada em `C.cyan` e `tone(C.cyan, 0.15)` (ou token equivalente), consistente com o padrão usado nos demais `sIconBox` do arquivo
- [x] 6.2 Substituir a faixa de topo do card (`linear-gradient(90deg, #FDBA74, ${tone('#FDBA74', 0.3)})`) por `C.cyan` no lugar do hex fixo
- [x] 6.3 Verificar visualmente a seção nas variantes light e nas 3 variantes dark

## 7. Verificação final

- [x] 7.1 Rodar a página localmente e validar manualmente os 7 pontos do proposal.md (toggles persistem após reload, loading visível, erro visível, labels associados via leitor de tela/devtools accessibility tree, botão de câmera com nome acessível, cores corretas em todos os temas) — validado via harness isolado (`ThemeProvider` + `Configuracoes` com `fetch` mockado, sem depender de login real nem do backend/DB de produção) e Playwright, screenshots em light/dark-cyber/dark-aurora/dark-amoled, toggle persistindo valores 'true'/'false' vindos do mock, skeleton sem layout shift perceptível, e toast de erro confirmado após o fix da tarefa 4.3
- [x] 7.2 Rodar lint/build do projeto para garantir que não há regressão de sintaxe ou tipos
