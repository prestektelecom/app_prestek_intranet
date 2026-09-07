# Exceções aceitas — críticas do Impeccable

Este arquivo é lido pelo `/impeccable critique` antes de cada rodada. Findings
que casarem com uma entrada abaixo são descartados silenciosamente, então cada
entrada precisa ser uma decisão consciente, com dono e motivo. Nunca registre
aqui um problema que "vai ser corrigido depois": isso é backlog, não exceção.

Formato de cada entrada:

```
## <alvo> — <finding em uma linha>
- Decidido por: <nome>
- Data: <AAAA-MM-DD>
- Motivo: <por que o produto aceita isso, em uma ou duas frases>
- Revisar em: <fase do programa ou evento que reabre a decisão>
```

Regras (spec `impeccable-quality-gate`):

1. Exceção sem motivo não vale. Exceção sem dono não vale.
2. Se a exceção contradiz o PRODUCT.md, o PRODUCT.md é atualizado junto.
3. Uma exceção cobre um finding em um alvo. Não use curingas.

---

## DESIGN.md — accent `#EC7D23` diverge do laranja institucional `#D97738` do manual
- Decidido por: Felix (ti@prestek.com.br)
- Data: 2026-09-07
- Motivo: `#EC7D23` foi extraído dos pixels do `Logo.webp`, que é renderizado cru
  na Sidebar e no MobileDrawer. Manter o accent igual ao asset visível pesa mais do
  que casar com o número do PDF. O azul institucional `#384C9C` nunca foi token e
  não é adotado.
- Revisar em: Fase 16 (encerramento), ou quando a Prestek fornecer o logo em SVG.
