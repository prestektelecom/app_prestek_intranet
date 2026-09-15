# ti-cadastro-colaborador Specification

## Purpose

Garante que a ferramenta de Cadastro de Colaborador (aba TI) acelere o registro manual de um colaborador no IXC sem nunca fabricar dado nem gravar nada sem revisão explícita: extração assistida de PDF com confiança por campo, resolução de FKs contra o IXC real, e uma simulação que mostra exatamente o que seria enviado antes de qualquer gravação real acontecer.

## Requirements

### Requirement: Extração assistida da ficha de registro
A ferramenta SHALL aceitar o envio de uma ficha de registro em PDF e extrair dela os campos do cadastro de colaborador, para uso como preenchimento inicial de um formulário de revisão.

A extração SHALL tratar as três origens de ficha em uso — PDF digital, PDF exportado de editor de texto e digitalização — degradando de forma ordenada entre elas.

A extração SHALL ser sempre um acelerador, nunca um pré-requisito: o formulário SHALL permanecer preenchível manualmente em qualquer resultado da extração.

#### Scenario: Ficha com camada de texto
- **WHEN** o PDF enviado contém camada de texto com conteúdo útil
- **THEN** a ferramenta SHALL extrair os campos a partir desse texto
- **THEN** PDF digital e PDF exportado de editor de texto SHALL produzir o mesmo tratamento, absorvendo diferenças de quebra de linha e de espaçamento na normalização

#### Scenario: Ficha digitalizada
- **WHEN** o PDF enviado não contém camada de texto com conteúdo útil
- **THEN** a ferramenta SHALL tentar reconhecimento óptico de caracteres sobre as páginas renderizadas, numa resolução suficiente para leitura de fonte de formulário denso
- **THEN** a ferramenta SHALL informar o progresso do reconhecimento ao usuário

#### Scenario: Nenhum texto recuperável
- **WHEN** nem a camada de texto nem o reconhecimento óptico produzem conteúdo útil, incluindo o caso de a extração exceder um tempo máximo razoável
- **THEN** a ferramenta SHALL responder com sucesso, sinalizando que nada foi extraído
- **THEN** a ferramenta SHALL exibir aviso e liberar o preenchimento manual
- **THEN** a ferramenta SHALL NOT tratar esse caso como erro, e SHALL NOT deixar a requisição pendente indefinidamente

#### Scenario: Arquivo inválido ou excessivo
- **WHEN** o conteúdo enviado não é um PDF
- **THEN** a ferramenta SHALL rejeitar o envio informando o motivo
- **WHEN** o arquivo excede o limite de tamanho aceito
- **THEN** a ferramenta SHALL rejeitar o envio sem processá-lo

#### Scenario: A ficha não é armazenada
- **WHEN** uma ficha é enviada e processada
- **THEN** o arquivo SHALL existir apenas durante o processamento da requisição
- **THEN** o sistema SHALL NOT persistir o arquivo em disco, em banco ou em cache

### Requirement: Confiança por campo extraído
Cada campo extraído SHALL carregar uma medida de confiança, e a interface SHALL traduzir essa medida em grau de atenção exigido do revisor.

A confiança SHALL refletir **como** o valor foi obtido, e não apenas se foi obtido.

#### Scenario: Confiança decresce com a fragilidade da evidência
- **WHEN** o valor é encontrado adjacente a um rótulo conhecido, na mesma linha
- **THEN** a confiança SHALL ser máxima
- **WHEN** o valor é encontrado apenas na linha seguinte a um rótulo conhecido
- **THEN** a confiança SHALL ser intermediária
- **WHEN** o valor é encontrado apenas por padrão de formato, sem rótulo que o ancore
- **THEN** a confiança SHALL ser mínima

#### Scenario: Origem por reconhecimento óptico rebaixa a confiança
- **WHEN** o texto de origem veio de reconhecimento óptico
- **THEN** a confiança de todos os campos extraídos SHALL ser reduzida
- **THEN** na prática todos os campos de uma ficha digitalizada SHALL exigir conferência explícita

#### Scenario: Valor que falha na normalização não é descartado
- **WHEN** um valor extraído falha na validação do seu normalizador, por exemplo um CPF com dígito verificador inválido
- **THEN** a ferramenta SHALL preservar o valor original no formulário
- **THEN** a ferramenta SHALL rebaixar a confiança do campo e sinalizá-lo para conferência
- **THEN** a ferramenta SHALL NOT substituir o valor nem esvaziar o campo

#### Scenario: Atenção visual proporcional
- **WHEN** um campo tem confiança alta
- **THEN** o campo SHALL ser exibido sem marcação especial
- **WHEN** um campo tem confiança reduzida
- **THEN** o campo SHALL ser destacado como pendente de conferência
- **WHEN** um campo obrigatório não foi extraído
- **THEN** o campo SHALL ser destacado como pendência bloqueante
- **WHEN** o usuário edita um campo
- **THEN** a marcação de confiança SHALL ceder lugar à indicação de que o valor foi revisado

#### Scenario: Rótulos ambíguos não se canibalizam
- **WHEN** um rótulo conhecido é prefixo de outro rótulo conhecido, por exemplo um rótulo de nome e um rótulo de nome de familiar
- **THEN** o casamento SHALL preferir sempre o rótulo mais específico
- **THEN** um campo SHALL NOT receber o valor pertencente a outro campo por essa ambiguidade

#### Scenario: O texto de origem fica disponível para auditoria
- **WHEN** uma extração é concluída
- **THEN** a interface SHALL disponibilizar o texto bruto obtido da ficha
- **THEN** a interface SHALL disponibilizar a relação de rótulos presentes no documento que nenhuma regra reconheceu

### Requirement: Documentos, Filiação e Preservação de Cargo/CBO
O formulário de cadastro SHALL comportar as seções de Documentos e Filiação, bem como campos adicionais de Identificação (Nacionalidade e Deficiência). Rótulos de Cargo e CBO extraídos da ficha SHALL ser preservados como observações do colaborador e sugeridos na interface.

#### Scenario: Documentos e derivação de flags de seleção
- **WHEN** documentos (RG, CTPS, Título de Eleitor, PIS) são informados ou extraídos
- **THEN** os flags do ERP correspondentes (`rg_seleciona`, `ctps_seleciona`, `titulo_eleitoral_seleciona`, `pis_seleciona`, `cpf_seleciona`) SHALL ser derivados automaticamente como `'S'` quando o documento estiver presente e `'N'` quando ausente
- **THEN** a interface SHALL NOT exigir preenchimento manual de flags booleanos redundantes para documentos preenchidos

#### Scenario: Filiação materna e paterna
- **WHEN** dados de filiação constam na ficha ou são digitados
- **THEN** o sistema SHALL armazenar `nome_mae` e `nome_pai` em seus respectivos campos do ERP `funcionarios`
- **THEN** o casamento de nomes de familiares SHALL NOT sobrepor o nome do colaborador

#### Scenario: Cargo e CBO da ficha
- **WHEN** a ficha contém informações de Cargo e CBO
- **THEN** o sistema SHALL gravar uma nota formatada em `funcionarios.obs` (`"Cargo (ficha): ... · CBO: ..."`)
- **THEN** a interface SHALL exibir uma dica visual informativa junto ao seletor de Função para orientar a escolha do operador

### Requirement: Resolução de chaves estrangeiras contra o IXC
Todo campo do cadastro que referencia outro registro do IXC SHALL ser resolvido contra o sistema, e nunca inferido a partir do texto da ficha.

#### Scenario: Cidade nunca é adivinhada
- **WHEN** a ficha informa um nome de cidade
- **THEN** a ferramenta SHALL consultar o cadastro de cidades do IXC
- **WHEN** a consulta retorna exatamente um resultado
- **THEN** a ferramenta SHALL pré-selecionar esse resultado, sinalizando-o como pendente de conferência
- **WHEN** a consulta retorna nenhum ou mais de um resultado
- **THEN** a ferramenta SHALL deixar o campo em aberto e registrá-lo como pendência

#### Scenario: A unidade federativa deriva da cidade
- **WHEN** uma cidade é selecionada
- **THEN** a unidade federativa SHALL ser derivada do registro de cidade escolhido
- **THEN** a unidade federativa SHALL NOT usar valor padrão nem ser inferida do texto da ficha

#### Scenario: Conta contábil é sempre escolha explícita
- **WHEN** o cadastro exige a conta contábil de vínculo do colaborador
- **THEN** a ferramenta SHALL exigir seleção explícita
- **THEN** a ausência SHALL ser tratada como erro bloqueante
- **THEN** a ferramenta SHALL NOT preencher esse campo automaticamente a partir da ficha

#### Scenario: Taxonomia indisponível degrada sem quebrar
- **WHEN** uma das listas de referência do IXC não pode ser obtida
- **THEN** a ferramenta SHALL continuar operando com as demais listas
- **THEN** a ferramenta SHALL sinalizar quais listas vieram incompletas
- **THEN** a ferramenta SHALL NOT falhar a tela inteira por causa de uma lista ausente

### Requirement: Simulação do cadastro antes de qualquer gravação
A ferramenta SHALL oferecer uma simulação que monta, resolve e valida o cadastro completo, exibindo exatamente as requisições que seriam enviadas ao IXC, **sem executar nenhuma delas**. A gravação real SHALL permanecer indisponível até uma fase de produto separada.

#### Scenario: Nada é criado no ERP durante a simulação
- **WHEN** uma simulação é executada, com qualquer resultado
- **THEN** nenhum registro SHALL ser criado, alterado ou removido no IXC
- **THEN** a interface SHALL declarar de forma permanente e visível que nenhuma requisição foi enviada

#### Scenario: A gravação real ainda não está disponível
- **WHEN** a rota de criação real é chamada
- **THEN** o sistema SHALL responder que a operação não está implementada, sem tentar gravar nada
- **THEN** a resposta SHALL apontar para a simulação como a via disponível

#### Scenario: A simulação enumera todos os problemas de uma vez
- **WHEN** o formulário contém erros
- **THEN** a simulação SHALL continuar disponível e SHALL relatar todos os problemas encontrados em uma única execução
- **THEN** o controle de simulação SHALL NOT ser desabilitado em função de erros de preenchimento
- **THEN** cada problema relatado SHALL permitir navegar diretamente até o campo correspondente

#### Scenario: Validação contra o schema real do IXC
- **WHEN** a simulação é executada
- **THEN** a ferramenta SHALL verificar a presença de todos os campos obrigatórios dos recursos envolvidos
- **THEN** a ferramenta SHALL verificar que cada chave estrangeira existe na lista de referência correspondente
- **THEN** a ferramenta SHALL verificar que valores de domínio pertencem ao conjunto aplicável ao Brasil
- **THEN** exceder o comprimento máximo de um campo SHALL ser relatado como aviso, não como erro bloqueante

#### Scenario: O plano exibe a sequência real de gravação
- **WHEN** a simulação é bem-sucedida
- **THEN** a ferramenta SHALL exibir, em ordem, cada requisição que seria enviada, com método, endereço, cabeçalhos distintivos e corpo completo
- **THEN** a ferramenta SHALL explicitar a dependência entre os passos, incluindo o passo que fecha o vínculo recíproco entre colaborador e usuário
- **THEN** o corpo de cada requisição SHALL ser copiável

#### Scenario: Criação de usuário do sistema é opcional
- **WHEN** a criação de usuário do sistema está desativada
- **THEN** o plano SHALL conter apenas o passo de criação do colaborador
- **THEN** os campos de acesso ao sistema SHALL NOT ser exigidos

#### Scenario: Duplicidade é relatada como aviso
- **WHEN** já existe registro no IXC com o mesmo CPF ou o mesmo e-mail
- **THEN** a simulação SHALL relatar a coincidência, identificando o registro existente
- **THEN** a simulação SHALL tratar isso como aviso, permitindo que o operador decida

### Requirement: Credenciais e senhas nunca no cliente
A ferramenta SHALL manter as credenciais de integração e as senhas de colaborador fora do navegador e fora de qualquer registro de auditoria ou log.

#### Scenario: Configuração de integração não trafega do cliente
- **WHEN** qualquer operação da ferramenta é executada
- **THEN** as credenciais de acesso ao IXC SHALL ser obtidas exclusivamente da configuração do servidor
- **THEN** nenhuma rota SHALL aceitar endereço, usuário ou token de integração enviados pelo cliente
- **THEN** a interface SHALL NOT exibir nem armazenar essas credenciais

#### Scenario: A senha do colaborador não é ecoada
- **WHEN** uma senha é definida para o usuário a ser criado
- **THEN** o plano exibido SHALL conter apenas o resumo criptográfico da senha, no mesmo formato usado pela autenticação existente
- **THEN** a senha em texto puro SHALL NOT aparecer no plano, em logs ou no registro de auditoria

#### Scenario: Operações sensíveis são auditadas
- **WHEN** uma extração de ficha ou uma simulação é executada
- **THEN** o sistema SHALL registrar a operação e seu autor no log de auditoria
- **THEN** o registro SHALL NOT conter a senha nem o conteúdo integral da ficha

### Requirement: Controles de escolha binária têm nome acessível
Todo controle de escolha Sim/Não do formulário SHALL expor um nome acessível derivado do rótulo do campo, e SHALL indicar programaticamente quando é de preenchimento obrigatório.

#### Scenario: Leitor de tela anuncia o rótulo do controle
- **WHEN** um leitor de tela move o foco para um controle de escolha Sim/Não
- **THEN** o leitor de tela SHALL anunciar o rótulo do campo ao qual o controle pertence, não apenas o texto "Sim" ou "Não"

#### Scenario: Obrigatoriedade é exposta programaticamente
- **WHEN** um campo do formulário é obrigatório
- **THEN** o controle correspondente SHALL expor essa obrigatoriedade a tecnologia assistiva, e não apenas por um indicador visual

### Requirement: Erros de campo são associados programaticamente e distintos de dicas
Toda mensagem de erro de validação SHALL ser associada ao campo correspondente por atributo de descrição, e SHALL ser visualmente distinta de uma dica neutra.

#### Scenario: Leitor de tela anuncia o erro ao focar o campo
- **WHEN** um campo com erro de validação visível recebe foco
- **THEN** tecnologia assistiva SHALL anunciar a mensagem de erro associada a esse campo

#### Scenario: Erro não se confunde com dica
- **WHEN** um campo exibe uma mensagem de erro de validação
- **THEN** essa mensagem SHALL usar um estilo visualmente distinto do texto de dica neutra do mesmo formulário

### Requirement: Resultados de ações assíncronas são anunciados
O resultado de uma simulação de cadastro, seja sucesso ou falha, SHALL ser anunciado a tecnologia assistiva sem exigir que o usuário mova o foco manualmente até ele.

#### Scenario: Toast de resultado é anunciado
- **WHEN** a simulação de cadastro conclui e o toast de resultado aparece
- **THEN** tecnologia assistiva SHALL anunciar a mensagem do toast automaticamente

#### Scenario: Card de resultado do dry-run é anunciado
- **WHEN** o card de resultado do dry-run aparece ou muda de conteúdo
- **THEN** tecnologia assistiva SHALL anunciar a mudança automaticamente

### Requirement: Texto real e controles interativos passam contraste em todo tema
Todo texto real do formulário — rótulos, dicas, mensagens de erro, o indicador de ferramenta selecionada e o texto do botão primário — SHALL manter contraste de ao menos 4,5:1 contra seu fundo em todos os temas suportados, incluindo qualquer ponto de um fundo em gradiente.

#### Scenario: Rótulos e dicas legíveis no tema claro
- **WHEN** o tema claro está ativo
- **THEN** todo rótulo de campo, subtítulo de seção e texto de dica SHALL ter contraste de ao menos 4,5:1 contra seu fundo

#### Scenario: Texto sobre gradiente permanece legível em toda a extensão
- **WHEN** um botão ou indicador usa um fundo em gradiente
- **THEN** o texto sobreposto SHALL manter ao menos 4,5:1 de contraste em qualquer ponto do gradiente, não apenas em uma das extremidades

### Requirement: Alvos de toque do formulário atingem o mínimo de 44px
Todo controle interativo do formulário — campos, botões, controles de escolha e o indicador de ferramenta — SHALL ter uma área de toque efetiva de ao menos 44×44px.

#### Scenario: Controles de formulário atingem o alvo mínimo
- **WHEN** qualquer campo, botão ou controle de escolha do formulário é medido
- **THEN** sua área de toque efetiva SHALL ser de ao menos 44×44px

### Requirement: Combobox de cidade é operável por teclado
O combobox de seleção de cidade SHALL ser completamente operável sem mouse, seguindo o padrão de combobox com foco virtual.

#### Scenario: Setas navegam entre resultados
- **WHEN** o combobox exibe resultados e o usuário pressiona a seta para baixo ou para cima
- **THEN** o destaque SHALL mover entre os resultados sem que o foco real saia do campo de texto

#### Scenario: Enter seleciona o resultado destacado
- **WHEN** um resultado está destacado e o usuário pressiona Enter
- **THEN** esse resultado SHALL ser selecionado, com o mesmo efeito de um clique

#### Scenario: Escape fecha sem perder o foco
- **WHEN** a lista de resultados está aberta e o usuário pressiona Escape
- **THEN** a lista SHALL fechar
- **THEN** o foco SHALL permanecer no campo de texto

#### Scenario: Destaque de teclado é visualmente distinguível
- **WHEN** um resultado está destacado por navegação de teclado
- **THEN** o destaque SHALL ter contraste de ao menos 3:1 contra o fundo da lista

### Requirement: Indicador de progresso reflete o estado real da ferramenta
O indicador de etapa exibido no cabeçalho SHALL refletir o estado real do formulário, e SHALL NOT anunciar uma etapa que a ferramenta não é capaz de alcançar.

#### Scenario: O indicador muda depois de uma simulação
- **WHEN** uma simulação é executada com sucesso
- **THEN** o indicador de etapa SHALL mudar de valor para refletir esse novo estado

#### Scenario: Nenhuma etapa inexistente é anunciada
- **WHEN** o indicador de etapa é exibido em qualquer momento
- **THEN** ele SHALL NOT fazer referência a uma etapa de gravação real, enquanto essa capacidade não existir

### Requirement: A ação de simular permanece alcançável sem rolagem extensa
Em larguras de tela abaixo do limiar de duas colunas, o controle de simulação SHALL permanecer alcançável sem exigir rolagem por múltiplas telas de conteúdo.

#### Scenario: Botão de simular visível durante a rolagem em telas estreitas
- **WHEN** a largura da tela está abaixo do limiar de duas colunas e o usuário rola o formulário
- **THEN** o controle de simulação SHALL permanecer visível ou acessível em poucos gestos, sem exigir rolar todas as seções do formulário primeiro
