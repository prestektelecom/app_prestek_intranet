# Correção e Melhoria do Avatar no TeamAvailability

## Contexto

No widget **"Disponibilidade da Equipe"**, os avatares Lottie estão sendo exibidos cortados — o personagem é mostrado apenas parcialmente dentro do círculo, com cabeça e corpo truncados.

A causa raiz está em `LottieAvatar.jsx`: o atributo `viewBox` do SVG gerado pelo lottie-web está fixo em `'300 100 400 400'`, um recorte genérico que não se adapta à composição de cada animação, resultando em cortes para certos avatares.

---

## Causa Raiz Identificada

| Arquivo | Linha | Problema |
|---|---|---|
| `LottieAvatar.jsx` | L43 | `viewBox` hardcoded `'300 100 400 400'` — valor fixo inadequado para todos os avatares |
| `LottieAvatar.jsx` | L44 | `preserveAspectRatio: 'xMidYMid slice'` — força o corte ao invés de encaixar o personagem |
| `TeamAvailability.jsx` | L179 | Container com `flex -space-x-2` — sobreposição pode ocultar parte dos avatares |

---

## User Review Required

> [!IMPORTANT]
> **Decisão de design:** Após a correção do corte, o avatar deve:
> - **B) Fazer um crop inteligente no rosto/busto** (zoom no rosto, não no corpo inteiro)

> [!NOTE]
> A animação Lottie original de cada avatar tem dimensões próprias. O `viewBox` original do arquivo JSON (ex: `0 0 1000 1000`) precisa ser respeitado para exibir o personagem sem corte.

---

## Proposed Changes

### Componente LottieAvatar

#### [MODIFY] [LottieAvatar.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/common/LottieAvatar.jsx)

- **Remover o `viewBox` hardcoded** (`'300 100 400 400'`) que causa o corte
- **Ler o `viewBox` original** do SVG gerado pelo lottie-web logo após o `DOMLoaded`
- **Usar `xMidYMid meet`** (ou `contain`) para garantir que o personagem inteiro apareça dentro do círculo sem distorção
- Adicionar prop `crop` opcional (booleano, padrão `false`) para contextos que precisam do comportamento antigo de recorte

---

### Componente TeamAvailability

#### [MODIFY] [TeamAvailability.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/TeamAvailability.jsx)

- **Aumentar o `avatarClass`** de `h-12 w-12` para `h-14 w-14` para dar mais espaço ao personagem completo
- **Ajustar `ringClass`** de `ring-2` para `ring-2` (mantém, mas verificar cor no modo escuro)
- **Adicionar fundo nos avatares Lottie** — cor neutra (`bg-surface-raised`) para contrastar com o personagem
- Manter o `-space-x-2` mas garantir `overflow-hidden` no container do avatar para o clip circular funcionar corretamente

---

## Verification Plan

### Testes no Browser

1. Navegar até o Dashboard com ao menos 2 membros online
2. Verificar visualmente que os personagens aparecem **completos** (cabeça + corpo) dentro do círculo
3. Testar com diferentes avatares (vários índices `__lottie_idx:0` até `:9`)
4. Verificar o tooltip (hover sobre o avatar) — deve funcionar normalmente
5. Checar responsividade no modo escuro e claro

### Critérios de Aceite

- [ ] Nenhum personagem cortado/truncado no widget de disponibilidade
- [ ] Círculo do avatar mantém formato redondo com borda (`ring`)
- [ ] Animação Lottie continua funcionando (loop ativo)
- [ ] Tooltip de nome/setor/status continua aparecendo no hover
- [ ] Layout com avatares sobrepostos (`-space-x-2`) não oculta nenhuma parte visível

