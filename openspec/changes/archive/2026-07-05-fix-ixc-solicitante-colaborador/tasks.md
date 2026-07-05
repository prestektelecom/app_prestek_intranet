## 1. Atualizações no Frontend

- [x] 1.1 Atualizar [TiSupportModal.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/TiSupportModal.jsx) para extrair o e-mail do usuário logado e incluí-lo no payload enviado como `email_solicitante`.

## 2. Atualizações no Backend

- [x] 2.1 Atualizar a rota `POST /api/ixc/su-ticket` em [server.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/backend/server.js) para receber `email_solicitante` e `colaborador_id`.
- [x] 2.2 Consultar o banco local PostgreSQL (`usuarios_perfil`) para resolver o ID de usuário do IXC (`usuario_id`) correspondente.
- [x] 2.3 Atribuir esse ID resolvido ao campo `id_usuarios` do ticket no IXC (definindo quem abriu o chamado).
- [x] 2.4 Manter o `id_tecnico` da OS como o técnico de TI selecionado (Marcio/Everton) para evitar erros de validação de setor no IXC e garantir o agendamento correto na agenda do técnico.

## 3. Verificação e Testes

- [x] 3.1 Validar a lógica de consulta no banco local que resolve o e-mail cadastrado no IXC.
- [ ] 3.2 Realizar uma abertura de chamado de teste pela intranet.
- [ ] 3.3 Confirmar no painel do IXC Soft que o Ticket exibe o solicitante correto e a OS está agendada/exibida para o técnico de TI responsável.
