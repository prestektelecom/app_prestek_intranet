## 1. Correção no Backend (server.js)

- [x] 1.1 Localizar a rota `POST /api/ixc/su-ticket` em [server.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/backend/server.js) e identificar o bloco de resolução do solicitante (linhas ~1759-1786).
- [x] 1.2 Alterar a query ao banco local para buscar **`funcionario_id`** (além de `usuario_id`) da tabela `usuarios_perfil`, armazenando o resultado em uma variável `ixc_func_id`.
- [x] 1.3 No payload de criação do ticket (`dados`), substituir o valor de `id_responsavel_tecnico` de `tecnico_id` para `ixc_func_id || tecnico_id` (usando `tecnico_id` como fallback quando `ixc_func_id` não for resolvido).
- [x] 1.4 Garantir que `id_usuarios` no payload do ticket continue recebendo `ixc_usuario_id` (sem alteração nesse campo).
- [x] 1.5 No helper `buildOSManualPayload`, confirmar que `id_tecnico` da OS continua sempre recebendo `tecnico_id` (técnico de TI selecionado) — sem alteração.
- [x] 1.6 Adicionar log no `[RESOLVE SOLICITANTE TICKET]` registrando qual `funcionario_id` foi resolvido para `id_responsavel_tecnico` e qual `tecnico_id` vai para a OS.

## 2. Verificação e Testes

- [x] 2.1 Reiniciar o servidor backend e abrir um chamado de teste pela intranet com um usuário que **não seja** Marcio nem Everton.
- [x] 2.2 Verificar no log `ixc_debug.log` que `id_responsavel_tecnico` recebeu o `funcionario_id` do solicitante e `id_tecnico` da OS recebeu o ID do técnico selecionado.
- [x] 2.3 Confirmar no painel do IXC Soft que o atendimento (`su_ticket`) exibe o colaborador logado como **"Colaborador responsável"** e a OS está agendada para o técnico de TI correto (Marcio ou Everton).
- [x] 2.4 Testar o cenário de fallback: simular ausência de `funcionario_id` no banco (ex: usuario sem funcionario_id) e confirmar que o chamado é aberto sem erros usando o técnico selecionado como fallback.
