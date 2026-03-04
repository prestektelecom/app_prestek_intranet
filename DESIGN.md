# Design System: Prestek Intranet Dashboard

**Projeto:** Prestek Intranet (Portal Interno PT-BR)

---

## 1. Visual Theme & Atmosphere

O design transmite uma atmosfera **Corporativa Acolhedora** — profissional e organizado, mas com calor humano. A paleta mistura tons quentes de bege e ambar com um laranja vibrante como cor de destaque, criando um ambiente que é altamente funcional sem ser frio ou impessoal. A densidade visual é **Balanceada**: espaçamento generoso sem desperdiçar espaço, ideal para dashboards de trabalho intensivo.

---

## 2. Color Palette & Roles

| Nome Descritivo | Hex | Papel Funcional |
|---|---|---|
| **Laranja Âmbar Intenso** | `#ff8c00` | Cor primária: ações, destaques, links ativos, badges |
| **Creme Morno** | `#f8f7f5` | Fundo principal da aplicação |
| **Marrom Noturno** | `#231a0f` | Fundo escuro (modo dark) |
| **Marrom Tinta** | `#1d150c` | Texto primário e títulos |
| **Marrom Mesclado** | `#635c55` | Texto secundário e labels |
| **Ambar Claro** | `#a17745` | Ícones de busca e placeholders |
| **Bege Suave** | `#f4eee6` | Fundos de hover, inputs, chips de data |
| **Creme Borda** | `#eaddcd` | Bordas de divisão e separadores |
| **Branco Puro** | `#ffffff` | Fundo de cards, header e sidebar |

---

## 3. Typography Rules

- **Família:** Manrope (Inter-inspired, geométrica humanista) — aplicada globalmente via `font-display`
- **Títulos principais (H1):** Extra Bold (800), 3xl, tracking tight — ex: "Bem-vindo de volta, Alex!"
- **Subtítulos (H2):** Bold (700), xl — ex: "Comunicados Urgentes"
- **Labels e rótulos:** Medium (500), xs/sm — ex: "Meu Setor", "MENU"
- **Corpo:** Regular (400), sm — ex: resumos de comunicados
- **Badges e valores destacados:** Bold (700), xs em uppercase com letter-spacing extra/wide

---

## 4. Component Stylings

- **Botões primários:** Preenchimento laranja âmbar (`bg-primary`), texto branco, bordas levemente arredondadas (0.5rem). Hover: escurece ligeiramente.
- **Botões secundários/outline:** Borda `primary/20`, texto laranja, fundo branco. Hover: inverte para fundo laranja com texto branco — transição suave.
- **Cards/Containers:** Bordas suavemente arredondadas (`rounded-lg` = 0.5rem), fundo branco, sombra whisper-soft (`shadow-sm`), borda bege (`border-[#eaddcd]`). No hover: a sombra aumenta para `shadow-md` — transição fluida.
- **Item ativo da Sidebar:** Fundo laranja 10% de opacidade (`bg-primary/10`), texto laranja, sem borda. Items inativos em cinza médio com hover para bege claro.
- **Badges/Chips numéricos:** Pill-shaped (`rounded-full`), fundo laranja, texto branco, tamanho 10px bold. Usados em contadores de notificação e seção Sistema.
- **Inputs/Campos de busca:** Fundo bege (`#f4eee6`), sem borda visível, ícone integrado à esquerda. Ao focar: ring laranja translúcido (`ring-primary/50`).
- **Avatar/Foto de perfil:** Circular (`rounded-full`), borda 2px transparente. No hover do grupo pai: borda laranja âmbar com transição suave.

---

## 5. Layout Principles

- **Estrutura:** Header fixo (h-16) + layout de duas colunas abaixo (Sidebar fixa 256px + Main scrollável)
- **Sidebar:** Oculta em telas menores que `lg` (1024px) — responsivo por breakpoint
- **Grid principal:** 1 coluna em mobile → 3 colunas em md+ para cards de stats; 1 coluna em mobile → lg:3 colunas para comunicados/atalhos (2:1 ratio)
- **Espaçamento interno:** Padding generoso nos cards (`p-6`), gaps de 8px (gap-2) a 32px (gap-8) entre elementos
- **Whitespace strategy:** **"Breathing Room"** — cada card tem espaço interno suficiente para que os dados respirem; nada parece comprimido
- **Widget de Suporte (sidebar):** Isolado ao fundo com gradiente sutil `from-primary/10 to-primary/5`, criando uma zona visualmente "quente" e chamativa sem agressividade
