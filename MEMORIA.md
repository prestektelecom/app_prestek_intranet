---
tags: [projeto, prestek, claude-memoria]
repo: https://github.com/prestektelecom/app_prestek_intranet
---

# Prestek Intranet — memória do projeto

React/Vite/Tailwind + Express/PG + integração IXC. Cache é em memória
(`backend/cache.js`, `Map()` com TTL configurável por env var) — nunca teve Redis de
verdade; a dependência `redis` ficou órfã no `package.json` (nunca importada em
código) até ser removida em 2026-09-20, ver Decisões.

> Esta nota é a memória persistente do Claude Code para o projeto. Ela é importada
> pelo `CLAUDE.md` e carregada em toda sessão. Pode ser editada livremente pelo
> Obsidian (o projeto fica dentro do vault); o Claude também escreve aqui.
> Nota-índice no vault: [[prestek-intranet]].

## O que é

Portal interno da Prestek: comunicados, ramais e serviços, chamados de TI
(via IXC) e plantões. Detalhes técnicos em `CONTEXTO_IA.md`, convenções de
responsividade em `AGENTS.md`, design em `DESIGN.md`.

## Ambiente

- Código local: `F:\vault\20 Projetos\prestek_intranet` (dentro do vault Obsidian)
- Produção: destino do deploy definido em 2026-10-03: `/home/antonio/app_prestek_intranet` (servidor `201.150.48.6`, usuário `antonio`, sem root). Antes constava `/root/prestek_intranet`. A senha nunca vai para nota ou arquivo: trocar por chave SSH.
- Cliente placeholder de chamados internos de TI na IXC: `id_cliente = 681` ("escritório
  Prestek"). Tem **40 logins** (uma unidade/filial da Prestek por login, ex.: `igrejanova`,
  `piacabucu`, `canabrava`) — NÃO tem um login só. O usado para abrir chamado de TI é
  identificado pelo nome de usuário `radusuarios.login = 'escritorio.prestek'`, não por
  contagem nem por um `id` fixo (o `id_contrato` vinculado a esse login muda por fora, via
  renovação/migração na IXC — já causou um incidente real, ver Pendências/Histórico
  2026-09-17). O assunto usado no ticket (`id_assunto = '1154'`, "SOLICITAR ATENDIMENTO AO
  SETOR DE T.I.") tem `contrato_obrigatorio: "S"` e `login_obrigatorio: "N"` em
  `su_oss_assunto` — por isso o ticket sempre exige um `id_contrato` válido, mas nunca exigiu
  que ele batesse com o login.
- **Não existe staging.** `backend/.env` aponta para o Postgres e o IXC de produção: subir o backend local já é produção. Teste com instância isolada (porta 3002, JWT assinado localmente com o `JWT_SECRET`), contas de teste e leitura primeiro; escrita só com autorização do Felix.
- O painel chama a API por URL absoluta (`VITE_API_URL`, padrão `localhost:3001`): um front de teste em outra porta precisa de `VITE_API_URL` e `CORS_ORIGENS` apontados para a instância de teste.
- `migrations/run.js` reexecuta TODOS os `.sql` e engole erros: nunca rodar inteiro em produção, aplicar só o arquivo novo (via `pg`, o `psql` não existe nesta máquina).
- `openspec archive` costuma dar EPERM no rename da pasta: sincronizar as specs à mão e mover por cópia+remoção.

## Decisões

- 2026-10-01: **equipe de cada setor ajustável só na intranet** (change `setores-membros-manuais`): tabela local `setores_membros_manuais` (migration 024, aplicada em produção em 2026-10-01 só com o arquivo 024), um ajuste por par (setor, pessoa) com ação `incluir` ou `excluir`; equipe efetiva = IXC + incluídos − excluídos, só funcionários ativos, regra de ATENDIMENTO aplicada antes. O IXC nunca é escrito. Uma pessoa pode estar em mais de um setor (o do IXC segue como principal). **Ajustes em Suporte (15) e Relacionamento (68) são recusados** (têm cartão em Setores mas só o chip ATENDIMENTO em Colaboradores; a equipe deles se ajusta pelo ATENDIMENTO). Plantão e Organograma NÃO mudam (Plantão decide quem pode ser escalado e continua no departamento oficial do IXC). A regra existe em duas cópias que um script compara (`scripts/testar-equipe-setor.mjs`): `backend/services/equipeSetor.js` (equipe de um setor) e `src/utils/setoresDaPessoa.js` (setores de uma pessoa, que também passou a ser o dono único do agrupamento de ATENDIMENTO que estava no `Directory.jsx`). Edição na aba Responsáveis do Painel Admin (botão "Equipe" por setor, `EquipeSetor.jsx`, confirmação inline nominal), `gate('usuarios')`, Auditoria `setor_membro_incluir/excluir/desfazer`.
- 2026-09-30: **permissões de gestão por capacidade** (change `permissoes-por-capacidade`): tabela local `usuarios_permissoes` (migration 023, aplicada em produção em 2026-09-30 só com o arquivo 023, sem `run.js`; o `psql` não existe nesta máquina, então foi via `pg`), catálogo `comunicados`/`plantao`/`usuarios`/`auditoria`/`ti`, `is_admin` = todas. O acesso é lido do banco a cada requisição (`backend/middleware/permissoes.js`), nunca do JWT, para a revogação valer na hora; só `is_admin` concede. Rotas de administração pura (privilégios, configurações, cobertura, processos) seguem só `is_admin`. **Rejeitado:** usar `nome_grupo` do IXC (texto editável, um grupo por usuário, outro propósito). Esta change não muda a navegação: um não-admin com permissões só alcança a API até a `gestao-no-shell`. Bug achado em produção: a 1ª versão da consulta não tinha `p.is_admin` no `GROUP BY` (só a PK dispensa isso, `usuario_id` é `UNIQUE`) e derrubava toda rota de gestão com 503; o teste com `pool` falso não pega SQL, sempre rodar a consulta no banco real.
- 2026-09-30: **Painel Admin sai do overlay e entra no shell** (change futura `gestao-no-shell`): view "Gestão" com abas de 2º nível por permissão e URL por aba; corta a aba "Visão Geral" (o feed vira parte de Auditoria); "TI" continua item próprio em Administração; Histórico de plantões vira aba. Entrega em 2 changes encadeadas, primeiro permissões, depois navegação.
- 2026-09-30: **visibilidade de telas por departamento** (change futura `visibilidade-por-departamento`): só esconde, não protege rotas de leitura (escolha do Felix: o objetivo é organizar o menu, não confidencialidade). Grupo = `id_departamento` do IXC, automático. Cada departamento é "Sem restrição" (padrão, comportamento de hoje) ou "Restrito" (vê só o piso + as telas marcadas); lista branca pura derrubaria o menu de todos no dia do lançamento. Piso fixo: Início e Configurações. `is_admin` vê tudo. Configuração numa aba nova do Painel Admin atual, só `is_admin` (migra para a Gestão depois). Atalhos do Dashboard e do sino para telas escondidas também somem. Barra inferior do celular: só os slots que sobram + "Mais". A regra vale ao abrir o app (`GET /api/permissoes/minhas`); troca de departamento vale no próximo login.
- 2026-09-28: repositório fica só com a `main`. `correcoes_memoria` e `universalizar-bento-blue` já estavam 100% na `main` e foram apagadas; `decisoes` foi mesclada (merge direto na `main`, sem PR, escolha do Felix) e apagada; `chore/z-index-migration` tinha trabalho não mesclado e virou a tag `archive/z-index-migration` (ver Pendências). Antes de apagar uma branch, conferir `git rev-list --count main..origin/<branch>` = 0.
- 2026-09-20: `migrations/run.js` reexecuta TODOS os `.sql` a cada rodada, então seed com `ON CONFLICT DO NOTHING` em tabela sem chave única duplica linhas a cada execução (Serviços Técnicos chegou a 117 = 13×9; Streaming 63). Migration 009 corrigida (semeia só com tabela vazia) e duplicatas apagadas em produção (117→15, 63→8) com aprovação do Felix. `010_cobertura_cidades.sql` tinha o mesmo padrão e foi corrigido em 2026-09-28 (semeia só com tabela vazia, igual à 009) — a tabela não é totalmente legada: `server.js` (~linha 3323) ainda lê `cobertura_cidades`. **Não verificado se a produção já tem linhas duplicadas** dessa tabela (o seed são só 4 linhas de exemplo); checar `SELECT cidade, bairro, COUNT(*) FROM cobertura_cidades GROUP BY 1,2 HAVING COUNT(*)>1` e limpar só com aprovação do Felix. Migration nova com seed: sempre idempotente.
- Cores: #F5F9FF / #EC7D23; z-index definido em DESIGN.md §6
- 2026-09-08: memória persistente do Claude Code fica nesta nota, importada via
  `@MEMORIA.md` no `CLAUDE.md`. Imports de fora da pasta do projeto não carregam,
  por isso a nota mora aqui e não em `20 Projetos/prestek-intranet.md`.
- 2026-09-18: tela de Login reescrita para a estética "Neural Access" (referência
  trazida pelo Felix, um componente React/TS solto, sem shadcn/Tailwind config
  no projeto de origem). Layout de dois painéis antigo (`LoginBrandPanel.jsx`,
  `LoginForm.jsx`, `Icons.jsx`) removido por completo; virou um `Login.jsx`
  único, full-bleed preto, com blobs de mercúrio (filtro SVG goo + blur),
  parallax de mouse, campos underline com glow e botão com squish de mercúrio.
  Mantido de propósito, apesar do "deixa igualsinho" pedido: rótulos reais em
  português (e-mail/senha, não "User Identity"/"Sequence Key" do componente
  original), toda a lógica de `useLogin` (validação por campo, banner de
  servidor fora, "Manter conectado", mostrar/ocultar senha) e a decisão de
  2026-09-10 contra link sem destino (os 2 links decorativos do componente
  original viraram texto puro). Fontes trocadas para as já auto-hospedadas do
  projeto (Plus Jakarta Sans/JetBrains Mono) em vez do Google Fonts do
  componente original, pra não quebrar a convenção "sem dependência externa"
  do `index.html`. 2 achados reais de layout-thrash do hook de design
  (`margin`/`width` animados) corrigidos trocando por `transform`/`@property`;
  o bounce do botão foi mantido e registrado como exceção intencional
  (`ignore-value bounce-easing`) por ser a identidade do próprio efeito
  pedido, não um easing padrão esquecido. Felix avisou que vai pedir ajustes
  na sequência ("depois modificamos") — sem itens concretos ainda, não virou
  Pendência.

## Pendências

> **Lista única e atual: `PENDENCIAS_PRODUCAO.md`.** O histórico detalhado (itens concluídos, decisões do programa Impeccable, decisões de segurança e o diário de sessões) está em [[MEMORIA-historico]].

**Item em standby cujo detalhe só existe aqui:**

- [ ] **Canal de denúncia anônimo — em standby, retomar depois (explorado em 2026-10-02, nada implementado, sem change criada).** Requisitos do Felix: ninguém, nem a TI, consegue saber quem enviou nem ler o texto; só o RH lê. Decidido: o RH recebe por e-mail em `rh@prestek.com.br` e `rhprestek@gmail.com`; sem resposta ao denunciante (sem código de acompanhamento); só texto, anexo opcional de até 5 MB; página **dentro da intranet logada** (escolha do Felix, por ser mais simples). Desenho proposto: cifrar no navegador com a chave pública do RH (WebCrypto), a chave privada fica só com o RH (nunca no servidor) e uma página "Decifrar" local abre o conteúdo; envio por rota **fora de `/api`** (sem `requireAuth`, o patch de `fetch` do `main.jsx` só anexa o token a `/api`); IP nunca gravado (limitador de spam só em memória); atraso aleatório de 1 a 24 h antes do e-mail para não casar com `/api/presenca`; remover metadados de anexos. **Riscos a lembrar ao retomar:** (1) estando logada, o log de acesso do nginx mostra quem abriu a página, então é preciso desligar o log dessa rota ou aceitar o risco; **não foi verificada a config do nginx nem o servidor de e-mail em produção**; (2) o Gmail é externo, então só a cifra protege o conteúdo lá; (3) se o RH perder a chave privada, as denúncias antigas ficam ilegíveis; (4) o texto pode se identificar sozinho, avisar na tela; (5) conversar com RH/jurídico sobre exigências legais de canal de denúncia. Ao retomar: `/opsx:propose`, e passar pelo `/impeccable` (é UI).
