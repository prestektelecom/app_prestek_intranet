## MODIFIED Requirements

### Requirement: Abertura do modal de criação com data padrão editável

Ao clicar em "Novo Plantão", o sistema SHALL abrir o `ManagePlantaoModal` em modo de criação com a data de hoje pré-selecionada e um campo de data editável para o administrador manter ou trocar. Sempre que a data for alterada nesse campo, o sistema SHALL revalidar se já existe um plantão cadastrado para a nova data, atualizando o aviso de substituição e os dados pré-carregados de acordo.

#### Scenario: Admin clica em "Novo Plantão"

- **WHEN** o administrador clica no botão "Novo Plantão" no Hero
- **THEN** o `ManagePlantaoModal` é aberto
- **AND** a data de hoje é pré-selecionada no campo de data
- **AND** o campo permanece editável para o admin escolher outra data caso deseje

#### Scenario: Admin salva plantão mantendo a data padrão

- **WHEN** o admin abre o modal via "Novo Plantão", não altera o campo de data e clica em salvar
- **THEN** o sistema cria o plantão para a data de hoje
- **AND** o comportamento de salvamento é idêntico ao fluxo existente via calendário

#### Scenario: Admin salva plantão após trocar a data no modal

- **WHEN** o admin altera a data pré-selecionada no modal aberto via botão "Novo Plantão" para um dia que já tem cobertura cadastrada e clica em salvar
- **THEN** o sistema exibe o aviso "Já existe um plantão — salvar irá substituir" imediatamente após a troca de data, sem esperar o salvamento
- **AND** os campos N1/N2/Supervisão são atualizados para refletir os dados já cadastrados naquele dia
- **AND** o plantão daquele dia é substituído (mesmo comportamento do fluxo via calendário) — nunca com uma mensagem de sucesso que sugira criação em vez de substituição

#### Scenario: Admin troca a data de um dia com plantão para um dia livre

- **WHEN** o admin altera a data no modal para um dia sem cobertura cadastrada
- **THEN** o aviso de substituição desaparece
- **AND** os campos N1/N2/Supervisão voltam ao estado vazio (sem os dados do dia anterior)

#### Scenario: Admin limpa a data e tenta salvar sem selecionar outra

- **WHEN** o admin limpa manualmente o campo de data pré-preenchido e tenta salvar
- **THEN** o sistema exibe a mensagem de erro "Selecione uma data para o plantão." e não cria o plantão

#### Scenario: Admin abre modal via botão e fecha sem salvar

- **WHEN** o admin abre o modal via "Novo Plantão" e fecha sem salvar
- **THEN** nenhum plantão é criado e o estado da página permanece inalterado
