# login-screen Specification

## Purpose

Tela de entrada do portal: formulário de e-mail e senha acessível e com autofill, erros na língua da casa, estado de servidor indisponível, "Manter conectado" que persiste só a sessão, painel da marca e tokens dos cinco temas.

## Requirements

### Requirement: Formulário acessível e com autofill
Os campos de e-mail e senha SHALL ter rótulo visível associado programaticamente, `type` e `autocomplete` corretos (`email`/`username` e `password`/`current-password`), teclado de e-mail no celular, e o campo de e-mail SHALL receber o foco ao abrir a tela. O controle de mostrar/ocultar senha SHALL ter nome acessível, estado pressionado e área de toque de 44×44px. A opção "Manter conectado" SHALL ser um checkbox real, alcançável por Tab e acionável por Espaço.

#### Scenario: Leitor de tela nos campos
- **WHEN** um leitor de tela chega ao primeiro campo
- **THEN** anuncia "E-mail do IXC, editar texto" e, no segundo, "Senha, senha"

#### Scenario: Gerenciador de senha
- **WHEN** o navegador tem credenciais salvas para o portal
- **THEN** oferece o preenchimento automático nos dois campos

#### Scenario: Marcar "Manter conectado" pelo teclado
- **WHEN** o usuário navega por Tab até "Manter conectado" e pressiona Espaço
- **THEN** a opção alterna e o estado é anunciado

### Requirement: Erros na língua da casa e anunciados
Antes de enviar, o formulário SHALL validar campo vazio e formato de e-mail. Após a resposta do servidor, o erro SHALL ser exibido em uma região `role="alert"`, o campo relacionado SHALL ser marcado como inválido e descrito pela mensagem, e o foco SHALL ir para esse campo. Nenhuma mensagem SHALL conter detalhes técnicos do servidor.

#### Scenario: E-mail inexistente
- **WHEN** o usuário envia um e-mail que não existe no IXC
- **THEN** a tela mostra "Usuário não encontrado." em até 1,5 s, anuncia a mensagem e move o foco para o campo de e-mail

#### Scenario: Senha incorreta
- **WHEN** o usuário envia a senha errada
- **THEN** a tela mostra "Senha incorreta.", mantém o e-mail preenchido e move o foco para o campo de senha, já limpo

#### Scenario: E-mail em formato inválido
- **WHEN** o usuário envia "abc" no campo de e-mail
- **THEN** a tela mostra "Informe um e-mail válido." sem chamar o servidor

### Requirement: Servidor indisponível com saída
Enquanto a verificação de saúde do servidor falha, o botão de entrar SHALL ficar desabilitado com o texto "Aguardando servidor...". Após duas falhas consecutivas, a tela SHALL explicar a situação ("A intranet está fora do ar. Tente de novo em instantes ou avise a TI.") e oferecer um botão "Tentar agora".

#### Scenario: Backend fora do ar
- **WHEN** duas verificações seguidas falham
- **THEN** a mensagem de indisponibilidade e o botão "Tentar agora" aparecem, e os campos continuam editáveis

#### Scenario: Backend volta
- **WHEN** uma verificação tem sucesso
- **THEN** a mensagem some e o botão "Entrar" volta a ficar habilitado

### Requirement: Manter conectado só com sessão
A opção "Manter conectado" SHALL persistir apenas a sessão autenticada por 7 dias. O portal SHALL NOT gravar a senha do usuário em nenhum armazenamento do navegador, e SHALL apagar qualquer credencial gravada por versões anteriores ao carregar a tela.

#### Scenario: Entrar com "Manter conectado"
- **WHEN** o usuário entra com a opção marcada, fecha o navegador e volta em menos de 7 dias
- **THEN** entra direto no Início sem digitar a senha

#### Scenario: Credencial antiga no navegador
- **WHEN** o navegador ainda tem a chave de credenciais de uma versão anterior
- **THEN** a chave é removida ao abrir a tela e os campos aparecem vazios

### Requirement: Copy honesta
A tela SHALL identificar a empresa como "Prestek Telecom", SHALL dizer que o acesso usa o mesmo usuário e senha do IXC, SHALL nomear o campo de e-mail de forma única em rótulo, placeholder e erro, e SHALL NOT exibir alegações de segurança, links ou funcionalidades que o produto não possui. A ajuda SHALL ser a frase "Fale com a TI para recuperar o acesso." O título da aba SHALL ser "Entrar · Prestek Intranet".

#### Scenario: Ler a tela
- **WHEN** a tela de login abre
- **THEN** não há "Inc.", "SSO", "SAML", "Status", "Docs", "Suporte" nem "painel 3D" em nenhum texto

#### Scenario: Título da aba
- **WHEN** a tela de login está aberta
- **THEN** a aba do navegador diz "Entrar · Prestek Intranet"

### Requirement: Tema e contraste do sistema
A tela SHALL usar os tokens do sistema em toda cor e SHALL mudar com o tema escolhido (claro e as quatro variantes escuras). Todo texto SHALL ter contraste mínimo de 4,5:1 e todo limite de componente (borda de campo, checkbox, botão) mínimo de 3:1 contra o fundo em que aparece, em todos os temas. Superfícies SHALL ficar planas em repouso, sem sombra colorida.

#### Scenario: AMOLED
- **WHEN** o usuário com tema AMOLED abre a tela de login
- **THEN** o fundo é preto, o card é a superfície do tema e o botão principal é o laranja do tema com texto no `onAccent`

#### Scenario: Contraste do botão
- **WHEN** a tela é medida no tema claro
- **THEN** o texto do botão "Entrar" rende no mínimo 4,5:1 sobre o preenchimento

### Requirement: Painel da marca sem assets pesados
Acima de 1024px, a tela SHALL exibir ao lado do formulário um painel com o logotipo real da Prestek e a linguagem visual do sistema (gradiente e anéis de sinal), sem animação e sem download adicional. Abaixo de 1024px, o painel SHALL NOT ser montado nem carregar assets.

#### Scenario: Celular em rede lenta
- **WHEN** a tela abre em 390px de largura
- **THEN** nenhum asset de ilustração é transferido e a tela pesa menos de 300 KB além do bundle da aplicação

#### Scenario: Movimento reduzido
- **WHEN** o sistema pede movimento reduzido
- **THEN** nada na tela se move

### Requirement: Layout no celular
Abaixo de 768px, o formulário SHALL ocupar a largura útil com espaçamento interno de 24px, o título SHALL caber em uma ou duas linhas, e com o teclado virtual aberto (altura útil de 540px) o botão "Entrar" SHALL estar visível sem rolar.

#### Scenario: Teclado aberto
- **WHEN** a tela tem 390×540px de área útil e o campo de senha está focado
- **THEN** o botão "Entrar" está inteiramente dentro da área visível
