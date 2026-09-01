# Design System: Prestek Intranet Dashboard

**Projeto:** Prestek Intranet (Portal Interno PT-BR)

---

## 1. Visual Theme & Atmosphere

O design transmite uma atmosfera **Corporativa Acolhedora** — profissional e organizado, mas com calor humano. A paleta mistura tons quentes de bege e ambar com um laranja vibrante como cor de destaque, criando um ambiente que é altamente funcional sem ser frio ou impessoal. A densidade visual é **Balanceada**: espaçamento generoso sem desperdiçar espaço, ideal para dashboards de trabalho intensivo.

---

## 2. Color Palette & Roles

| Nome Descritivo | Hex | Papel Funcional |
|---|---|---|
| **Laranja Prestek** | `#EC7D23` | Cor primária: ações, destaques, links ativos, badges |
| **Azul Gelo** | `#F5F9FF` | Fundo principal da aplicação |
| **Branco Puro** | `#FFFFFF` | Fundo de cards, header e sidebar |
| **Azul Profundo** | `#0B1B2E` | Texto primário e títulos |
| **Azul Mesclado** | `#475467` | Texto secundário e labels |
| **Azul Claro** | `#8896A8` | Texto secundário mais claro |
| **Azul Gelo Elevado** | `#F7FAFD` | Superfícies elevadas (surface-raised) |
| **Borda Gelo** | `#E4ECF5` | Bordas de divisão e separadores |
| **Borda Sutil** | `#EFF4FA` | Bordas secundárias |

### Temas Dark

O projeto oferece 4 temas escuros completos com variáveis CSS:

| Tema | Background | Primária | Atmosfera |
|---|---|---|---|
| **Default Dark** | `#070B13` (azul escuro) | `#F97316` | Sóbrio, profissional |
| **Cyber-Obsidian** | `#070B13` (glassmorph) | `#EC7D23` | Néon, vídeo-game |
| **Deep-Space Aurora** | `#0F0C20` (roxo escuro) | `#FB923C` | Cósmico, vibrante |
| **AMOLED Pitch Black** | `#000000` (preto verdadeiro) | `#F97316` | Máximo contraste, economia de bateria |

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
