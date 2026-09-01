# Plano de Migração: Z-Index Convention

**Convenção:** DESIGN.md §6 / index.css (comentário Z-INDEX)
**Inventário:** 36 usos, 18 valores únicos, 12 arquivos
**Esforço estimado:** ~30 min (4 mudanças obrigatórias + 3 opcionais)

---

## Diagnóstico

**Boa notícia:** 32/36 usos (89%) já seguem a convenção. Os valores `1000`, `1100`, `9999` estão perfeitamente consistentes.

**Mudanças obrigatórias** (4 usos que fogem da escala):

| Atual | Convenção | Arquivo | Linha | Contexto |
|---|---|---|---|---|
| `z-[2]` | `z-[10]` | `OrgChart.jsx` | 77 | Card de funcionário no organograma |
| `zIndex: 30` | `zIndex: 20` | `Configuracoes.jsx` | 397 | Toast de salvando |
| `z-[60]` | `z-[20]` | `Schedule.jsx` | 734 | Overlay de loading |
| `zIndex: 99` | `zIndex: 20` | `Configuracoes.jsx` | 528 | Toast de sucesso |

**Mudanças opcionais** (3 usos com comportamento potencialmente incorreto):

| Atual | Convenção | Arquivo | Linha | Risco |
|---|---|---|---|---|
| `zIndex: 100` + `fixed inset:0` | `z-[1100]` | `OrgChartEditor.jsx` | 120 | Modal de edição do organograma — parece ser um modal que deveria estar acima do chrome (z=1000), mas está em z=100. **Pode estar quebrado hoje** (atrás do header). |
| `zIndex: 100` + `fixed` | `z-[1100]` | `Comunicados.jsx` | 853 | Modal de comunicado — mesmo problema. |
| `zIndex: 110` + `fixed` | `z-[1100]` | `Comunicados.jsx` | 1121 | Toast de ação — também abaixo do chrome. |

---

## Passo a Passo da Migração

### Passo 1: Criar branch

```bash
git checkout -b chore/z-index-migration
```

### Passo 2: Definir constantes (opção recomendada)

Criar `src/constants/zIndex.js`:

```js
/**
 * Camadas de z-index do Prestek Intranet.
 * Mantenha sincronizado com DESIGN.md §6.
 */
export const Z = {
  BASE:      0,
  ELEVATED:  10,    // badges, chips sobre cards
  FLOATING:  20,    // tooltips, dropdowns, toasts leves
  STICKY:    100,   // headers/abas sticky internos
  MAP:       500,   // overlays de mapa (acima do conteúdo, abaixo do chrome)
  CHROME:    1000,  // header, sidebar, bottom-nav
  CHROME_PLUS: 1001, // elementos que sobem sobre o chrome
  TOOLBAR:   1050,  // toolbars flutuantes (DirectoryToolbar)
  MODAL:     1100,  // drawers, modais, overlays
  MODAL_PLUS: 1110, // modais sobre modais
  MODAL_TOP: 1120,  // toasts sobre modais
  TOAST:     9999,  // alertas críticos (acima de tudo)
};
```

### Passo 3: Substituir valores (4 mudanças obrigatórias)

**OrgChart.jsx:77**
```diff
-<div className="relative z-[2] ...">
+<div className="relative z-[10] ...">
```

**Configuracoes.jsx:397**
```diff
-<div style={{ ..., zIndex: 30 }}>
+<div style={{ ..., zIndex: 20 }}>
```

**Schedule.jsx:734**
```diff
-<div className="fixed inset-0 z-[60] ...">
+<div className="fixed inset-0 z-[20] ...">
```

**Configuracoes.jsx:528**
```diff
-<div style={{ ..., zIndex: 99 }}>
+<div style={{ ..., zIndex: 20 }}>
```

### Passo 4: Verificar modais suspeitos (opcional, requer validação visual)

**OrgChartEditor.jsx:120**
```diff
-<div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
+<div style={{ position: 'fixed', inset: 0, zIndex: 1100 }}>
```
⚠️ **Risco:** Se este modal for usado dentro do header, pode subir sobre ele. Verificar visualmente.

**Comunicados.jsx:853**
```diff
-zIndex: 100,
+zIndex: 1100,
```
⚠️ **Risco:** Mesmo — se for um modal que deve ficar sobre o chrome.

### Passo 5: Build + verificação

```bash
npm run build
# Verificar se não há erros de compilação
# Navegar visualmente: abrir modais, toasts, sidebar, header
# Verificar se nenhum overlay ficou atrás de outro
```

### Passo 6: Push

```bash
git add -A
git commit -m "chore(z-index): migrate to documented convention layer scale

- 4 values changed to align with DESIGN.md §6:
  z-[2] → z-[10] (OrgChart)
  zIndex: 30 → zIndex: 20 (Configuracoes)
  z-[60] → z-[20] (Schedule)
  zIndex: 99 → zIndex: 20 (Configuracoes)
- Created src/constants/zIndex.js with named constants
- 32/36 usages already conformed (1000/1100/9999 consistent)
- 3 suspicious modals at z=100 flagged for visual review
"
git push origin chore/z-index-migration
```

---

## Verificação de Regressão

Após a migração, testar estas telas:

| Tela | O que verificar |
|---|---|
| Dashboard | Widgets, modais, notificações |
| Comunicados | Modal de criação, toast de ação |
| Organograma | Card de funcionário (z=2→10), modal de edição |
| Configurações | Toast de "salvando" (z=30→20), toast de sucesso (z=99→20) |
| Escala (Schedule) | Overlay de loading (z=60→20), toast de ação (z=9999) |
| Diretório | Toolbar flutuante (z=1050) |
| Serviços | Comparador de planos (z=999), modal de detalhes (z=1100) |
| Mapa Cobertura | Legenda (z=500) |
| Mobile | Drawer (z=1100), MoreSheet (z=1001), BottomNav (z=1000) |
| TI | Cadastro de colaborador (z=1120) |

---

## Resumo

| Tipo | Quantidade | Arquivos |
|---|---|---|
| ✅ Mantidos (já na convenção) | 32 | 12 |
| 🔄 Mudança obrigatória | 4 | 4 |
| ⚠️ Suspeitos (revisão visual) | 3 | 3 |
| **Total** | **36** | **12** |