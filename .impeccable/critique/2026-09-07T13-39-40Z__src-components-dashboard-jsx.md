---
target: src/components/Dashboard.jsx
total_score: 15
max_score: 40
na_heuristics: 
p0_count: 3
p1_count: 2
target_identity: "file:F:\\Projetos em Dev\\prestek_intranet\\src\\components\\Dashboard.jsx"
target_fingerprint: "sha256:514c5055733ed44787938e49f0cb91b47429b9868bfc8ef7b9bb8f588ab0d52a"
target_path: "F:\\Projetos em Dev\\prestek_intranet\\src\\components\\Dashboard.jsx"
timestamp: 2026-09-07T13-39-40Z
slug: src-components-dashboard-jsx
closed: true
---
# Crítica de Design (re-execução) — src/components/Dashboard.jsx

## Placar de Saúde de Design

| # | Heurística | Nota | Problema-chave |
|---|---|---|---|
| 1 | Visibilidade do Status do Sistema | 2 | 3 widgets agora têm loading/erro corretos; 4 fetches no mesmo arquivo ainda engolem falha silenciosamente (banner, lista de comunicados, aniversariantes, equipe online) |
| 2 | Correspondência com o Mundo Real | 2 | PT-BR idiomático e bem cuidado, mas "Prestek Inc." no rodapé viola o manual de marca; "chamado" significa duas coisas diferentes na mesma tela |
| 3 | Controle e Liberdade do Usuário | 1 | Grid continua travado (isDraggable=false), contradizendo o PRODUCT.md; carrossel só pausa no hover do mouse |
| 4 | Consistência e Padrões | 2 | 4 raios de borda diferentes (nenhum bate com o DESIGN.md); o novo botão de retry introduz um 2º sistema de ícone; SetorBento erra em chassi diferente dos irmãos |
| 5 | Prevenção de Erros | 1 | 3 de 7 atalhos ainda abrem aba duplicada do próprio dashboard; bug novo achado: carregarPlantao esquece setPlantaoLoading(false) quando !user?.id, travando o card em "..." pra sempre |
| 6 | Reconhecimento vs. Memorização | 2 | Sparkline de "OS Fechadas" agora é dado real, mas ninguém explica que é semanal enquanto o número acima é mensal; "Sem SLA" fica com um buraco vazio sem explicação |
| 7 | Flexibilidade e Eficiência de Uso | 1 | Sem mudança — zero atalho de teclado, grid travado |
| 8 | Design Estético e Minimalista | 1 | Sem mudança — 9 glows decorativos fora da marca, duplo frame, ~220 linhas de código morto que ainda escrevem no localStorage |
| 9 | Reconhecer/Diagnosticar/Recuperar de Erros | 2 | A parte técnica do retry está bem feita (verificada linha a linha) — mas achamos uma regressão: usuário sem cadastro de técnico no IXC agora recebe um erro permanente e irrecuperável onde antes via só um "N/A" |
| 10 | Ajuda e Documentação | 1 | Sem mudança — "Sem SLA"/"Eficiência" seguem sem glossário; link "Diretrizes Internas" vai pra lugar nenhum |
| Total | | 15/40 | Faixa: Pobre (37%) — subiu de 13/40, mas o pass introduziu um bug novo tão grave quanto os que corrigiu |

Tendência para src-components-dashboard-jsx: 13 → 15 (de 40)

## Veredito de Especificidade de Design

Continua genérico — um template de bento-grid SaaS com strings em português. A Avaliação A desta vez achou um detalhe concreto que reforça isso: o GlowingEffect decorativo (usado 9 vezes) pinta um degradê rosa→dourado→verde→azul, quando a paleta da marca é laranja sobre azul-gelo. O gesto visual mais alto da tela mais vista do app está fora da marca.

Scan determinístico (Avaliação B): limpo de novo, 0 achados — confirma que os problemas continuam sendo estruturais, não mecânicos. Build também rodou limpo (npx vite build, sucesso, sem erro novo) — evidência de que o harden não quebrou nada tecnicamente, só deixou lacunas de produto.

Overlay visual: pulado de novo — sem ferramenta de navegador nesta sessão.

## Impressão Geral

O harden resolveu o que pediu pra resolver, mas revelou um padrão perigoso: corrigir alguns fetches e não outros deixa os que sobraram parecendo mais confiáveis por comparação. Numa queda parcial de backend hoje, OsBento/PlantaoBento/SetorBento diriam corretamente "não consegui carregar" — enquanto ComunicadoBanner, ComunicadosCard, AniversariantesCard e TeamBento continuariam mentindo "nenhum comunicado", "nenhum aniversariante", "0 online agora" com uma bolinha verde do lado. E o próprio fix introduziu uma regressão real: quem não é técnico de campo no IXC (a maioria da empresa, segundo o PRODUCT.md) agora vê um erro permanente sem solução, todo santo dia, onde antes só aparecia "N/A".

## O Que Está Funcionando

1. A parte técnica do retry está bem construída. carregarOs/carregarPlantao/carregarEficiencia são useCallback estáveis que resetam erro e loading antes de re-buscar, passados como onRetry, e agora checam r.ok antes de tentar fazer .json() — fechando um buraco real (resposta de erro com corpo HTML quebrando o parse). Clicar em "tentar novamente" de fato rechama o fetch certo.
2. O sparkline de "OS Fechadas" agora usa dado real — a Avaliação A conferiu no backend (server.js) que historico_semanal já tinha o campo total por semana, e o fix ligou nele corretamente.
3. A camada de formatação de nomes brasileiros continua sendo o código mais "Prestek" do arquivo — tratamento de partículas, fuso horário fixo em América/São_Paulo, normalização de CAIXA ALTA do IXC.

## Problemas Prioritários

[P0] O harden introduziu um erro permanente e irrecuperável pra maioria da empresa
Por quê importa: o backend responde HTTP 200 com sucesso: false, sem_dados: true para qualquer colaborador que não seja técnico de campo cadastrado no IXC — que é a maioria da empresa segundo o PRODUCT.md. O código novo trata qualquer sucesso: false como erro, então essas pessoas agora veem "Não foi possível carregar os dados do setor" com um botão "Tentar novamente" que vai falhar exatamente igual pra sempre. Pior que o zero silencioso de antes: um número errado quieto se ignora, um erro permanente ensina que o portal está quebrado.
Fix: distinguir os três casos no carregarEficiencia — sucesso real / sem_dados (mostrar "N/A", que o código já sabia fazer antes) / erro de verdade.

[P0] Continua tendo dado fabricado: o horário do plantão é sempre inventado
Por quê importa: a Avaliação A conferiu o endpoint no backend — o SELECT de /api/plantoes/meu-proximo não busca as colunas horario_inicio/horario_fim nenhuma vez, então o fallback hardcoded ('09:00'/'17:00') dispara sempre, pra todo mundo, e é mostrado com a mesma aparência de um dado real. Quem tem o plantão remarcado pra um horário diferente vê a informação errada com confiança total.
Fix: incluir horario_inicio, horario_fim no SELECT do backend; remover os fallbacks; mostrar "Horário a confirmar" quando vier nulo.

[P0] Comunicados continuam inacessíveis por teclado — e o carrossel nunca pausa pra quem não usa mouse
Por quê importa: era P0 na rodada anterior, ficou fora de escopo por decisão sua, ainda está lá. ComunicadoBanner e cada linha de ComunicadosCard são div onClick sem role/tabIndex; o carrossel avança a cada 6s e só pausa no onMouseEnter. Falha WCAG 2.1.1 e 2.2.2.
Fix: converter pra button reais; pausar também no foco; adicionar controle de pausa visível.

[P1] Viés de persona única — e ficou pior com a regressão acima
Por quê importa: OsBento + SetorBento ocupam metade do grid com métricas de técnico de campo. Pra quem não é técnico: "0 chamados, tudo em dia", "sem cobertura ativa", e agora um card de erro permanente. Três dos sete widgets são peso morto pra maioria da empresa, e o grid continua travado (isDraggable=false), contradizendo o PRODUCT.md.
Fix: condicionar os widgets de operação a quem é técnico cadastrado; ligar drag/resize de verdade ou trocar por outro layout.

[P1] SetorBento sobrepõe o card de Plantão no celular
Por quê importa: achado novo e mais preciso que antes — 3 KPI cards empilhados em telas xs precisam de ~508px, mas o grid só reserva 218px, sem overflow-hidden. Não é corte, é sobreposição real.
Fix: aumentar a altura da linha do SetorBento em telas pequenas, ou simplificar o card nesse breakpoint.

[P2] Excesso decorativo fora da marca + ~220 linhas de código morto que ainda escrevem no localStorage
Por quê importa: 9 instâncias de GlowingEffect pintando um degradê rosa/dourado/verde/azul — fora da paleta oficial. HeroCard/HeroBgModal continuam mortos, mas o efeito de heroBgImages ainda roda a cada carregamento gravando no localStorage.
Fix: reduzir/remover o glow ou retintar pra laranja da marca; apagar o código morto do Hero.

## Sinais de Alerta por Persona

Alex (técnico de campo, celular, entre atendimentos)
Os 3 KPI cards de eficiência sobrepõem o card de Plantão. O horário do próximo plantão mostrado pode estar simplesmente errado. O badge "3 pendentes" pulsa pra sempre por uma segunda-feira normal.

Sam (analista de RH, primeira coisa de manhã)
A tela saúda Sam pelo nome e imediatamente mostra um card de erro permanente onde deveria estar SetorBento. "Chamados no meu nome: 0, tudo em dia" ocupa o maior card da tela. Clicar em "Holerite" abre uma aba em branco duplicando o próprio dashboard.

Casey (TI, checando o portal durante uma queda parcial do IXC)
Metade dos widgets agora fala a verdade sobre a falha e a outra metade continua mentindo com confiança — o que é mais difícil de diagnosticar do que quando todos mentiam igual.

## Observações Menores

- sparkData={[]} no card "Sem SLA" é truthy — o wrapper do gráfico renderiza vazio em vez de simplesmente não aparecer; passar null seria mais direto.
- O fallback de sparkline da Eficiência (linha reta fabricada) continua no código, hoje inatingível, mas vale apagar.
- 3 requisições redundantes na carga: /api/comunicados (banner + card), /api/departamentos-empresa (aniversariantes + equipe).
- AvatarAniversariante trata foto quebrada caindo pra iniciais; TeamBento trata escondendo a imagem e deixando um círculo vazio.

## Perguntas Provocativas

1. O harden corrigiu os 3 fetches com número visível e deixou os 4 com lista visível — qual era a regra real?
2. Se os dois maiores widgets da home page só fazem sentido pra técnico de campo, por que essa é a home page da empresa inteira?
3. O glow decorativo custa um listener de mouse por card, em cores fora da marca, numa tela cujos problemas reais são um horário de plantão inventado, três atalhos quebrados e um card de erro permanente. O que ele realmente entrega?
