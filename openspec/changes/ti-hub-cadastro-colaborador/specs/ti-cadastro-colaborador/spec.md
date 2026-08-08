## ADDED Requirements

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
- **THEN** a ferramenta SHALL tentar reconhecimento óptico de caracteres sobre as páginas renderizadas
- **THEN** a ferramenta SHALL informar o progresso do reconhecimento ao usuário

#### Scenario: Nenhum texto recuperável
- **WHEN** nem a camada de texto nem o reconhecimento óptico produzem conteúdo útil
- **THEN** a ferramenta SHALL responder com sucesso, sinalizando que nada foi extraído
- **THEN** a ferramenta SHALL exibir aviso e liberar o preenchimento manual
- **THEN** a ferramenta SHALL NOT tratar esse caso como erro

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
A ferramenta SHALL oferecer uma simulação que monta, resolve e valida o cadastro completo, exibindo exatamente as requisições que seriam enviadas ao IXC, **sem executar nenhuma delas**.

#### Scenario: Nada é criado no ERP durante a simulação
- **WHEN** uma simulação é executada, com qualquer resultado
- **THEN** nenhum registro SHALL ser criado, alterado ou removido no IXC
- **THEN** a interface SHALL declarar de forma permanente e visível que nenhuma requisição foi enviada

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
