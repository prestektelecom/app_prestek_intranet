## 1. Ajuste de Layout e Estilos

- [x] 1.1 Alterar o `maxWidth` de `280` para `380` no container do protocolo em `src/components/TiSupportModal.jsx`.
- [x] 1.2 Alterar o `fontSize` de `24` para `19` e adicionar `wordBreak: 'break-all'` no elemento de exibição do número do protocolo.

## 2. Validação Visual

- [x] 2.1 Verificado (2026-09-13, ao vivo, Fase 8): reprodução isolada com um protocolo sintético de 40 dígitos dentro do container real (`max-width: 380px`, `word-break: break-all`) — `scrollWidth` (338px) fica dentro do container (380px), sem overflow horizontal. Não foi submetido um chamado real de teste para não criar um ticket real no IXC.
