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

### Requirement: Botão lateral e popup de envio
O portal SHALL exibir, para todo usuário logado, um botão rotulado "Enviar sugestão" fixo no canto inferior direito, acima da barra inferior no celular, que abre um popup (`role="dialog"`, `aria-modal`) com o formulário. O popup SHALL fechar por Escape, clique fora, botão Fechar ou Cancelar, prender o foco enquanto aberto e devolvê-lo ao botão ao fechar. Após o envio, o popup SHALL mostrar a confirmação em vez do formulário.

#### Scenario: Abrir e enviar
- **WHEN** o usuário clica no botão flutuante, preenche e envia
- **THEN** o popup SHALL mostrar a confirmação e a sugestão SHALL ser gravada e enviada por e-mail

#### Scenario: Celular
- **WHEN** a tela é menor que `sm`
- **THEN** o botão SHALL ficar só com o ícone, sem balão, e o popup SHALL abrir como folha ancorada embaixo

### Requirement: Rotas de gestão (sem interface)
O backend SHALL manter `GET /api/sugestoes` e `PATCH /api/sugestoes/:id`, restritos a `is_admin` ou à capacidade `sugestoes` (lida do banco a cada requisição), com Auditoria `sugestao_status` e `sugestao_resposta`. Não há tela de gestão nesta change.

#### Scenario: Usuário sem permissão
- **WHEN** um usuário sem a capacidade chama essas rotas
- **THEN** o sistema SHALL responder 403 e nada SHALL mudar

### Requirement: Interface acessível e responsiva
O botão e o popup SHALL funcionar nos 5 temas, em celular e desktop, com alvos de toque de pelo menos 44×44px, rótulos nos campos e foco visível.

#### Scenario: Celular
- **WHEN** o popup é aberto abaixo de `sm`
- **THEN** o formulário SHALL ocupar a largura inteira, com rolagem interna se não couber
