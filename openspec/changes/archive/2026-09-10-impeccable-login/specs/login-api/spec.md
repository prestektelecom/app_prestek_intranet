## Purpose

Contrato da rota de autenticação do portal contra o IXC: um código de status por causa, mensagens fixas em português e nenhum detalhe interno na resposta.

## ADDED Requirements

### Requirement: Um código por causa
`POST /api/login` SHALL responder 401 com `{ sucesso: false, erro: "Usuário não encontrado." }` quando o e-mail não existe no IXC (independentemente de o total vir como número ou texto), 401 com "Senha incorreta." quando a senha não confere, 403 com "Usuário inativo." quando o cadastro não está ativo, 502 com "Falha ao comunicar com o sistema." quando o IXC não responde, e 400 quando faltam campos.

#### Scenario: E-mail inexistente com total em texto
- **WHEN** o IXC devolve `{ total: "0", registros: [] }` ou omite `registros`
- **THEN** a rota responde 401 "Usuário não encontrado." em vez de 500

#### Scenario: Senha incorreta
- **WHEN** o e-mail existe e o hash da senha não confere
- **THEN** a rota responde 401 "Senha incorreta."

### Requirement: Nenhum detalhe interno na resposta
Em qualquer erro inesperado, a rota SHALL responder 500 com a mensagem fixa "Não foi possível entrar agora. Tente de novo em instantes." e SHALL registrar o detalhe no log do servidor. A resposta SHALL NOT conter mensagens de exceção, stack traces ou nomes de propriedades.

#### Scenario: Exceção no processamento
- **WHEN** ocorre uma exceção ao processar a resposta do IXC
- **THEN** o cliente recebe só a mensagem fixa e o log do servidor tem o erro completo

### Requirement: Retry do cliente só em falha do servidor
O cliente SHALL tentar de novo apenas em respostas 5xx (até duas vezes), e SHALL NOT repetir a chamada em 400, 401 ou 403.

#### Scenario: Credencial errada
- **WHEN** a rota responde 401
- **THEN** o cliente exibe a mensagem imediatamente, sem novas tentativas
