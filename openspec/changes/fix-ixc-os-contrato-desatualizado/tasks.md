## 1. Resolução dinâmica de login/contrato do cliente placeholder

- [x] 1.1 Criar uma função auxiliar (`resolverIxcIdsPlaceholder`) que consulta `radusuarios`,
      sem cache. **Corrigido após teste ao vivo**: a 1ª versão filtrava por
      `id_cliente = 681 AND ativo = 'S'` esperando 1 resultado — o cliente 681 na verdade tem
      40 logins (uma unidade/filial da Prestek por login), a consulta retornou 10 login
      ativos na 1ª página e a resolução falhava sempre, mesmo com dado correto disponível.
      Corrigido para filtrar por `radusuarios.login = 'escritorio.prestek'` (nome de usuário
      específico, estável) em vez de contar logins do cliente.
- [x] 1.2 Tratar o caso de login encontrado: retornar `{ id_cliente: '681', id_login: <id>, id_contrato: <id_contrato> }`.
- [x] 1.3 Tratar o caso de login não encontrado (nome inexistente, inativo, ou de outro
      cliente) como falha de resolução: logar em `ixc_debug.log` com detalhe do que foi
      encontrado, e sinalizar para o chamador que a resolução falhou (sem lançar exceção não
      tratada).
- [x] 1.4 Substituir o `ixcIds` hardcoded (server.js:1767-1771) por uma chamada a essa
      função no início do handler de `POST /api/ixc/su-ticket`, antes de qualquer tentativa
      de criar ticket ou OS.
- [x] 1.5 Se a resolução falhar, abortar o fluxo de OS antes do PASSO 1 (o ticket ainda pode
      ser criado normalmente — só a parte de OS fica pulada) e já preparar o `os_criada: false` / `aviso` da Decisão 3.
      **Correção pós-implementação**: o fallback inicial mandava `id_contrato: ''` nesse
      caminho — quebraria a criação do PRÓPRIO ticket, porque o assunto usado (`1154`) tem
      `contrato_obrigatorio: "S"` confirmado ao vivo em `su_oss_assunto` (e `login_obrigatorio: "N"`,
      o que também confirma por que o ticket nunca precisou do vínculo login↔contrato, só a
      OS). Corrigido com um segundo fallback, mais simples (`cliente_contrato` por
      `id_cliente`, sem depender de login), usado só para preencher o `id_contrato` do
      ticket — `ixcIdsResolvidos` continua `false` nesse caminho, então o fluxo de OS
      permanece bloqueado. `design.md` e o spec foram atualizados com o achado e o novo
      cenário.

## 2. Ordem segura de substituição da OS do workflow (PASSO 2)

- [x] 2.1 Confirmar, lendo `criarOSManual`/`deletarOS` atuais, que dá pra distinguir (pela
      mensagem de erro da IXC) "bloqueado pela OS do workflow" de outros erros — se não der,
      ajustar a checagem para essa distinção antes de prosseguir com o resto desta seção.
      **Achado na implementação**: a IXC retorna uma mensagem específica e estável para esse
      caso ("Esse ticket já possui uma O.S. vinculada [ID: ...], para criar mais que uma OS
      por atendimento, utilize PROCESSO!", confirmada em 80+ ocorrências no log histórico) —
      usada para popular a flag `osBloqueadaPorWorkflow`.
- [x] 2.2 ~~Mover a deleção de mensagens + OS do workflow para DEPOIS da tentativa de criar a
      OS manual substituta~~ — **corrigido durante a implementação**: fisicamente impossível
      como descrito (a IXC recusa criar a OS manual enquanto a do workflow existir para o
      mesmo ticket — é exatamente esse erro que classifica `osBloqueadaPorWorkflow`; não dá
      pra "tentar criar antes de deletar" quando esse é o próprio motivo do bloqueio). A
      proteção real implementada é a dupla validação ANTES de deletar: (1) login/contrato já
      confirmados corretos pela Seção 1, e (2) só entra no caminho de deleção quando o erro
      do PASSO 1 é especificamente o de "OS já vinculada" (Seção 2.1) — nunca por causa de um
      erro de dados que apagar não resolveria. `design.md` e o spec da capability foram
      atualizados para refletir essa mecânica real em vez da reordenação literal descrita
      originalmente.
- [x] 2.3 ~~Se a criação da OS manual substituta falhar mesmo com a OS do workflow ainda
      intacta, preservar a OS do workflow~~ — **ajustado**: como a deleção é fisicamente
      necessária antes da tentativa de recriação (ver 2.2), não há "OS intacta" nesse ponto
      para preservar. Quando a falha acontece por outro motivo que NÃO seja bloqueio pela OS
      do workflow (ex.: um erro de dados inesperado), a OS do workflow É preservada porque o
      fluxo nunca chega a tentar deletá-la (guarda de `osBloqueadaPorWorkflow` na Seção 2.1).
      Para o caso raro em que a recriação falha mesmo depois da deleção necessária, a rede de
      segurança é a resposta honesta da Seção 3 (`os_criada: false`), não uma restauração.
- [x] 2.4 Atualizar as mensagens de log do PASSO 2 para refletir a nova ordem (ex.: não
      logar mais "OS do workflow deletada. Criando OS manual..." antes de deletar de fato).

## 3. Resposta honesta ao frontend

- [x] 3.1 Adicionar `os_criada: boolean` e `aviso: string | null` à resposta de
      `POST /api/ixc/su-ticket` (server.js, bloco de retorno final ~linha 2099).
- [x] 3.2 Cobrir os três desfechos possíveis: OS manual criada (workflow nunca existiu ou
      foi substituída com sucesso), falha de resolução do login/contrato (Seção 1), e falha
      residual da criação mesmo com dados corretos (Seção 2) — os dois últimos casos
      resultam em `os_criada: false` com uma mensagem de aviso específica para cada um.
- [x] 3.3 Logar o desfecho final (`os_criada` + motivo, se houver) em `ixc_debug.log` junto
      com o `FIM. Retornando protocolo ...` já existente.

## 4. Frontend (`TiSupportModal.jsx`)

- [x] 4.1 Ler `os_criada`/`aviso` da resposta e, quando `os_criada: false`, mostrar uma
      variante da tela de sucesso com aviso visível (não a tela de erro — o ticket foi
      criado) explicando que o chamado foi registrado mas sem OS/agendamento automático.
- [x] 4.2 Confirmar que o aviso segue os tokens de tema do projeto (não cor hardcoded) e
      atende contraste nos 5 temas, consistente com o restante do componente. Usa
      `C.warningSoft`/`C.warning`/`C.warningStrong`, o mesmo padrão de par semântico já usado
      no bloco de sucesso (`C.successSoft`/`C.success`) — **validado via `/impeccable`**: o
      par `warningSoft`/`warningStrong` já é usado como fundo+texto em `LoginForm.jsx`
      (banner de aviso do Login, Fase 2), então o ícone (uso gráfico, piso de 3:1, mais leve
      que o uso de texto já validado ali) está coberto nos 5 temas sem risco novo; o SVG do
      triângulo de alerta é o path padrão Feather/Lucide `alert-triangle`, mesma família de
      stroke do ícone de check ao lado. Achado incidental e corrigido no caminho (dentro da
      mesma caixa de protocolo que as duas variantes compartilham): rótulo "Número do
      Protocolo" usava `C.muted` como texto real a 10,5px — violação do "Muted Is Never Text
      Rule" do DESIGN.md, o achado mais repetido de todo o programa Impeccable — trocado para
      `C.ink2`. Outras 3 ocorrências de `C.muted` como texto no mesmo arquivo (subtítulo do
      header, labels do formulário) são pré-existentes e ficaram fora do escopo desta
      mudança, por não pertencerem à variante nova. Build limpo (`npx vite build`) depois do
      fix. Verificação visual ao vivo nos 5 temas (não só a leitura de token) segue pendente
      na Seção 5, já que abrir o modal de verdade depende de sessão logada no app.

## 5. Verificação manual

- [ ] 5.1 Abrir um chamado de teste selecionando MARCIO, confirmar no IXC Soft que a OS
      final está agendada (`status: AG`) com o técnico correto. **Não testado
      separadamente** — o caminho de código é idêntico ao de EVERTON (só `tecnico_id` muda,
      sem ramificação por técnico), e MARCIO já tinha funcionado dezenas de vezes no
      histórico antes da regressão (`ixc_debug.log`, 2026-06-29 a 2026-08-29). Risco residual
      baixo; testar se quiser confirmação extra.
- [x] 5.2 Abrir um chamado de teste selecionando EVERTON, mesma verificação. **Confirmado
      ao vivo pelo Felix em 2026-09-17 22:30 UTC** — exatamente o técnico do bug original.
      `ixc_debug.log`: ticket `808001` → OS `1912327` criada com sucesso,
      `id_contrato_kit: 8578` (contrato correto, resolvido dinamicamente), `status: AG`,
      técnico `59841`, `os_criada=true` na resposta final.
- [x] 5.3 Simular o caminho de falha de resolução e confirmar que: nenhuma OS existente é
      apagada, o ticket ainda é criado, e a resposta chega com `os_criada: false` e aviso.
      **Coberto por um caso real, não simulado**: antes da correção do achado "cliente 681
      tem 40 logins, não 1" (22:24-22:25 UTC), a resolução falhou de verdade em produção;
      o ticket `807999` foi criado normalmente (com o fallback de contrato da Seção 1), o
      PASSO 1 foi pulado ("não é seguro tentar criar OS"), nenhuma OS foi tocada, e a
      resposta chegou com `os_criada=false` — o Felix viu a tela de aviso "Chamado
      Registrado" no modal, confirmando o texto do aviso batendo com o log.
- [x] 5.4 Confirmar nos logs (`ixc_debug.log`) que a nova ordem do PASSO 2 aparece
      corretamente. **Confirmado na execução do ticket 808001**: `[PASSO 1] Falha ao criar
      OS manual (bloqueio por OS de workflow: true)` → só então
      `[PASSO 2] Deletando mensagens...` → `Deletando OS do workflow...` → `Criando OS
      manual...` → sucesso. A classificação do erro (`bloqueio por OS de workflow: true`)
      apareceu no log antes de qualquer deleção, como desenhado.
- [x] 5.5 Conferir visualmente no navegador o `TiSupportModal.jsx` nos dois desfechos.
      **Parcial**: o Felix confirmou ver a variante de aviso ("Chamado Registrado" + texto
      do aviso) e depois o fluxo de sucesso normal, ambos no tema em uso na sessão dele —
      não confirmado explicitamente em mais de um tema. Suficiente para considerar a
      variante funcional; verificação multi-tema fica como nice-to-have, não bloqueante.

## 6. Atualizar memória do projeto

- [x] 6.1 Registrar a decisão e o resultado da correção em `MEMORIA.md` (seção Ambiente,
      Pendências e Histórico de sessões), incluindo a causa raiz real (migração de contrato
      do login placeholder na IXC, achada via `radusuarios.login = 'escritorio.prestek'`,
      não por `id_cliente`) e a verificação ao vivo com o Everton, para referência futura
      caso o mesmo padrão de sintoma reapareça. Pendência de arquivar a change registrada
      também na nota.
