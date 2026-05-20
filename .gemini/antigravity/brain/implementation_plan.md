# Plano de Implementação: Abertura de Chamado de Suporte de TI no IXC Soft

Este plano descreve as modificações necessárias para adicionar um atalho interativo no Dashboard que permite aos colaboradores abrir um chamado de suporte de TI no IXC Soft diretamente pela intranet.

## User Review Required

> [!IMPORTANT]
> - **Parâmetros Fictícios/Fixos do IXC:** O chamado será aberto sob o Cliente `681`, Login `1` e Contrato `18426` (dados fixos da própria prestadora JSE).
> - **Responsabilidade do Chamado:** O colaborador responsável (técnico) no chamado e na OS do IXC será o próprio colaborador que está logado e abrindo a solicitação, conforme solicitado.
> - **Interação e Status:** O ticket será criado com status "Novo" (`su_status: 'N'`), origem "Interna" (`id_ticket_origem: 'I'`), canal de atendimento "Site/Aplicativo Prestek" (`id_canal_atendimento: '4'`), e filial "1" (`id_filial: '1'`).

---

## Proposed Changes

### Backend

#### [MODIFY] [server.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/backend/server.js)
- Ajustar a rota `POST /api/ixc/su-ticket` para:
  1. Aceitar `nome_solicitante` opcional no corpo da requisição.
  2. Formatar a descrição (`menssagem`) no formato:
     ```text
     Solicitante: [Nome do Usuário]

     ========================
     DESCREVA A SITUAÇÃO:
     [Texto digitado pelo usuário]
     ========================
     ```
  3. Atualizar as coordenadas geográficas para:
     - `latitude`: `'-10.277295'`
     - `longitude`: `'-36.5581617'`
  4. Atualizar a filial (`id_filial`) para `'1'`.
  5. Atualizar o canal de atendimento (`id_canal_atendimento`) para `'4'`.
  6. Configurar `interacao_pendente` como `'I'`.
  7. Garantir que `tecnico_id` (se enviado) ou `colaborador_id` seja definido como o responsável técnico da OS e do ticket.

---

### Frontend

#### [NEW] [TiSupportModal.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/TiSupportModal.jsx)
- Criar um componente de modal dedicado e altamente estético (alinhado com o design premium da intranet) contendo:
  - Título "Suporte de TI" com ícone correspondente.
  - Textarea para descrição do problema.
  - Botão de envio com spinner de carregamento.
  - Tela de sucesso com exibição destacada do **Número do Protocolo** retornado pelo IXC.
  - Tratamento de erros amigável.

#### [MODIFY] [Dashboard.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Dashboard.jsx)
- Integrar o novo componente `TiSupportModal`.
- No componente `AtalhosCard`, interceptar o clique no botão de "Suporte TI" (`id === 'tickets'`) para abrir o modal em vez de alterar a visualização para a listagem geral de tickets.
- Adicionar os estados de controle do modal (`isTiModalOpen`) e renderizar o modal no final do JSX do painel.

---

## Verification Plan

### Automated/Manual Tests
1. **Fluxo Completo de Abertura:**
   - Logar na intranet com uma conta de teste.
   - Clicar no atalho "Suporte TI" no Dashboard.
   - Escrever uma mensagem de teste no modal e clicar em enviar.
   - Verificar se o spinner de carregamento funciona corretamente.
   - Confirmar se o modal exibe a tela de sucesso com o número do protocolo gerado.
2. **Validação da API do IXC:**
   - Validar se o ticket foi inserido no IXC com:
     - A descrição formatada contendo o nome do solicitante correto.
     - Filial = 1, Canal de atendimento = 4, Prioridade = Normal, Origem = Interna, Processo = 237, Departamento = 16.
     - O funcionário logado configurado como responsável técnico no ticket e no agendamento da OS.
     - Coordenadas geográficas corretas (-10.277295, -36.5581617).
