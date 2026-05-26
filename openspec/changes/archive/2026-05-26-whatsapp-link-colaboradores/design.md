## Context

Atualmente, o card de colaboradores (`EmployeeCardV2` no arquivo `Directory.jsx`) possui um botão de contato telefônico ("Ligar") que utiliza o esquema `tel:` para efetuar chamadas. No entanto, em computadores e navegadores desktop, essa ação gera uma tentativa de abrir aplicativos locais de telefone (como Skype ou Link de Celular), o que não é o ideal para o usuário. O objetivo é mudar este botão para iniciar uma conversa no WhatsApp Web caso o colaborador tenha celular, mantendo a ligação por ramal via `tel:` como fallback.

## Goals / Non-Goals

**Goals:**
- Alterar o comportamento do botão de telefone no card do colaborador para redirecionar para o WhatsApp Web (`https://wa.me/...`) se houver um celular cadastrado.
- Exibir dinamicamente o ícone do WhatsApp e o rótulo "WhatsApp" quando houver celular disponível.
- Garantir fallback para o ramal corporativo (exibindo o ícone clássico de telefone e o rótulo "Ligar") caso o colaborador possua apenas ramal cadastrado.
- Implementar uma função robusta de sanitização e formatação de números de telefone para garantir que links do WhatsApp sempre contenham o DDI correto (`55` para o Brasil) e apenas dígitos numéricos.
- Abrir o link do WhatsApp em uma nova aba (`target="_blank"` com `rel="noopener noreferrer"`).

**Non-Goals:**
- Criar novos campos de banco de dados ou alterar o esquema de dados de colaboradores.
- Modificar o fluxo de e-mail do card de colaborador.
- Alterar qualquer comportamento em outras abas da intranet.

## Decisions

### 1. Formatação de Link do WhatsApp
Utilizaremos o formato oficial e recomendado pelo WhatsApp: `https://wa.me/<number>`.
Para garantir que o link funcione, criaremos um helper local `getWhatsAppUrl(celular)` que executa os seguintes passos:
1. Remove caracteres não numéricos (parênteses, hifens, espaços).
2. Se o número resultante tiver 10 ou 11 dígitos (padrão de celular brasileiro com DDD mas sem DDI), prefixa com `55`.
3. Retorna `https://wa.me/55...`.

*Alternativa considerada:* Usar o endpoint `https://api.whatsapp.com/send?phone=...`. Optou-se por `wa.me` por ser uma URL mais curta, moderna e recomendada oficialmente.

### 2. Layout do Botão Dinâmico
O botão de telefone será renderizado dinamicamente com base nas propriedades disponíveis:
- **Se `celular` existir**: O botão mostrará o logotipo do WhatsApp (via SVG inline ou ícone compatível), o texto "WhatsApp", e o `href` apontará para a URL gerada pelo helper, abrindo em nova aba (`_blank`).
- **Se `celular` NÃO existir, mas `ramal` existir**: O botão continuará mostrando o ícone de telefone (`phone`), o texto "Ligar", e o `href` apontará para `tel:${ramal}` (comportamento local padrão).
- **Se nenhum existir**: O botão será desabilitado.

### 3. Logotipo do WhatsApp
Como o Google Material Symbols não possui um ícone do WhatsApp consistente nativamente, utilizaremos um SVG inline simples do logotipo do WhatsApp, garantindo aparência limpa e profissional que combina perfeitamente com a estética moderna implementada na aba de colaboradores.

## Risks / Trade-offs

- **[Risco] Números de telefone inválidos no banco de dados**: Caso o número cadastrado no banco esteja incompleto ou mal formatado de forma que não tenha nem DDD ou dígitos válidos, o redirecionamento pode falhar ou apontar para um número errado.
  - *Mitigação*: O helper `getWhatsAppUrl` fará uma verificação simples: se após limpar restarem menos que 10 dígitos, não geramos a URL e mantemos o botão desativado para evitar links quebrados.
