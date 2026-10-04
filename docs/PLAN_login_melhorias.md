# Planejamento — Melhorias da Tela de Login (Neural Access)

**Escopo:** Melhorar a tela de login da intranet Prestek (`src/components/Login.jsx` + `src/index.css`).
**Prioridade:** Alto (tela de entrada de todos os colaboradores).
**Data base:** 2026-09-28.
**Referencia:** análise detalhada em sessão anterior — 14 melhorias identificadas.

---

## Fase 0 — Preparação

### O que precisa estar pronto antes de começar

- [ ] Playwright configurado para testar a tela de login (já está — `playwright.config.mjs` + `playwright-login.mjs`)
- [ ] Backend rodando em `localhost:3001` com credenciais válidas de teste
- [ ] Frontend rodando em `localhost:5000`
- [ ] Credential de teste documentada (marciofelix@prestek.com.br — ver `.env` protegido)

---

## Fase 1 — Melhorias de Baixo Esforço / Alto Impacto

### 1.1 Hierarquia do heading "Entrar Intranet"

**Arquivo:** `src/components/Login.jsx`
**Problema:** `<br />` entre "Entrar" e "Intranet" deixa "Intranet" isolado sem hierarquia.
**Solução:**

```jsx
// Atual (linha ~179)
<h1 className="neural-heading">Entrar<br />Intranet</h1>

// Novo
<h1 className="neural-heading">
  Entrar
  <span className="neural-heading-secondary">Intranet</span>
</h1>
```

**CSS adicionar:**
```css
.neural-heading-secondary {
  display: block;
  font-weight: 600;
  opacity: 0.65;
}
```

**Critério de aceitação:**
- [ ] "Entrar" é visualmente mais predominante que "Intranet"
- [ ] Ainda lê-se como "Entrar Intranet" como um todo

---

### 1.2 Logo Prestek maior

**Arquivo:** `src/components/Login.jsx`
**Problema:** SVG do logo tem `width="16" height="16"` — quase invisível.
**Solução:**

```jsx
// Atual (linha ~173-177)
<svg viewBox="0 0 120 120" width="16" height="16" fill="none" stroke="currentColor" strokeLinecap="round">

// Novo
<svg viewBox="0 0 120 120" width="28" height="28" fill="none" stroke="currentColor" strokeLinecap="round">
```

**Critério de aceitação:**
- [ ] Logo é visível como elemento de branding, não apenas detalhe

---

### 1.3 Placeholder mais neutro

**Arquivo:** `src/components/Login.jsx`
**Problema:** `placeholder="nome@prestek.com.br"` pode induzir o usuário a editar o texto em vez de digitar.
**Solução:**

```jsx
// Atual
placeholder="nome@prestek.com.br"

// Novo
placeholder="seu@prestek.com.br"
```

**Critério de aceitação:**
- [ ] Placeholder é genérico, não um exemplo específico

---

### 1.4 Hover do botão sem letter-spacing shift

**Arquivo:** `src/index.css`
**Problema:** `letter-spacing` muda de `0.15em` para `0.22em` no hover, causando movimento lateral do texto.
**Solução:**

```css
/* Atual (linha ~1054-1056) */
.neural-btn:not(:disabled):hover {
  letter-spacing: 0.22em;
}

/* Novo */
.neural-btn:not(:disabled):hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}
```

**Critério de aceitação:**
- [ ] Hover do botão não causa layout shift do texto
- [ ] Feedback visual ainda perceptível

---

### 1.5 Botão de tema mais visível

**Arquivo:** `src/index.css`
**Problema:** No tema claro, o botão tema tem fundo quase transparente e ícone em tom fraco.
**Solução:**

```css
/* Atual (linha ~1161-1162) */
background: color-mix(in srgb, var(--ink) 3%, transparent);
color: var(--n-text-dim);

/* Novo */
background: var(--n-line);  /* borda sutil visível */
color: var(--n-text);       /* ícone legível */
```

**Critério de aceitação:**
- [ ] Botão tema é fácil de encontrar em qualquer tema
- [ ] Contraste do ícone ≥ 3:1 sobre o fundo

---

## Fase 2 — Melhorias de Médio Esforço

### 2.1 Ícones nos campos email e senha

**Arquivo:** `src/components/Login.jsx`
**Problema:** Campos sem indicador visual de preenchimento.
**Solução:** Adicionar ícone de envelope no campo email e ícone de cadeado no campo senha, como referência visual fixa.

```jsx
// Campo email — adicionar ícone antes do input
<div className="neural-field">
  <label htmlFor="email">E-mail corporativo</label>
  <div className="neural-input-wrap">
    <svg className="neural-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
    <input ... />
  </div>
</div>
```

**CSS:**
```css
.neural-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.neural-input-icon {
  position: absolute;
  left: 0;
  width: 20px;
  height: 20px;
  color: var(--n-text-dim);
  pointer-events: none;
  transition: color 0.3s;
}

.neural-input-wrap:focus-within .neural-input-icon {
  color: var(--n-mercury);
}
```

**Critério de aceitação:**
- [ ] Campo email tem ícone de envelope visível
- [ ] Campo senha tem ícone de cadeado visível
- [ ] Ícone muda de cor no foco

---

### 2.2 Indicador de campo preenchido

**Arquivo:** `src/index.css`
**Problema:** Sem feedback visual de que o campo foi preenchido.
**Solução:**

```css
/* Campo com texto digitado — borda mais visível */
.neural-input:not(:placeholder-shown) {
  border-bottom-color: color-mix(in srgb, var(--n-text) 25%, transparent);
}

/* Campo focado + preenchido — glow activo */
.neural-input:focus:not(:placeholder-shown) ~ .neural-input-glow {
  transform: scaleX(1);
}
```

**Critério de aceitação:**
- [ ] Campo vazio tem borda sutil
- [ ] Campo com texto tem borda mais visível
- [ ] O glow já funciona no foco (comportamento atual mantido)

---

### 2.3 Checkbox "Manter conectado" — maior e mais claro

**Arquivo:** `src/components/Login.jsx` + `src/index.css`
**Problema:** Quadrado pequeno (18x18px), área de clique limitada.
**Solução:**

```jsx
// Atual
<span aria-hidden="true" className="neural-remember-box" style={{ background: ... }}>

// Novo — maior e com hover
<span
  aria-hidden="true"
  className="neural-remember-box"
  style={{ background: lembrar ? 'var(--n-mercury)' : 'transparent' }}
  onMouseEnter={() => {/* feedback visual */}}
  onMouseLeave={() => {/* voltar */}}
>
  {lembrar && (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6.5 5 9.5 10 3" stroke="var(--on-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )}
</span>
```

```css
.neural-remember-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1.5px solid var(--n-text);
  transition: background 0.2s, border-color 0.2s;
}
```

**Critério de aceitação:**
- [ ] Quadrado maior (20x20px)
- [ ] Borda mais visível em qualquer tema
- [ ] Checkmark visível quando seleccionado

---

### 2.4 Footer mais legível

**Arquivo:** `src/index.css`
**Problema:** `font-size: 10px` e cor fraca tornam o footer quase ilegível.
**Solução:**

```css
/* Atual (linha ~1143) */
font-size: 10px;

/* Novo */
font-size: 11px;
opacity: 0.75;
```

**Critério de aceitação:**
- [ ] Texto do footer legível sem esforço
- [ ] Ainda discreto o suficiente para não competir com o formulário

---

## Fase 3 — Melhorias de Acessibilidade

### 3.1 aria-label explícito no campo de senha

**Arquivo:** `src/components/Login.jsx`
**Problema:** O campo senha depende do `<label>` associado via `htmlFor`, mas leitores de tela podem não anunciar claramente.
**Solução:**

```jsx
<Field
  id="senha"
  name="password"
  label="Senha"
  type={mostrarSenha ? 'text' : 'password'}
  autoComplete="current-password"
  placeholder="••••••••"
  value={senha}
  onChange={(e) => setSenha(e.target.value)}
  disabled={carregando}
  invalid={erroCampo === 'senha'}
  describedBy="login-erro"
  inputRef={senhaRef}
  trailing={...}
/>
```

Verificar se o componente `Field` already passa `aria-label` ou se o `label` associado via `htmlFor` é suficiente. Se não, adicionar explicitamente.

**Critério de aceitação:**
- [ ] Leitor de tela anuncia "Senha" ao focar no campo
- [ ] Não há double-announcement (label + aria-label igual)

---

### 3.2 aria-busy mais explícito no botão "Tentar agora"

**Arquivo:** `src/components/Login.jsx`
**Problema:** O botão "Tentar agora" quando o servidor está fora tem estado de loading que pode não ser claro para leitores de tela.
**Solução:**

```jsx
<button
  type="button"
  className="neural-warning-btn"
  onClick={tentarAgora}
  disabled={verificandoBackend}
  aria-busy={verificandoBackend || undefined}
  aria-label={verificandoBackend
    ? 'Verificando conexão com o servidor...'
    : 'Tentar reconectar ao servidor'}
>
  {verificandoBackend ? 'Verificando...' : 'Tentar agora'}
</button>
```

**Critério de aceitação:**
- [ ] Leitor de tela anuncia o estado de loading
- [ ] O texto do botão já descreve o estado (mantido)

---

### 3.3 Placeholder com contraste adequado

**Arquivo:** `src/index.css`
**Problema:** Placeholder com `color-mix(in srgb, var(--ink) 35%, transparent)` pode ter contraste baixo no fundo claro.
**Solução:**

```css
/* Atual (linha ~981-982) */
.neural-input::placeholder {
  color: var(--n-placeholder);
}

/* Novo — contraste maior */
.neural-input::placeholder {
  color: color-mix(in srgb, var(--ink) 45%, transparent);
}
```

**Critério de aceitação:**
- [ ] Placeholder legível em qualquer tema
- [ ] Contraste ≥ 3:1 sobre o fundo (não obrigatório por WCAG, mas recomendado para placeholders)

---

## Fase 4 — Melhorias de Responsividade

### 4.1 Padding vertical responsivo

**Arquivo:** `src/index.css`
**Problema:** `padding: 40px 24px` fixo pode ser muito ou pouco dependendo da viewport height.
**Solução:**

```css
.neural-auth {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: min(440px, 92vw);
  padding: clamp(24px, 8vh, 40px) 20px;
}
```

**Critério de aceitação:**
- [ ] Em telas grandes, padding mantém 40px
- [ ] Em telas pequenas (< 480px height), padding reduz para ~24px
- [ ] Max-width respeita 92vw em telas estreitas

---

### 4.2 Blobs menos invasivos em telas muito pequenas

**Arquivo:** `src/index.css`
**Problema:** Blobs grandes (160-300px) com posicionamento percentual podem sobrepor o formulário em telas < 320px.
**Solução:**

```css
@media (max-width: 380px) {
  .neural-stage {
    opacity: 0.3;
  }
  .neural-blob {
    filter: blur(30px);
  }
}
```

**Critério de aceitação:**
- [ ] Em telas < 380px, blobs são mais sutis
- [ ] Formulário não tem 경쟁하는 elementos visuais

---

## Fase 5 — Testes E2E (Playwright)

### 5.1 Teste de screenshot visual da tela de login

**Arquivo:** `playwright-login.mjs` (atualizar)
**Descrição:** Verificar que a tela de login carrega com os elementos esperados após as melhorias.

```javascript
test('tela de login com melhorias', async ({ page }) => {
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });

  // Elementos essenciais
  await expect(page.locator('h1')).toContainText('Entrar');
  await expect(page.locator('input[name=username]')).toBeVisible();
  await expect(page.locator('input[name=password]')).toBeVisible();
  await expect(page.locator('button[type=submit]')).toBeVisible();
  await expect(page.locator('.neural-theme-toggle')).toBeVisible();

  // Screenshot para revisão visual
  await page.screenshot({ path: 'F:/tmp_prestek_login_v2.png', fullPage: true });
});
```

**Critério de aceitação:**
- [ ] Teste passa sem erros
- [ ] Screenshot mostra os elementos corretamente

---

### 5.2 Teste de login com credenciais válidas

**Arquivo:** `playwright-login.mjs` (já existe — atualizar)
**Descrição:** Confirmar que as melhorias não quebraram o fluxo de login.

```javascript
test('login após melhorias', async ({ page }) => {
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });

  await page.fill('input[name=username]', 'marciofelix@prestek.com.br');
  await page.fill('input[name=password]', 'GVM!cpr*kvj@pdj9epx');
  await page.click('button[type=submit]');

  await page.waitForURL('**/dashboard**', { timeout: 15000 });
  await expect(page.locator('text=Marcio')).toBeVisible();
});
```

**Critério de aceitação:**
- [ ] Login funciona após as melhorias
- [ ] Redirecionamento para dashboard ocorre
- [ ] Nome do usuário visível no dashboard

---

## Fase 6 — Revisão e Validação

### 6.1 Revisão visual em 3 temas

- [ ] Tema claro (Light)
- [ ] Dark (default dark)
- [ ] Dark-Aurora ou outro tema escuro

Para cada tema, verificar:
- [ ] Logo visível
- [ ] Heading com hierarquia
- [ ] Campos com ícones e borda adequada
- [ ] Botão tema acessível
- [ ] Footer legível
- [ ] Hover do botão sem layout shift

### 6.2 Revisão em tamanhos de tela

- [ ] Desktop (1920×1080)
- [ ] Tablet (768×1024)
- [ ] Mobile (375×667)
- [ ] Mobile pequeno (< 380px)

### 6.3 Checklist de acessibilidade

- [ ] Todos os campos têm label associado
- [ ] Foco visível em todos os elementos interativos
- [ ] Botões têm texto descritivo (não apenas ícone)
- [ ] Estado de loading é anunciado para leitores de tela
- [ ] Contraste do texto ≥ 4.5:1 em todos os temas

---

## Resumo das tarefas por fase

| Fase | Tarefas | Esforço estimado |
|------|---------|-----------------|
| 0 | Preparação | Já pronto |
| 1 | 5 melhorias simples | 1-2h |
| 2 | 4 melhorias médias | 2-3h |
| 3 | 3 melhorias de acessibilidade | 1h |
| 4 | 2 melhorias responsivas | 30min |
| 5 | Testes E2E | 1h |
| 6 | Revisão visual + acessibilidade | 1h |

**Total estimado:** 6-8h de trabalho.

---

## Pendências / Bloqueios

- [ ] Confirmar se o componente `Field` já suporta `aria-label` ou se precisamos modificá-lo
- [ ] Confirmar se há preferência do Felix sobre algum dos designs sugeridos (ex.: placeholder neutro vs. manter o exemplo)
- [ ] Verificar se os ícones de envelope/cadeado já existem como componentes reutilizáveis no projeto ou se precisamos criar

---

## Arquivos modificados

- `src/components/Login.jsx` — estrutura do heading, ícones nos campos, aria-label, placeholder
- `src/index.css` — CSS das melhorias (heading-secondary, neural-input-wrap, neural-input-icon, neural-remember-box, neural-auth padding, media queries)

## Arquivos de teste

- `playwright-login.mjs` — atualizar com testes das fases 5.1 e 5.2
- Screenshots: `F:/tmp_prestek_login_v2.png` (pós-melhorias)
