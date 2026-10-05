## ADDED Requirements

### Requirement: Envio de sugestão
Qualquer usuário autenticado SHALL poder enviar uma sugestão com tipo (`melhoria`, `ideia` ou `problema`), título (3 a 120 caracteres) e descrição (10 a 2000 caracteres). A autoria SHALL vir do token validado (`req.usuario`), nunca do corpo da requisição. A sugestão SHALL nascer com status `nova`.

#### Scenario: Envio válido
- **WHEN** o usuário envia tipo, título e descrição dentro dos limites
- **THEN** o sistema SHALL gravar a sugestão com status `nova` e a autoria do token e confirmar o envio na tela

#### Scenario: Campos inválidos
- **WHEN** o título ou a descrição estão fora dos limites, ou o tipo não está na lista
- **THEN** o sistema SHALL recusar com erro de validação e a tela SHALL indicar o campo

#### Scenario: Excesso de envios
- **WHEN** o usuário já enviou 5 sugestões nas últimas 24 horas
- **THEN** o sistema SHALL recusar o novo envio com mensagem clara

### Requirement: Aviso por e-mail à TI
Ao gravar uma sugestão, o sistema SHALL enviar um e-mail com tipo, autor, título e descrição para `ti@prestek.com.br` e `felixskmarcio2@gmail.com` (sobrescrevíveis por `SUGESTOES_EMAIL_PARA`). O envio SHALL NOT atrasar nem desfazer o registro: falha de e-mail só vai para o log.

#### Scenario: SMTP configurado
- **WHEN** uma sugestão é gravada e `SMTP_HOST` está configurado
- **THEN** o sistema SHALL enviar o e-mail aos destinatários, com o autor em `Reply-To`

#### Scenario: SMTP ausente ou falhando
- **WHEN** `SMTP_HOST` não está configurado ou o servidor de e-mail falha
- **THEN** a sugestão SHALL continuar gravada e o autor SHALL receber a confirmação normal

### Requirement: Acompanhamento pelo autor
O usuário SHALL ver somente as próprias sugestões, com status e resposta da gestão. Não SHALL ver sugestões de outras pessoas.

#### Scenario: Lista própria
- **WHEN** o usuário abre a tela Sugestões
- **THEN** o sistema SHALL listar apenas as sugestões dele, da mais recente para a mais antiga, com status e resposta

### Requirement: Gestão das sugestões
Quem é `is_admin` ou tem a capacidade `sugestoes` SHALL listar todas as sugestões, filtrar por status e tipo, alterar o status (`nova`, `em_analise`, `planejada`, `concluida`, `recusada`) e registrar uma resposta de até 500 caracteres. A permissão SHALL ser lida do banco a cada requisição.

#### Scenario: Mudança de status
- **WHEN** um gestor altera o status de uma sugestão
- **THEN** o sistema SHALL gravar o novo status e a data, e registrar `sugestao_status` na Auditoria

#### Scenario: Usuário sem permissão
- **WHEN** um usuário sem a capacidade tenta listar todas ou alterar o status
- **THEN** o sistema SHALL responder 403 e nada SHALL mudar

### Requirement: Interface acessível e responsiva
A tela SHALL funcionar nos 5 temas, em celular e desktop, com alvos de toque de pelo menos 44×44px, rótulos nos campos e foco visível.

#### Scenario: Celular
- **WHEN** a tela é aberta abaixo de `md`
- **THEN** a lista SHALL aparecer como cards e o formulário SHALL ocupar a largura inteira
