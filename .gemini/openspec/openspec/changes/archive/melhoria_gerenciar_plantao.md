# Melhorias no Modal "Gerenciar Plantão"

Análise completa do modal atual e proposta de melhorias em UX, UX de dados, performance e código.

---

## Problemas Identificados

### 🔴 UX / Usabilidade
1. **Busca nos colaboradores ausente** — as listas de checkboxes crescem muito (21 N1, 20 N2, 6 Sup) e não há campo de busca/filtro interno para encontrar um nome rapidamente.
2. **Sem contagem de selecionados no cabeçalho do grupo** — o usuário não sabe quantos estão marcados sem contar visualmente.
3. **Alert de "já existe" repete info** — o aviso âmbar mostra nomes que já estão pré-marcados nos checkboxes; é redundante e ocupa espaço valioso.
4. **Botão "Limpar" só existe no N2** — N1 e Supervisão não têm equivalente, forçando o usuário a desmarcar manualmente.
5. **Modal não mostra botão "Limpar"/"Selecionar tudo"** no contexto geral.
6. **Histórico de alterações misturado com formulário** — está dentro do scroll do form, misturado com os campos de edição, dificultando a leitura.
7. **Badges de selecionados mostram só o primeiro nome** — "ANNE" em vez de "ANNE D." pode ser ambíguo com colaboradores homônimos.
8. **Formulário não valida antes de salvar** — é possível salvar sem nenhuma atribuição (N1 vazio, N2 vazio, Sup. vazio), sem qualquer alerta.
9. **Confirmação de sobrescrita é um modal extra** — o fluxo tem 3 cliques (Salvar → confirmar modal → sim substituir). Poderia ser inline.

### 🟡 Design / Visual
10. **Altura fixa `max-h-28`** nas listas de checkbox é pequena demais — com 20+ nomes, o scroll interno é pesado e causa "scroll aninhado" (scroll dentro de scroll dentro de modal).
11. **O histórico sempre fica no final** mesmo que seja secundário; deveria ser colapsável.
12. **Sem separação visual clara** entre as seções N1, N2 e Supervisão — tudo parece um bloco único.
13. **Botão "Excluir" (lixeira) sem texto** — ícone sozinho não é suficientemente descritivo para uma ação destrutiva.

### 🔵 Código / Qualidade
14. **`MultiSelectEmployee` usa sempre `func.funcionario_id` como key/value** mas o componente de Supervisão recebe `funcionarios` que têm estrutura diferente (`id` vs `funcionario_id`) — campo de ID inconsistente entre os três grupos.
15. **`Schedule.jsx` tem 769 lines** — acima do limite de 200 linhas da regra de código; o modal deve ser extraído.
16. **`confirmOverwriteOpen` pode ser eliminado** — ao salvar sobre existente, basta mudar o fluxo para sempre sobrescrever (já há o aviso âmbar) ou usar um inline confirm.

---

## Proposed Changes

### Melhoria 1 — Extrair o modal para `ManagePlantaoModal.jsx` ⭐ Alta prioridade

#### [NEW] `src/components/schedule/ManagePlantaoModal.jsx`
- Mover toda a lógica do modal (linhas 536–658 de `Schedule.jsx`) para componente próprio.
- Props: `{ isOpen, selectedDate, existingPlantao, formData, setFormData, onSave, onDelete, onClose, historico, loadingHistorico, salvando, deletando, colaboradoresNoc, colaboradoresSuporteN2, funcionarios }`
- **Benefício**: `Schedule.jsx` cai para ~530 linhas (caminho para 200) e o modal fica testável isoladamente.

#### [MODIFY] `src/components/Schedule.jsx`
- Importar e usar `<ManagePlantaoModal />` no lugar do bloco inline.

---

### Melhoria 2 — Busca interna + contagem no `MultiSelectEmployee` ⭐ Alta prioridade

#### [MODIFY] `src/components/schedule/MultiSelectEmployee.jsx`
Adicionar:
- **Campo de busca** no topo da lista (filtra por nome em tempo real).
- **Badge de contagem** `(X selecionados)` ao lado do label do grupo.
- **Botão "Limpar"** em todos os grupos (não só N2 com `allowEmpty`).
- **Botão "Selecionar todos"** quando há busca ativa (selecionar resultados filtrados).
- Aumentar `max-h` de `max-h-28` (7 linhas ~) para `max-h-44` (11 linhas ~) para reduzir scroll aninhado.

---

### Melhoria 3 — Seções colapsáveis e melhor hierarquia visual

#### [MODIFY] `src/components/schedule/ManagePlantaoModal.jsx`
- Cada grupo (N1, N2, Supervisão) vira um **accordion colapsável** com estado local.
- Por padrão todos abertos; ao colapsar, mostra só os badges de selecionados.
- Ícone `expand_more` / `expand_less` no cabeçalho de cada seção.
- Separador visual entre seções (`border-t` ou fundo alternado).

---

### Melhoria 4 — Histórico colapsável em aba/accordion

#### [MODIFY] `ManagePlantaoModal.jsx`
- Histórico movido para um **accordion colapsável** fechado por padrão.
- Quando aberto, exibe os cards normalmente.
- Isso libera espaço vertical para as listas de seleção crescerem.

---

### Melhoria 5 — Validação antes de salvar

#### [MODIFY] `Schedule.jsx` → função `salvarPlantao`
- Antes de chamar `executarSalvamento`, verificar se ao menos **N1 tem 1 selecionado**.
- Exibir mensagem de erro inline (não toast) no modal se inválido.
- N2 e Supervisão permanecem opcionais.

---

### Melhoria 6 — Simplificar fluxo de sobrescrita

#### [MODIFY] `Schedule.jsx`
- Eliminar o modal de confirmação de sobrescrita (`confirmOverwriteOpen`).
- O aviso âmbar já informa que "Salvar irá substituir".
- Ao clicar em "Salvar", executa direto (o alerta já cumpre o papel de aviso).
- **Mantém** o modal de confirmação de **exclusão** (ação mais destrutiva).

---

### Melhoria 7 — Botão Excluir com label de texto

#### [MODIFY] `ManagePlantaoModal.jsx`
- Adicionar texto "Excluir" ao botão de deletar (ícone + texto) para clareza.

---

### Melhoria 8 — Normalizar IDs no `MultiSelectEmployee` para Supervisão

#### [MODIFY] `src/components/schedule/MultiSelectEmployee.jsx`
- Aceitar prop `idField` e `nameField` para suportar objetos com estruturas diferentes:
  - NOC/N2: `{ funcionario_id, funcionario_nome }`
  - Supervisão (funcionarios): `{ id, funcionario_nome }` ou `{ id, nome }`
- Isso resolve o bug silencioso onde supervisores não eram identificados corretamente.

---

## Ordem de Implementação

| # | Melhoria | Impacto | Esforço | Prioridade |
|---|----------|---------|---------|------------|
| 1 | Extrair modal para componente próprio | Alto | Médio | 🔴 Alta |
| 2 | Busca + contagem no MultiSelect | Alto | Médio | 🔴 Alta |
| 5 | Validação antes de salvar | Médio | Baixo | 🔴 Alta |
| 6 | Remover modal de sobrescrita | Médio | Baixo | 🟡 Média |
| 7 | Botão excluir com label | Baixo | Baixo | 🟡 Média |
| 8 | Normalizar idField/nameField | Alto | Baixo | 🟡 Média |
| 3 | Seções colapsáveis | Médio | Médio | 🟢 Baixa |
| 4 | Histórico colapsável | Baixo | Baixo | 🟢 Baixa |

---

## Verification Plan

### Testes Funcionais
- [ ] Abrir modal em data sem plantão → checkboxes vazios, sem alerta âmbar
- [ ] Abrir modal em data com plantão → checkboxes pré-marcados, alerta âmbar visível
- [ ] Buscar por nome dentro de cada lista → filtra corretamente
- [ ] Tentar salvar sem N1 → erro inline é exibido
- [ ] Salvar com existente → sobrescreve sem modal extra de confirmação
- [ ] Deletar plantão → modal de confirmação aparece
- [ ] Histórico colapsável abre/fecha corretamente
- [ ] `funcionarios` (supervisão) resolvem corretamente via `idField`

### Build
- `npm run dev` sem erros no console
- `Schedule.jsx` reduzido (abaixo de 600 linhas após extração do modal)
