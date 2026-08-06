## Why

Ao abrir um chamado de suporte de TI pelo modal `TiSupportModal`, se o IXC Soft retornar um número de protocolo longo (como um número de 20 dígitos contínuos), ele estoura horizontalmente a caixa do container devido à largura limitada de 280px e ao tamanho da fonte de 24px com JetBrains Mono. Essa quebra visual compromete a experiência e a legibilidade do protocolo para o usuário.

## What Changes

- Ajuste no container do protocolo no modal de Suporte de TI para permitir uma largura máxima maior (`maxWidth: 380`).
- Redução do tamanho da fonte do número do protocolo de `24px` para `19px`.
- Adição da propriedade CSS `wordBreak: 'break-all'` no elemento de texto do número para garantir que números excessivamente longos quebrem linha em vez de transbordar a caixa.

## Capabilities

### New Capabilities
<!-- Nenhuma nova funcionalidade é introduzida, apenas um ajuste visual/UI -->

### Modified Capabilities
<!-- Não há mudanças nos requisitos da especificação, apenas ajuste de layout visual -->

## Impact

- Afeta o componente visual [TiSupportModal.jsx](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/components/TiSupportModal.jsx) em sua tela de sucesso.
- Sem impactos em APIs externas, banco de dados ou dependências.
