---
target: src/components/Dashboard.jsx
total_score: 13
max_score: 40
na_heuristics: 
p0_count: 3
p1_count: 2
target_identity: "file:F:\\Projetos em Dev\\prestek_intranet\\src\\components\\Dashboard.jsx"
target_fingerprint: "sha256:128d87d26ceed7650febf021d99ee9f35406a10a73e8ffb69b8fb6c3b814aea0"
target_path: "F:\\Projetos em Dev\\prestek_intranet\\src\\components\\Dashboard.jsx"
timestamp: 2026-09-07T12-59-50Z
slug: src-components-dashboard-jsx
---
# Crítica de Design — `src/components/Dashboard.jsx`

## Placar de Saúde de Design

| # | Heurística | Nota | Problema-chave |
|---|---|---|---|
| 1 | Visibilidade do Status do Sistema | 1 | Skeletons parciais, KPIs mostram '...' sem aria-busy. Falha grave: falha de backend renderiza como página saudável |
| 2 | Correspondência com o Mundo Real | 2 | Vocabulário PT-BR forte, mas "Sem SLA"/"Eficiência" sem glossário, clima fabricado |
| 3 | Controle e Liberdade do Usuário | 1 | Grid isDraggable=false contradiz o PRODUCT.md; carrossel só pausa no hover do mouse |
| 4 | Consistência e Padrões | 2 | Dois sistemas de cor pra mesma categoria (banner vs card); emojis como ícone num app com biblioteca SVG própria |
| 5 | Prevenção de Erros | 2 | 3 de 7 atalhos abrem aba em branco (href="#"); clique em qualquer lugar do banner navega, sem confirmação |
| 6 | Reconhecimento vs. Memorização | 2 | Labels de 9.5px truncados com significado só em title= (inacessível no toque) |
| 7 | Flexibilidade e Eficiência de Uso | 1 | Zero atalho de teclado; o único mecanismo de personalização existe no código e está desligado |
| 8 | Design Estético e Minimalista | 1 | 9 cards com glow decorativo, duplo frame, clima falso, ~230 linhas de código morto |
| 9 | Reconhecer/Diagnosticar/Recuperar de Erros | 0 | Nenhum estado de erro existe no arquivo — 9 fetch(), 9 .catch(() => {}) |
| 10 | Ajuda e Documentação | 1 | Só 2 tooltips; link "Diretrizes Internas" vai pra lugar nenhum |
| **Total** | | **13/40** | **Faixa: Pobre (32%)** — reforma relevante de UX necessária |

## Veredito de Especificidade de Design

Cerca de 20% autoral, 80% template. Tirando as strings em português, o que sobra é o kit-padrão de dashboard SaaS de 2024: saudação com emoji, chip de clima, relógio ao vivo, carrossel full-bleed, bento grid, sparklines com pílulas verde/vermelho, glow decorativo em todo card.

O que é genuinamente da Prestek: o vocabulário de status do IXC em OsBento (AS/EN/EX/AG/A/AN), o conceito de plantão, o tratamento de nomes brasileiros em AniversariantesCard (excluir "da/de/do" na detecção de sobrenome), e o atalho "Reservar Sala" que abre WhatsApp com DDD de Alagoas — a linha mais específica do arquivo inteiro.

Contra a especificidade: o chip de clima mostra "24°C" literal, hardcoded, nunca lido de lugar nenhum (o estado location.temp é escrito e nunca usado); o rodapé diz "© 2026 Prestek Inc." quando a marca é Prestek Telecom (com manual de marca vinculante no repo) e "Inc." nem é forma jurídica brasileira; e o PRODUCT.md diz que a Prestek é multi-unidade/multi-cidade — a única geografia na tela inteira é a cidade do IP do usuário, citada pra legendar uma temperatura fake.

Scan determinístico (Avaliação B): impeccable detect --json voltou limpo, 0 achados. Isso não contradiz nada do que a Avaliação A encontrou — confirma que os problemas aqui são estruturais/qualitativos (hierarquia, estados de erro, dados fabricados, acessibilidade de teclado), exatamente o tipo que um scanner mecânico não pega.

Overlay visual: pulado — nenhuma ferramenta de automação de navegador está disponível nesta sessão. Nenhuma captura/overlay foi gerada.

## Impressão Geral

O maior problema não é visual, é de confiança e cuidado: a tela mais vista do app mostra dados inventados (clima, sparklines com 7 de 8 pontos hardcoded, uma promessa de "~12 min" de SLA sem fonte) e não tem estado de erro nenhum — uma queda de backend renderiza como um dia perfeito ("Tudo em dia", zero pendências, zero comunicados). Para um portal interno de operações de telecom, isso é o oposto do que a ferramenta precisa fazer. A maior oportunidade: cortar a "mobília" decorativa (glow em 9 cards, clima falso, ~230 linhas de HeroCard morto) e investir esse espaço em hierarquia real e em dizer a verdade quando algo falha.

## O Que Está Funcionando

1. AniversariantesCard trata nomes brasileiros de verdade — exclui partículas ("da/de/do/das/dos/e") da detecção de sobrenome, então "VITOR SANTOS DA SILVA" vira "Vitor Silva", não "Vitor Da". É engenharia de domínio real, não decoração.
2. Estados vazios específicos e honestos — ComunicadosCard distingue "Nenhum comunicado recente" de "Nenhum outro comunicado" (ou seja, "não há nenhum" vs "o único já está em destaque acima"). Sparkline retorna null em vez de desenhar uma linha reta enganosa quando há menos de 2 pontos.
3. OsBento inverte a própria composição no dia bom — quando osCount === 0, remove a grade de 4 KPIs inteira (em vez de mostrar quatro zeros), troca o badge de âmbar pulsante pra verde calmo, e escreve uma frase tranquilizadora. É a única vez no arquivo que "nada está errado" é tratado como um estado desenhado, não degenerado — prova que a equipe sabe fazer isso, só não aplicou em nenhum outro lugar.

## Problemas Prioritários

**[P0] Toda falha de backend renderiza como boa notícia**
Por quê importa: 9 fetch(), 9 .catch(() => {}). Um técnico que abre o portal durante uma queda do IXC vê "0 chamados, Tudo em dia ✓" e "Sem cobertura ativa" — e vai agir como se fosse verdade. É especialmente perigoso porque o momento em que a ferramenta mais precisa ser honesta é exatamente quando ela mente com mais confiança.
Fix: estado erro por fonte de dado; inicializar contagens como null (não 0) e tratar null como "desconhecido"; nunca renderizar estado-vazio a partir de um valor nunca buscado.
Comando sugerido: /impeccable harden

**[P0] Dados fabricados na superfície mais confiada do app**
Por quê importa: "24°C" hardcoded nunca lido de estado real; sparklines de "OS Fechadas"/"Sem SLA" com 7 de 8 pontos fixos no código; "Tempo médio: ~12 min" sem fonte nenhuma. Viola diretamente o princípio 1 do PRODUCT.md ("dados do IXC são autoritativos — nunca falsificar"). Um técnico que perceber que a curva do sparkline repete todo mês vai parar de confiar no resto do dashboard também.
Fix: apagar o chip de clima ou ligar a fonte real; renderizar sparkline só com eficiencia.historico_semanal de verdade (ou array vazio); apagar a claim de "~12 min".
Comando sugerido: /impeccable harden

**[P0] Usuário de teclado/leitor de tela não alcança nenhuma das duas superfícies de comunicados**
Por quê importa: ComunicadoBanner e cada linha de ComunicadosCard são <div onClick> sem role, tabIndex ou handler de teclado. Comunicados é uma razão central de existência do produto (per PRODUCT.md) e fica inacessível via teclado a partir da home. O carrossel também roda a cada 6s e só pausa no onMouseEnter — falha WCAG 2.2.2 (Pause, Stop, Hide).
Fix: converter banner e linhas pra <button> reais com nome acessível; adicionar controle de pausa visível, pausar também no foco; envolver animações em motion-safe:.
Comando sugerido: /impeccable harden

**[P1] Construído pra uma persona só, entregue pra empresa inteira**
Por quê importa: nenhuma renderização condicional por cargo/setor existe no arquivo. OsBento, SetorBento e PlantaoBento (instrumentos de técnico de campo) ocupam a metade superior inteira do grid, acima da dobra, pra todo mundo — inclusive um analista de RH, que vê "Eficiência N/A, OS Fechadas –, Sem SLA 0" como as primeiras 4 informações do seu dia. Contradiz o próprio PRODUCT.md ("não é uma ferramenta de um único setor").
Fix: condicionar os widgets de operação ao departamento/cargo; promover Comunicados/Atalhos/Aniversariantes pro topo pra quem não é técnico.
Comando sugerido: /impeccable shape

**[P1] react-grid-layout paga o custo todo e não entrega o benefício — e quebra no celular**
Por quê importa: isDraggable/isResizable desligados, sem persistência — a promessa do PRODUCT.md ("os usuários podem reorganizá-lo") é falsa. Pior: altura fixa em pixels (rowHeight={100}) com overflow-hidden corta conteúdo em vez de reorganizar — em telas xs/xxs, o card "Sem SLA" fica literalmente cortado e inalcançável no celular, e o mesmo mecanismo quebra zoom de 200%.
Fix: ou ligar drag/resize de verdade com persistência, ou trocar por um grid CSS simples com alturas intrínsecas — as duas opções resolvem o corte no mobile.
Comando sugerido: /impeccable adapt

## Sinais de Alerta por Persona

**Alex (usuário avançado, técnico de TI, abre o painel 20×/dia)**
Os mini-KPIs são becos sem saída — vê "Agendadas: 3" mas não há como clicar; o único caminho é "Gerenciar Meus Chamados", que abre uma lista sem filtro, e ele tem que reencontrar os 3 manualmente. O grid está congelado (promessa do PRODUCT.md quebrada). Sem timestamp de atualização — osCount/eficiencia/plantao buscam uma vez no carregamento e nunca mais, então às 16h o número da manhã ainda está lá sem indicação nenhuma de que está desatualizado. Em dois meses ele vai notar que o sparkline de "OS Fechadas" tem a mesma forma todo mês — e ele é exatamente quem vai contar pra todo mundo que o dashboard é fake.

**Sam (dependente de acessibilidade, leitor de tela + teclado, zoom 175-200%)**
O maior elemento interativo da página é invisível pra ele (banner sem role/tabIndex). Conteúdo muda sob o cursor a cada 6s sem pausa alcançável. No zoom de 200%, o grid corta em vez de reorganizar — o botão principal "Gerenciar Meus Chamados" fica inalcançável numa caixa que não pode crescer. Emojis são anunciados como palavras ("⚡ Assumidas" vira "alta voltagem Assumidas"). Nada anuncia chegada assíncrona de dados (aria-live ausente).

**Casey (usuária móvel distraída, técnica de campo, um polegar, dentro de uma van)**
"Sem SLA" — a métrica mais relevante pro dia dela — fica literalmente cortada fora da tela no celular. Os pontos de paginação do carrossel são de 8px (bem abaixo do mínimo de toque de 44px) e ficam dentro do card clicável — mirar num ponto e acertar "ir pra Comunicados" por engano é fácil. Três dos sete atalhos abrem aba em branco no celular. O chip de clima pode estar errado nos dois sentidos (cidade errada pelo IP do provedor, temperatura sempre 24°C).

## Observações Menores

- ~230 linhas de código morto: HeroBgModal, HeroCard, resizeImageToDataUrl nunca são renderizados, mas o efeito de heroBgImages continua escrevendo no localStorage a cada carregamento.
- 9 instâncias de GlowingEffect, cada uma registrando listener de pointermove no document.body e de scroll na window — 9 layouts forçados a cada movimento de mouse na página mais visitada do app.
- Requisições duplicadas: /api/comunicados é buscado duas vezes (banner + card); /api/departamentos-empresa também (aniversariantes + equipe).
- TeamBento mostra um número errado: corta a lista em 7 (.slice(0,7)) mas exibe {members.length} online agora — com 12 online, mostra "7 online agora".
- KpiCard usa Icons.Check pra variação positiva quando Icons.TrendUp existe e não é usado — "+6%" marcado como "correto", não "melhorou".
- Rodapé: "© 2026 Prestek Inc." (marca é Prestek Telecom), dois links href="#".

## Perguntas Provocativas

1. Se você apagasse todo número desta tela, o que sobraria — e alguém sentiria falta dos números? Nada aqui hoje é uma lista de tarefas; tudo é um relatório.
2. Como seria o dashboard de um analista de RH — e se você desenhasse esse primeiro, este ainda seria o padrão pra todo mundo?
3. A Prestek é multi-unidade e multi-cidade, e a única geografia na tela vem de um IP adivinhando a cidade pra legendar uma temperatura falsa. Como ficaria "Plantão" se soubesse qual unidade da Prestek é a sua?
