## Context

`Directory.jsx` é da primeira geração de código do projeto: arquivo único, inline styles alimentados por `useBentoTheme()`, subcomponentes declarados no mesmo arquivo. A segunda geração — `ServicesDirectory.jsx`, `Ti.jsx`, `Coverage.jsx` — usa Tailwind com tokens semânticos, componentes em pasta por feature e primitivos compartilhados em `ui/`.

Entre uma geração e outra, três utilitários foram extraídos justamente dos padrões que o Directory inventou primeiro (`ui/ChipButton.jsx` e `ui/HeroSearchInput.jsx` dizem isso nos próprios comentários: "extraído aqui no terceiro uso"). O Directory ficou para trás e hoje é a única tela que ainda carrega as versões bugadas.

O shell (`App.jsx:154`) é um flex row: `Sidebar` de 248px + coluna de conteúdo. Toda página precisa ser `flex-1` e dona do próprio scroll — sem isso o `<main>` congela em `max-content` e cola na sidebar. É a lição registrada na change `coverage-layout-proporcional`.

Cinco temas precisam ser verificados, não dois: `light`, `dark`, `dark-cyber`, `dark-aurora`, `dark-amoled`.

## Goals / Non-Goals

**Goals:**
- Zerar as falhas de WCAG 2.1 AA da tela nos cinco temas.
- Substituir as reimplementações locais pelos primitivos de `ui/`.
- Dar um estado de erro honesto (hoje falha de backend vira "empresa sem colaboradores").
- Aumentar a densidade para a tarefa dominante: achar o ramal/e-mail de alguém.
- Alinhar espaçamento e ritmo vertical à Central de Vendas.

**Non-Goals:**
- Modal de detalhe do colaborador — merece change própria.
- Trocar scroll infinito por botão "Carregar mais" — a spec `infinite-scroll-directory` está viva e a visão em lista já ataca o problema de densidade.
- Mudanças no backend ou no contrato de `/api/colaboradores`.
- Extrair o segmented control para `ui/` — apesar de estar no quarto uso. Fica anotado para uma change de limpeza.

## Decisions

### D1 — Duas rampas de cor por departamento, validadas numericamente

**Decisão:** cada departamento passa a ter três hex em vez de um:

| Departamento | `tintaClara` | `tintaEscura` | `marca` |
|---|---|---|---|
| Atendimento / Suporte | `#9A3412` | `#FDBA74` | `#EA580C` |
| TI / NOC | `#075985` | `#7DD3FC` | `#0284C7` |
| Comercial / Marketing | `#92400E` | `#FCD34D` | `#D97706` |
| Financeiro / Cobrança | `#065F46` | `#6EE7B7` | `#059669` |
| RH | `#5B21B6` | `#C4B5FD` | `#8B5CF6` |
| Campo / Instalação | `#9F1239` | `#FDA4AF` | `#E11D48` |
| Frota / Logística | `#115E59` | `#5EEAD4` | `#0D9488` |
| Diretoria | `#334155` | `#CBD5E1` | `#64748B` |

`tinta*` é **texto** (badge de departamento, chip ativo) e precisa de ≥4,5:1 contra a superfície. `marca` é a faixa de 4px e a borda esquerda — componente de UI não-textual, ≥3:1.

Contrastes medidos contra as superfícies reais (`#FFFFFF`, cyber `#111C2C`, aurora `#161233`, amoled `#0A0A0A`):

```
dept          tintaL/W  tD/cyber  tD/aurora tD/amoled  marca/W  m/cyber  m/aurora m/amoled
Atendimento      7.31     10.15     10.66     11.74      3.56     4.81     5.05     5.56
TI/NOC           7.56     10.27     10.78     11.87      4.10     4.18     4.39     4.83
Comercial        7.09     11.88     12.46     13.73      3.19     5.38     5.64     6.21
Financeiro       7.68     11.23     11.79     12.99      3.77     4.54     4.77     5.25
RH               8.98      9.28      9.74     10.72      4.23     4.04     4.24     4.66
Campo            8.02      9.06      9.50     10.47      4.70     3.65     3.83     4.21
Frota            7.58     11.58     12.15     13.38      3.74     4.57     4.80     5.29
Diretoria       10.35     11.53     12.11     13.33      4.76     3.60     3.78     4.16
```

Piso exigido: 4,5 nas quatro primeiras colunas, 3,0 nas quatro últimas. Todas aprovam.

**Alternativas consideradas:**
- *Manter uma cor só e escurecer/clarear em runtime* — dá controle pior e produz tons sujos em hues saturadas.
- *Abandonar cor por departamento e usar só ícone* — perde o encoding categórico que faz a varredura funcionar.

**Rationale:** a paleta atual reprova nos oito departamentos porque foi escolhida como cor de **marca** e depois usada como cor de **texto** — dois requisitos de contraste diferentes (3:1 vs 4,5:1) num valor só. Separar os papéis é o que torna o problema solúvel.

**Nota de calibração:** TI sai do pêssego `#FDBA74` para azul. O pêssego colidia com `--accent` (laranja da marca) e era o pior contraste da tela (1,69:1). Manter TI laranja significaria confundi-lo com o estado ativo do chip.

### D2 — Ações visíveis por padrão, escondidas só onde o hover é confiável

**Decisão:** inverter a lógica do CSS.

```css
.emp-card-actions { opacity: 1; transform: none; }
@media (hover: hover) and (pointer: fine) {
  .emp-card-actions { opacity: 0; transform: translateY(6px); }
  .emp-card:hover .emp-card-actions,
  .emp-card:focus-within .emp-card-actions { opacity: 1; transform: none; }
}
```

**Rationale:** a regra atual esconde por padrão e só reexibe em `(hover: none) and (pointer: coarse)`. Isso cobre celular e tablet, mas **não** cobre notebook Windows com touchscreen e mouse conectado — que reporta `hover: hover, pointer: fine`. Numa intranet corporativa rodando em Windows 11, esse recorte de máquina não é caso de borda. Invertendo, o default é o estado acessível e a otimização visual fica no ramo comprovadamente capaz de hover.

`:focus-within` é o que faltava para teclado: hoje o usuário tabula para um `<a href="mailto:">` com `opacity: 0` — falha de SC 2.4.7.

### D3 — A linha de e-mail vira o próprio link

**Decisão:** `<a href="mailto:">` na linha de contato visível, eliminando o botão "E-mail" duplicado da barra de ações.

**Rationale:** o card mostrava o e-mail como texto e escondia um botão que fazia `mailto:` do mesmo e-mail — informação duplicada custando ~40px de altura por card. A barra de ações fica só com o contato telefônico (WhatsApp ou ramal), que é o que realmente não cabe como texto.

### D4 — Visão em lista como alternativa, não substituta

**Decisão:** segmented control grid/lista, preferência em `localStorage` sob `@Stitch:directoryView`. Grid continua o default.

**Rationale:** a tarefa dominante da tela é lookup ("qual o ramal do fulano?"), e para isso a lista é claramente superior — cabe ~5x mais gente na mesma altura. Mas o grid tem valor real para reconhecimento facial de quem é novo na empresa. Manter os dois com o grid como default preserva a expectativa de quem já usa a tela.

### D5 — Erro total e erro parcial são estados distintos

**Decisão:** dois caminhos de falha:

- `/api/colaboradores` falha → `ErrorState` de tela cheia com "Tentar novamente".
- Só as APIs de taxonomia (`/api/departamentos`, `/api/cargos`, `/api/departamentos-empresa`) falham → banner de aviso acima do grid; os colaboradores continuam listados, com departamento "N/D".

**Rationale:** hoje os dois casos são silenciosos. O segundo é mais insidioso que o primeiro: `resolverDepartamento` devolve `'N/D'` para todo mundo, os chips somem e todo card fica cinza — a tela parece funcionar e está mentindo. Tratar como erro de tela cheia seria exagero, porque o dado principal chegou.

## Risks / Trade-offs

- **Mudança de cor do TI de pêssego para azul** é perceptível para quem usa a tela todo dia. É o preço de sair de 1,69:1. Mitigação: o nome do departamento sempre acompanha a cor; a cor nunca é o único encoding.

- **Grid cai de 4 para 3 colunas** ao adotar `max-w-[1200px]`. Menos cards por tela no grid — compensado pela visão em lista e pelo fato de os cards ficarem largos o bastante para o e-mail não truncar (hoje `maxWidth: 180` corta com ~289px disponíveis).

- **A cópia local de `ChipButton` some.** Se o `ui/ChipButton` compartilhado mudar, três telas mudam junto. É o trade-off já aceito quando ele foi extraído.

- **`rgba(17, 28, 44, 0.85)` do tema cyber é translúcido**, então o contraste real depende do que estiver atrás. Os cálculos usaram `#111C2C` (o valor composto sobre fundo escuro), que é o pior caso plausível. Margem menor nesse tema é esperada.

- **As quatro specs vivas contradizem a change.** Se forem atualizadas fora de ordem, `openspec validate` reprova. Mitigação: atualizar spec e código na mesma change (Task 9).
