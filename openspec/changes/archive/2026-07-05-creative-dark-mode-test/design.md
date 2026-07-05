## Context

Permitir que o usuário alterne dinamicamente entre 3 variações do tema escuro. O estado será persistido localmente e as classes correspondentes serão injetadas no elemento `<html>`.

## Decisions

### 1. Extensão de Classes no HTML
Quando o modo escuro for ativado (`dark`), injetaremos adicionalmente uma classe identificadora da variante:
- `.dark-cyber` (Cyber-Obsidian)
- `.dark-aurora` (Deep-Space Aurora)
- `.dark-amoled` (Minimalist Pitch Black)

Exemplo: `<html class="dark dark-cyber">`

### 2. Definição das Paletas de Cores

#### V1: Cyber-Obsidian (Glassmorphic Neo-Blue)
Interface translúcida e de alta tecnologia.
- `--background`: `#070B13` (Preto azulado profundo)
- `--card`/`--surface`: `rgba(14, 23, 38, 0.85)` (com backdrop-filter)
- `--border`: `#1E293B`
- `--primary`: `#00F2FE` (Azul elétrico néon)
- `--success`: `#00F5D4` (Turquesa néon)
- `--warning`: `#FFB800` (Ouro)
- `--danger`: `#FF2A54` (Rosa néon)

#### V2: Deep-Space Aurora (Índigo Cósmico)
Interface mágica com gradientes cósmicos e sombras coloridas.
- `--background`: `#0F0C20` (Índigo profundo)
- `--card`/`--surface`: `#161233`
- `--border`: `#2E2254`
- `--primary`: `#8A2BE2` (Roxo néon)
- `--success`: `#00FF87` (Verde aurora)
- `--warning`: `#FF6B00` (Laranja solar)
- `--danger`: `#FF007A` (Supernova magenta)

#### V3: Minimalist Pitch Black (AMOLED Contrast)
Interface minimalista focada no contraste extremo e pixels pretos.
- `--background`: `#000000` (Preto puro)
- `--card`/`--surface`: `#0F0F0F`
- `--border`: `#1A1A1A`
- `--primary`: `#4A9EF5` (Azul Prestek original de alto contraste)
- `--success`: `#00C853` (Verde vibrante)
- `--warning`: `#FFD600` (Amarelo vibrante)
- `--danger`: `#D50000` (Vermelho vibrante)

### 3. Componente de Seleção de Variante
Em [Configuracoes.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Configuracoes.jsx), se a aparência selecionada for "Escuro", exibiremos um controle de seleção chamado **Estilo do Tema Escuro** contendo botões ou previews das 3 variações.
Ao mudar, atualizaremos a classe no HTML e as cores reativas do JS.
