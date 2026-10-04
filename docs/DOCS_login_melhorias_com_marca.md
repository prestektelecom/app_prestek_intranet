# Documentação — Melhorias da Tela de Login (Neural Access)

**Versão:** 1.0  
**Data:** 2026-09-28  
**Escopo:** Melhorias de design, UX e acessibilidade na tela de login "Neural Access"  
**Restrição obrigatória:** Manual de Identidade Visual da Marca Prestek (PDF: `src/docs/Manual-da-Marca-Prestek-Telecom.pdf`)  
**Arquivos principais:** `src/components/Login.jsx`, `src/index.css` (classes `.neural-*`)

---

## 1. Visão Geral

### O que é a tela de login

Tela de acesso "Neural Access" — interface limpa e moderna com:
- Blobs decorativos (filtro SVG goo + blur)
- Formulário minimalista com underline e glow
- Toggle de tema claro/escuro
- Logo Prestek Telecom (atualmente 16x16px)

### Restrição de Marca — O que o manual diz

O **Manual de Identidade Visual da Marca Prestek** (12 páginas, criado em 2019, atualizado em 2025-01-16) contém regras OBIGATÓRIAS. Quaisquer melhorias de design no login **devem respeitar** estas regras.

---

## 2. Restrições de Marca — Hoje e Como Afetam as Melhorias

### 2.1 Cores Institucionais (Pág. 05 do manual)

| Cor | CMYK | RGB | HEX |
|-----|------|-----|-----|
| **Laranja Prestek** (principal) | 0 66 91 0 | 217 119 56 | #D97738 |
| **Azul Prestek** (secundária) | 95 82 0 0 | 56 76 156 | #384C9C |

**Regra do manual (pág. 10, item 6):**
> "Não utilizar cor diferente das institucionais."

**Impacto nas melhorias:**

| Melhoria | Impacto |
|----------|---------|
| Hover do botão com `brightness(1.05)` | ✅ Permitido — não muda cor, só ilumina |
| Hover do botão com `filter: brightness` | ✅ Permitido — mesma cor base |
| Ícone de campo mudando para laranja no focus | ✅ Permitido — laranja institucional |
| Botão tema com borda laranja | ✅ Permitido — laranja institucional |
| **Qualquer cor nova (verde, roxo, etc.)** | ❌ **PROIBIDO** |

**Atenção especial:** O login atual usa `--accent: #EC7D23` (laranja mais vibrante que o institucional #D97738). O manual diz "não utilizar cor diferente das institucionais". Sendo estrito: o sistema todo já usa um laranja fora do manual. Mas para **novas melhorias**, usar preferencialmente o laranja institucional `#D97738` quando for aplicar cor nova.

---

### 2.2 Logo e Símbolo (Pág. 02-03, 06-07)

**Composição da marca (pág. 03):**
- O **Símbolo** (P) concentra todo o conceito — pode ser usado sozinho
- O **Logotipo** (Prestek + Telecom) é a representação gráfica do nome — **não deve ser utilizado sem o símbolo**
- A versão 1 (símbolo + logotipo) é a principal e **deve ser utilizada sempre que possível**
- A versão 2 (símbolo apenas) deve ser usada em aplicações menores ou onde o propósito da marca já esteja claro

**Restrições (pág. 10):**
1. Não distorcer a marca
2. Não rotacionar a marca
3. **Não mudar a proporção dos elementos**
4. Não mudar a tipografia
5. Não utilizar o logotipo em fundo que dificulte a leitura
6. Não utilizar cor diferente das institucionais

**Impacto nas melhorias:**

| Melhoria | Impacto |
|----------|---------|
| **Aumentar logo de 16px para 28px** | ⚠️ **PRECISA AVALIAR** — aumentar tamanho não é "mudar proporção", mas precisa manter proporção original do SVG |
| Usar **só o "P"** (símbolo) sem "Prestek Telecom" | ✅ Permitido — versão 2 do manual |
| Usar **símbolo + logotipo completo** | ✅ Permitido — versão 1, principal |
| **Mantêm o logotipo atual** (P pequeno + texto) | ✅ Seguro — já está usando versão 1 |

**Recomendação:** O logo atual é um SVG custom (`viewBox="0 0 120 120"`, desenha um P estilizado). Não é o logo oficial do manual. Para ser estrito à marca:
- Opção A (minimalista): Usar só o **P/símbolo** como favicon + header (versão 2)
- Opção B (completa): Adicionar o logotipo do manual (Prestek + Telecom) ao lado do SVG
- Opção C (prática): Manter o SVG atual mas aumentar proporcionalmente — não viola "proporção" porque o SVG já tem proporção definida no viewBox

---

### 2.3 Tipografia (Pág. 10, item 4)

**Regra:** "Não mudar a tipografia"

**O que o manual provavelmente especifica:** O manual menciona "tipografia" como institucional mas não deixa claro qual é (o PDF não tem detalhes de fontes nos textos extraídos). O projeto atual usa:
- **Plus Jakarta Sans** — para corpo e interface (auto-hospedado)
- **JetBrains Mono** — para labels, monoespaçado (auto-hospedado)

**Impacto nas melhorias:**

| Melhoria | Impacto |
|----------|---------|
| Manter Plus Jakarta Sans | ✅ Seguro — já é o padrão do sistema |
| Manter JetBrains Mono para labels | ✅ Seguro — já é o padrão do sistema |
| Adicionar nova fonte | ⚠️ Avaliar se não conflita com "tipografia institucional" |
| Mudar fonte dos labels para outra | ❌ Proibido se mudar a tipografia institucional |

**Recomendação:** Não introduzir novas fontes. Manter Plus Jakarta Sans (texto) e JetBrains Mono (mono/labels) que já são usados no sistema todo.

---

### 2.4 Área de Proteção (Pág. 11)

**Regra:** Nenhum elemento gráfico ou informação deve ultrapassar o espaço delimitado pela linha pontilhada. O módulo X equivale à altura da letra "i" menor.

**Impacto nas melhorias:**
- **Logo:** Precisa ter "área de proteção" ao redor — outros elementos não podem invadir esse espaço
- **Botões/inputs próximo ao logo:** Devem respeitar a área de proteção

**Aplicação prática no login:**
- O logo fica no topo (header branco/transparente)
- O formulário está centralizado abaixo
- Se o logo for aumentado, a área de proteção aumenta proporcionalmente

---

### 2.5 Versões Negativas (Pág. 09)

O manual prevê versões negativas (invertidas) para aplicações onde existam limitações de cores. Cada versão deve ser aplicada **procurando contraste entre a marca e o fundo**, valorizando a legibilidade.

**Impacto no login:**

| Tema | Logo deve ser | Fundo do logo |
|------|---------------|---------------|
| Claro (light) | Versão positiva (laranja/azul sobre branco) | Branco/transparente |
| Escuro (dark) | Versão negativa (branco sobre preto/escuro) | Escuro/transparente |

O login atual já trata disso com CSS variables que mudam por tema — **já está correto**.

---

## 3. Melhorias Aprovadas vs. Restritas pelo Manual

### 3.1 Melhorias que o manual PERMITE (ou não restringe)

| # | Melhoria | Status | Observação |
|---|----------|--------|------------|
| 1 | Heading com hierarquia (Entrar > Intranet) | ✅ LIBRE | Mudança de tipografia? Não — mesma fonte, só peso/opacity |
| 2 | Placeholder neutro (`seu@prestek.com.br`) | ✅ LIBRE | Texto, não afeta marca |
| 3 | Hover do botão sem letter-spacing shift | ✅ LIBRE | Comportamento, não marca |
| 4 | Botão de tema mais visível | ✅ LIBRE | Usa laranja institucional — compatível |
| 5 | Ícones nos campos email/senha | ✅ LIBRE | Ícones genéricos (envelope, cadeado), não marcas |
| 6 | Indicador de campo preenchido | ✅ LIBRE | Comportamento, não marca |
| 7 | Checkbox maior e mais claro | ✅ LIBRE | Comportamento, não marca |
| 8 | Footer mais legível | ✅ LIBRE | Tipografia existente, só tamanho/contrastes |
| 9 | Padding responsivo (clamp) | ✅ LIBRE | Layout, não marca |
| 10 | Blobs menos invasivos em telas < 380px | ✅ LIBRE | Decorativo, não marca |
| 11 | aria-label no campo senha | ✅ LIBRE | Acessibilidade, não marca |
| 12 | aria-busy mais explícito | ✅ LIBRE | Acessibilidade, não marca |
| 13 | Placeholder com contraste maior | ✅ LIBRE | Cor já usa variáveis existentes |

### 3.2 Melhorias que o manual RESTRINGE ou EXIGE advertência

| # | Melhoria | Status | Observação |
|---|----------|--------|------------|
| 1 | **Logo maior (16px → 28px)** | ⚠️ AVALIAR | Aumentar tamanho ≠ mudar proporção, mas precisa manter o SVG original intacto. Verificar se o SVG atual é "versão 1" (símbolo + logotipo) ou "versão 2" (símbolo só) |
| 2 | **Ícone de envelope/cadeado nos campos** | ⚠️ AVALIAR | Ícones genéricos não são marca, mas se forem desenhados custom — verificar se não se parecem com os elementos da marca |
| 3 | **Banner hero no login** | ❌ PROIBIDO? | O login atual é limpo, sem banner. Se for adicionado (ex: banner com gradiente), precisa usar cores institucionais e não distorcer a marca |
| 4 | **Mudança da paleta de blobs** | ⚠️ AVALIAR | Blobs são decorativos, não marca. Mas se usarem cores não institucionais, pode violar "não usar cor diferente das institucionais" |

### 3.3 Melhorias que o manual PROÍBE explicitamente

| # | Melhoria solicitada | Status | Motivo |
|---|---------------------|--------|--------|
| — | **Distorcer a marca** | ❌ PROIBIDO | Item 1 da pág. 10 |
| — | **Rotacionar a marca** | ❌ PROIBIDO | Item 2 da pág. 10 |
| — | **Mudar proporção dos elementos da marca** | ❌ PROIBIDO | Item 3 da pág. 10 |
| — | **Mudar a tipografia da marca** | ❌ PROIBIDO | Item 4 da pág. 10 |
| — | **Logo em fundo que dificulte leitura** | ❌ PROIBIDO | Item 5 da pág. 10 |
| — | **Usar cor não institucional para a marca** | ❌ PROIBIDO | Item 6 da pág. 10 |
| — | **Usar logotipo sem símbolo** | ❌ PROIBIDO | Pág. 06: "não deve ser utilizado sem o símbolo" |

---

## 4. Plano de Implementação com Restrições de Marca

### Fase 0 — Antes de começar

**Obrigatório:**
- [ ] Confirmar com Felix: o SVG atual (P 16x16px) é a versão 1 (símbolo + logotipo) ou versão 2 (símbolo só) do manual?
- [ ] Se for versão 1: ok aumentar para 28px mantendo proporção
- [ ] Se for versão 2: avaliar se precisa adicionar o logotipo completo (Prestek + Telecom) ao redor
- [ ] Confirmar se o logo atual é um SVG custom ou o logo oficial do manual (pode ser que eu não tenha acesso ao logo oficial)

### Fase 1 — Melhorias sem impacto na marca (LIBRES)

**Sem restrições do manual — implementar diretamente:**

1. **Heading hierárquico** — mesma fonte, só mudar peso e opacity
2. **Placeholder neutro** — texto puro
3. **Hover do botão sem letter-spacing** — comportamento
4. **Botão tema mais visível** — usar laranja institucional `#D97738` se for aplicar cor
5. **aria-label no campo senha** — acessibilidade
6. **aria-busy mais explícito** — acessibilidade
7. **Placeholder com contraste** — usar `--ink` existente

**Esforço:** ~2h

### Fase 2 — Melhorias com impacto leve na marca (AVALIAR)

**Precisam de confirmação de Felix ou avaliação cuidadosa:**

1. **Logo maior (16px → 28px)**
   - Se o SVG atual é o logo oficial: aumentar proporcionalmente (mantendo viewBox) = OK
   - Se o SVG atual é custom: pode não ser "a marca" — avaliar se aumentar ou manter
   - **A área de proteção ao redor do logo** precisa ser respeitada

2. **Ícones nos campos (envelope, cadeado)**
   - Use ícones Material Symbols (já usados no sistema) ou SVG inline simples
   - Não desenhar ícones custom que pareçam elementos da marca
   - Manter a paleta: laranja institucional para ícone ativo, cinza para inativo

3. **Indicaor de campo preenchido**
   - Usar `color-mix` com `--ink` (já existente) — não introduzir nova cor

**Esforço:** ~2h

### Fase 3 — Melhorias restritas (NÃO fazer sem aprovação)

**Não implementar sem aprovação explícita do Felix + revisão com o manual:**

1. **Banner hero/gradiente no login** — já existe no sistema (Configuracoes.jsx usa gradiente laranja). Mas no login atual é limpo. Se for adicionado:
   - Usar laranja institucional `#D97738` como cor primária do gradiente
   - Não adicionar elementos gráficos que compitam com a marca

2. **Mudar a paleta dos blobs** — os blobs atuais usam `var(--n-mercury)` (que aponta para `--accent`). Se `--accent` é `#EC7D23` (fora do manual), os blobs já estão com cor não institucional. Para ser estrito: alinhar `--accent` para `#D97738` em tudo o sistema.

3. **Qualquer mudança no logo** — se for substituir o SVG atual por um novo (ex: usar o logo do manual), precisa:
   - Usar o arquivo oficial do manual (se disponível)
   - Não distorcer/rotacionar/mudar proporção
   - Manter área de proteção
   - Versão correta para o tema (positiva no claro, negativa no escuro)

---

## 5. Checklist de Conformidade com a Marca

Antes de implementar qualquer melhoria de design no login, verificar:

### Checklist de Logo
- [ ] O SVG usado é o logo oficial (ou símbolo) da marca Prestek?
- [ ] Se for versão 1 (símbolo + logotipo): está completo e correto?
- [ ] Se for versão 2 (símbolo só): está sendo usado em contexto onde a marca já está claro?
- [ ] O logo não está distorcido (proporção mantida)?
- [ ] O logo não está rotacionado?
- [ ] A área de proteção ao redor do logo está respeitada?
- [ ] O logo tem contraste suficiente com o fundo (versão correta para o tema)?

### Checklist de Cores
- [ ] As cores usadas são as institucionais? (#D97738 laranja, #384C9C azul)
- [ ] Se uma nova cor for introduzida: ela é apenas decorativa (blobs/inputs) ou afeta a marca?
- [ ] O laranja usado no botão e ícones é o institucional ou o `#EC7D23` que o sistema já usa?
- [ ] A mudança de cor não conflita com "não usar cor diferente das institucionais"?

### Checklist de Tipografia
- [ ] A fonte usada é a institucional ou está alinhada com a tipografia do sistema?
- [ ] Não está sendo introduzida nova fonte sem necessidade?
- [ ] O tamanho do texto do logo não foi alterado (proporção mantida)?

### Checklist de Layout
- [ ] O elemento da marca (logo) tem sua área de proteção respeitada?
- [ ] Não há elementos gráficos invadindo o espaço de proteção do logo?
- [ ] O logo não está em fundo que dificulte a leitura?

---

## 6. Documentação dos Arquivos Afetados

### `src/components/Login.jsx`

| Linha | O que muda | Restrição |
|-------|------------|-----------|
| ~173-177 | SVG do logo — tamanho e conteúdo | Restrito: não mudar proporção |
| ~179 | Heading "Entrar / Intranet" | Livre: mesmo tipografia, só peso/opacity |
| ~211 | Placeholder email | Livre: texto neutro |
| ~225 | Placeholder senha | Livre: texto neutro |

### `src/index.css`

| Seção | O que muda | Restrição |
|-------|------------|-----------|
| `.neural-heading` (linha ~943) | Adicionar `.neural-heading-secondary` | Livre: mesma fonte |
| `.neural-input` + ícones | Adicionar `.neural-input-wrap` e ícones | Restrito: ícones não podem ser confusos com marca |
| `.neural-btn:hover` (linha ~1054) | Remover `letter-spacing`, usar `filter: brightness` | Livre |
| `.neural-theme-toggle` (linha ~1152) | Mais visível | Livre: usar cor institucional |
| `.neural-blob` (linha ~910) | Paleta dos blobs | Avaliar: se `--accent` for alterado para institucional |
| Logo SVG | Tamanho/nada | Restrito: proporção, área de proteção |

---

## 7. Recomendações Finais

### Sobre o logo atual (P 16x16px)
O manual é claro: **versão 1 (símbolo + logotipo) é a principal e deve ser utilizada sempre que possível**. Se o SVG atual é só o "P" (símbolo), ele é a versão 2 — ok para uso reduzido, mas para o login (que é a primeira impressão da marca) talvez valha a pena usar a versão completa.

### Sobre as cores
O manual especifica:
- Laranja: **#D97738** (RGB 217 119 56)
- Azul: **#384C9C** (RGB 56 76 156)

O sistema atual usa:
- `--accent: #EC7D23` (laranja mais vibrante que o institucional)

**Questão para Felix:** O sistema já está com uma cor que não é exatamente a institucional. Para as melhorias do login:
- **Opção A (estrito):** Alinhar tudo para `#D97738`
- **Opção B (pragmático):** Manter o `#EC7D23` já usado no sistema, desde que não afete a marca diretamente (logo precisa estar correto)
- **Opção C (híbrido):** Usar `#D97738` para elementos que envolvem a marca (logo, ícones da marca) e manter `#EC7D23` para elementos de UI puros (bots, blobs)

### Sobre a tipografia
Como o PDF não detalha a fonte institucional (só menciona "tipografia" de forma genérica), e o sistema já usa Plus Jakarta Sans + JetBrains Mono, a recomendação é **não introduzir novas fontes**. Manter o que já existe.

---

## 8. Referências

- **Manual de Identidade Visual da Marca Prestek** (pdf): `src/docs/Manual-da-Marca-Prestek-Telecom.pdf`
  - Pág. 01: Capa
  - Pág. 02: Objetivo do manual
  - Pág. 03: Sumário
  - Pág. 04: Conceito
  - Pág. 06: Composição da marca (símbolo + logotipo)
  - Pág. 07: Versões da marca
  - Pág. 08: Padrão cromático (CMYK, RGB, HEX)
  - Pág. 09: Versões negativas
  - Pág. 10: **Restrições de uso (1-6)**
  - Pág. 11: Área de segurança
  - Pág. 12: Contato (design.cor)

- **Planejamento de melhorias do login** (complementar): `docs/PLAN_login_melhorias.md`
- **Projeto atual:** `src/components/Login.jsx`, `src/index.css` (classes `.neural-*`)
