## 1. Container Principal

- [x] 1.1 Container principal usa `style={{ backgroundColor: C.surface, border: '1px solid '+C.line }}`

## 2. Estado de Loading

- [x] 2.1 Spinner usa `style={{ borderColor: C.accentSoft, borderTopColor: C.accent }}`
- [x] 2.2 Texto de loading usa `style={{ color: C.ink2 }}`

## 3. Estado de Erro

- [x] 3.1 Ícone de erro usa `style={{ color: C.danger }}`
- [x] 3.2 Título de erro usa `style={{ color: C.ink }}`
- [x] 3.3 Texto da mensagem de erro usa `style={{ color: C.ink2 }}`
- [x] 3.4 Botão "Tentar Novamente" usa gradiente `linear-gradient(to right, C.accentDeep, C.accent)` com `boxShadow` via `tone(C.accent, 0.3)`

## 4. Estado Vazio

- [x] 4.1 Ícone vazio usa `style={{ color: C.muted }}`
- [x] 4.2 Título vazio usa `style={{ color: C.ink }}`
- [x] 4.3 Texto descritivo vazio usa `style={{ color: C.ink2 }}`

## 5. Células da Tabela

- [x] 5.1 Coluna `#ID` usa `style={{ color: C.accent }}`
- [x] 5.2 Coluna `Mensagem`/`Assunto` usa `style={{ color: C.ink2 }}`
- [x] 5.3 Coluna `Data` usa `style={{ color: C.ink2 }}`

## 6. Verificação

- [x] 6.1 Confirmado ao vivo (2026-09-13, Fase 8) no tema claro: sem regressão de aparência, dado real de produção (1000 tickets)
- [x] 6.2 Confirmado ao vivo em AMOLED e Default Dark: cores corretas, sem hex fixo remanescente (`grep` de `bg-white`/`text-[#`/`border-[#` no arquivo não encontra nenhuma ocorrência de cor, só um `bg-white/80` decorativo do hero, igual ao padrão das telas irmãs)
- [x] 6.3 `tone()` já está definido localmente no arquivo (linha 9), usado no botão de erro e no gradiente do hero

### Nota de reconciliação (2026-09-13, Fase 8)

Esta change estava com todas as 16 tarefas desmarcadas, mas `TicketsList.jsx` já implementa a adequação ao design system integralmente — mesma reescrita que já resolveu `tickets-pivot-para-os` (ver nota naquela change). Verificado e arquivado como concluído antes de iniciar a Fase 8 do programa Impeccable. Achado durante a verificação, fora do escopo desta change (candidato a P1 na crítica/audit da Fase 8): o filtro de status ativo ("Abertos" etc.) usa `color: isActive ? C.surface : C.ink2` sobre `background: C.accent` — `C.surface` coincide com `C.onAccent` em todos os 4 temas escuros (por isso passa: 6,1-7,06:1), mas diverge completamente no tema claro (branco vs. navy), medindo 2,79:1 — a exata violação que o DESIGN.md já documenta ("texto pequeno sobre laranja é onAccent, nunca branco").
