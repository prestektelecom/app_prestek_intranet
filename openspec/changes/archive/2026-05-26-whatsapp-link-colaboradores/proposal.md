## Why

Atualmente, o link de telefone ("Ligar") no card de colaboradores (`Directory.jsx`) tenta realizar uma chamada telefônica direta via protocolo `tel:`. No entanto, no ambiente corporativo desktop e web, os usuários preferem iniciar uma conversa no WhatsApp diretamente pelo navegador para contatar o colaborador de forma ágil.

## What Changes

- **Redirecionamento para o WhatsApp**: O clique no botão de telefone agora redirecionará para o WhatsApp Web (`https://wa.me/55...`) no navegador, em vez de abrir o aplicativo de telefone nativo (`tel:`).
- **Formatação de Número**: O número de telefone celular (`colab.fone_celular`) será limpo (removendo caracteres especiais como parênteses, hifens e espaços) e receberá o DDI do Brasil (`55`) automaticamente caso não possua, garantindo o funcionamento do link do WhatsApp.
- **Ícone e Texto do Botão**: O texto do botão será alterado de "Ligar" para "WhatsApp", e utilizaremos o logotipo do WhatsApp (via SVG inline ou ícone equivalente) para melhorar a clareza visual da ação.
- **Fallback para Ramal**: Caso o colaborador não tenha celular cadastrado, mas possua ramal, o link ainda poderá efetuar a ligação de ramal via `tel:`, preservando o comportamento para ramais de mesa.

## Capabilities

### New Capabilities

<!-- Nenhuma nova capacidade introduzida -->

### Modified Capabilities

- `employee-card-v2`: O link de contato por telefone no card de colaborador passa a suportar o redirecionamento direto para o WhatsApp Web usando o número de celular formatado.

## Impact

- **Componentes afetados**: `Directory.jsx` (especificamente o componente `EmployeeCardV2`).
- **Dependências**: Nenhuma nova dependência será adicionada.
