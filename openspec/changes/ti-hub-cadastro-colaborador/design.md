# Design — Aba TI + Cadastro de Colaborador

## Decisão 1 — Hub com registry, não uma aba por ferramenta

O projeto não tem router. `currentView` é uma string em `App.jsx:46` e a renderização é uma cadeia de `&&`. Registrar uma view custa:

```
App.jsx      ①  import
App.jsx      ②  linha de render
App.jsx:173  ③  o array de ids válidos      ← esquecer aqui renderiza a página E o NotFound
Sidebar.jsx  ④  menuItems
MobileDrawer ⑤  menuItems
MoreSheet    ⑥  secondaryItems
Icons.jsx    ⑦  um SVG novo
```

Sete edições, quatro arquivos, sem fonte única de verdade — as mesmas entradas de menu estão escritas quatro vezes. E a `MobileBottomNav` tem **4 slots**; a partir do quinto item, tudo cai no bottom sheet "Mais".

Com N ferramentas de TI previstas, as duas topologias divergem rápido:

```
 A) HUB (escolhida)                     B) UMA ABA POR FERRAMENTA
 ────────────────────────               ────────────────────────────
 custo de registro: 7 edições, 1×       custo: 7 edições × N
 crescimento: +1 objeto no registry     crescimento: +1 item de menu
 menu: 1 entrada                        menu: N entradas (já tem 8)
 mobile: 1 vaga no MoreSheet            mobile: N vagas disputadas
```

O registry é a peça que torna isso verdade:

```js
export const FERRAMENTAS_TI = [
  { id, label, icon, descricao, somenteAdmin, Component },
];
```

`Ti.jsx` nunca importa uma ferramenta específica — só percorre o array. **Critério de aceitação da decisão:** adicionar uma segunda ferramenta não pode tocar em `Ti.jsx`, em `App.jsx` nem em nenhum arquivo de navegação. Está como tarefa verificável em `tasks.md`.

## Decisão 2 — Dry-run antes de gravar

`funcionarios` e `usuarios` têm FK **circular**:

```
funcionarios.usuario_id  ────────►  usuarios.id
usuarios.funcionario     ◄────────  funcionarios.id
```

Não há como criar os dois numa requisição. A sequência mínima é:

```
   ① POST /webservice/v1/funcionarios   (ixcsoft: incluir)   ──► id_func
            │
            │  ✗ falha aqui → nada foi criado, estado limpo
            ▼
   ② POST /webservice/v1/usuarios   { funcionario: id_func } ──► id_user
            │
            │  ✗ falha aqui → FUNCIONÁRIO ÓRFÃO no ERP, sem login,
            │                 invisível para quem não souber procurar
            ▼
   ③ GET  /webservice/v1/funcionarios/{id_func}      (relê o registro inteiro)
      PUT  /webservice/v1/funcionarios/{id_func}
           { ...registro_relido, usuario_id: id_user }
            │
            │  ✗ falha aqui → vínculo pela metade: o usuário aponta para o
            │                 funcionário, mas não o contrário
            ▼
         concluído
```

O passo ③ relê antes de escrever porque **o IXC sobrescreve o registro inteiro num PUT** — mandar só `{usuario_id}` apagaria os outros 120 campos. É o padrão já usado em `server.js:1003-1024`.

Três agravantes tornam a gravação direta imprudente na v1:

1. **Não há transação nem rollback.** Compensar a falha de ② significa deletar ou inativar o funcionário recém-criado — uma decisão de produto que ninguém tomou ainda.
2. **O `incluir` tem um único precedente no projeto.** Em ~4.000 linhas de `server.js`, o único `ixcsoft: 'incluir'` está em `su_oss_chamado` (linha 1999). A forma da resposta (`{type:'success', id}`) está comprovada para *aquele* recurso, não para `funcionarios`.
3. **Sete campos obrigatórios, dois deles FKs que a ficha não tem.** `cidade` é id numérico (exige lookup por nome+UF) e `id_conta` aponta para `planejamento_analitico` — conta contábil.

O dry-run resolve tudo isso *menos* o envio: monta os payloads, resolve os FKs de verdade contra o IXC, valida contra o schema real, e exibe as três requisições. O operador confere contra o ERP e a gravação vira uma change separada, com o desenho acima já validado na prática.

**Ponto de extensão:** `ixcColaborador.js` expõe `montarPlano()`, cujo retorno é diretamente executável. `POST /api/ti/colaborador/criar` existe como stub `501` com o algoritmo em comentário. A fase 2 é preencher o stub, não redesenhar.

## Decisão 3 — Confiança por campo, não "extraiu / não extraiu"

Um extrator de PDF que devolve só valores produz um formulário que **parece** preenchido e correto. O erro caro não é o campo que veio vazio (visível), é o campo que veio errado com aparência de certo — um CPF capturado da linha do cônjuge, um "Nome" que na verdade era "Nome da Mãe".

Por isso a extração devolve `{ campos, confianca }`, e o score é **a estratégia que acertou**:

| Estratégia | Como | Score |
|---|---|---|
| A | rótulo e valor na mesma linha (`Nome: João`) | **1.0** (0.75 se o valor for texto livre) |
| B | rótulo isolado, valor na linha seguinte | **0.5** |
| C | `padraoGlobal` no documento inteiro (regex de CPF/CEP/e-mail/telefone, sem rótulo) | **0.35** |
| — | não encontrado | **0** |

Modificadores: normalizador que **invalida** o valor (CPF com DV errado) derruba para 0.35 e mantém o valor cru; texto vindo de **OCR** multiplica por 0.7 — o que na prática coloca *tudo* que veio de ficha escaneada em estado "confira", que é o comportamento correto.

A UI traduz score em atenção visual: `≥ .75` limpo, `.35–.75` ring âmbar com ícone `help`, `< .35` ring âmbar com `priority_high` e hint explícito, obrigatório ausente em ring vermelho.

Duas consequências de projeto que caem daí:

- **Rótulos casados do mais longo para o mais curto.** Senão `'nome'` captura a linha `'Nome da Mãe:'` antes de `'nome da mae'` ter chance. É a fonte de erro silencioso mais provável do parser.
- **Cidade nunca é chutada.** O parser devolve `_cidade_texto` e `_uf_texto`; o front consulta a tabela `cidade` do IXC e só pré-seleciona quando há **exatamente um** resultado.

> ⚠️ **`funcionarios.uf` não acompanha `cidade.uf` — medido, não suposto.** Ver Decisão 11.

## Decisão 4 — Cascata de extração, com o manual sempre disponível

As fichas em uso são de três origens: PDF digital, PDF exportado do Word, e digitalização/foto.

```
        Buffer
          │
   assinatura %PDF- ──── ausente ──► 400
          │
          ▼
   pdf-parse v2 · getText()
          │
   texto útil (sem espaços) ≥ 200 chars ?
          │
    ┌─────┴─────┐
   sim         não
    │           │
    ▼           ▼
 origem:    getScreenshot() → PNG por página
 'texto'         │
    │            ▼
    │      tesseract.js · 'por'  (confiança × 0.7)
    │            │
    │       ┌────┴────┐
    │    texto     nada
    │       │         │
    │       ▼         ▼
    │  origem:'ocr'  origem:'nenhum' → 200 + aviso âmbar
    └───────┬─────────────────────────────────┘
            ▼
      fichaParser.extrairCampos(texto)
```

**Digital e Word são o mesmo caminho** — ambos têm camada de texto. A diferença é ruído de layout (o Word gera mais quebras de linha soltas), absorvida na normalização: colapsar espaços e nbsp, remover soft-hyphen, `split('\n').map(trim).filter(Boolean)`.

**Nenhum ramo dessa árvore retorna erro para o usuário.** `origem: 'nenhum'` é HTTP 200 com aviso — o formulário destrava e o cadastro manual segue. Isso é o que permite as fases 2-3 (formulário) irem para produção antes das fases 4-5 (extração).

O OCR é a peça mais cara do projeto: wasm + ~15MB de modelo `por.traineddata` baixado no primeiro uso, e 3-8s por página. Por isso está isolado numa fase própria — se pesar demais, sai sem quebrar nada acima dele.

## Decisão 5 — Upload sem `multer`

`backend/package.json` tem cinco dependências, de propósito. Para **um** arquivo, sem campos adicionais, `multipart/form-data` não paga o próprio custo:

```js
app.post('/api/ti/colaborador/extrair-pdf',
  adminAuth,
  express.raw({ type: 'application/pdf', limit: '15mb' }),
  handler);   // req.body é um Buffer
```

O `express.json()` global (`server.js:120`) ignora `application/pdf`, então não há conflito de ordem. Sem multipart, sem arquivo temporário, sem disco — o buffer vive na requisição e morre com ela. **O PDF nunca é persistido.**

`multer` entra quando (e se) alguma ferramenta futura precisar de múltiplos arquivos ou de campos junto do binário.

## Decisão 6 — Extrair `backend/services/ixc.js`, mas só os helpers

`server.js` tem ~4.070 linhas e ~25 rotas que montam `token`/`headers` do IXC **inline**, cada uma repetindo as mesmas quatro linhas. É tentador limpar tudo de uma vez. Não nesta change.

O que se move — `fetchIXC` (14-34), `ixcHeaders` (36-44), `paginarIXC` (59-113) — vai **verbatim**, sem uma linha alterada no corpo, e `server.js` reimporta. Diff pequeno, comportamento idêntico, verificável com `grep -c`.

O que **não** se move: as ~25 rotas que duplicam o header à mão. Refatorá-las é uma limpeza legítima e uma change própria; misturá-la aqui tornaria impossível revisar esta.

Helpers novos no módulo: `ixcUrl()`, `ixcListar()` (usado pelas rotas desta change) e `ixcIncluir()`/`ixcAtualizar()` — escritos agora, chamados só na fase 2.

> ⚠️ A URL real é `https://${IXC_HOST}/webservice/v1/${recurso}` com `POST` + header `ixcsoft`. A documentação em `docs/querys_ixc_prestek/` descreve `/api/v1/<form>/` com verbos REST — **está errada para este ambiente**. A referência é `server.js`.

## Decisão 7 — Cachear a tabela `cidade` inteira

O type-ahead de cidade poderia consultar o IXC a cada tecla. Não vai: a tabela é estática (~5.6k linhas), então é puxada **uma vez** com `paginarIXC` (`rp: 9999`, `concorrencia: 1`, `timeoutMs: 120000`, `projetar` para 4 campos), cacheada por 24h e filtrada em memória.

Custo: um request frio lento, uma vez por dia. Benefício: busca instantânea, zero chamada ao IXC por tecla, e o `uf` correto vem junto do registro. `TTL.IXC_CIDADES` acompanha `TTL.IXC_UF`, que já usa 24h pelo mesmo motivo.

## Decisão 8 — Credencial e senha nunca no cliente

Herança direta do que o protótipo faz de errado. Três regras, verificáveis:

1. **Nenhuma rota aceita config do IXC vinda do cliente.** Host, usuário e token saem de `backend/.env`. O painel "Configurações IXC" do protótipo simplesmente não existe na tela.
2. **A senha padrão vem de `IXC_SENHA_PADRAO_COLABORADOR`.** O campo na UI é override opcional, `type="password"`.
3. **A senha em texto puro nunca volta.** Não aparece no `plano` do dry-run, não entra em `console.log`, não entra em `auditoria_logs`. O que a tela mostra é `sha256(••••••)` com toggle "revelar hash" — SHA-256 hex sem salt, idêntico ao que `server.js:245` valida no login.

## Decisão 9 — Espaçamento da Central de Vendas, breakpoint em `xl`

A change `coverage-layout-proporcional` já estabeleceu que Central de Vendas é a referência de espaçamento do projeto: `md:px-10`, `max-w-[1200px]`, `py-8`, `gap-8`. A aba TI adota isso — e não o `gap-6`/`py-4` da Cobertura, que são uma exceção justificada por aquela página ter altura travada por causa do mapa.

O split do formulário e do painel lateral acontece em **`xl` (1280), não em `lg`**, pela razão documentada em `Coverage.jsx:174-179`: os breakpoints do Tailwind medem a viewport, mas o conteúdo vive num container ~330px mais estreito (sidebar 248 + `px-10`). Em `lg`, revelar a sidebar e dividir em duas colunas aconteceriam ao mesmo tempo, espremendo o formulário de 3 colunas justamente quando a tela cresce.

`flex-1` no `<main>` é obrigatório — sem ele o `<main>` congela no `max-content` e toda a sobra vira faixa morta à direita.

## Decisão 10 — Corrigir os defaults colombianos do schema

O payload de `create` que a documentação do IXC sugere para `funcionarios` traz defaults de uma instalação colombiana:

```jsonc
"tipo_documento_identificacao_col": "Cédula de ciudadanía",   // → ''
"cor_raca": "Palenquero",                                     // → conjunto BR
```

Pior: `cor_raca` e `grau_escolaridade` têm **chaves duplicadas** no `values` da doc, porque os conjuntos BR e CO foram concatenados — `N` significa `Negro` e `Rrom`; `EF` aparece duas vezes. Enviar um código do conjunto errado grava lixo silenciosamente.

`BASE_FUNCIONARIO` em `ixcColaborador.js` usa **só o conjunto BR** (`cor_raca` ∈ `A/B/I/P/N/O`, `grau_escolaridade` ∈ `EF/EM/ES/PG/M/D`), e o validador emite aviso se um código do conjunto CO chegar.

## Medições contra o IXC de produção — 2026-08-08

Tudo abaixo foi medido em `sistema.prestek.com.br`, não inferido da documentação. Três achados invalidaram premissas do plano original.

### Achado 1 — Recurso indisponível responde HTTP 200

O IXC sinaliza recurso inexistente ou sem permissão com **HTTP 200** e corpo `{type:'error', message:'Recurso X não está disponível!'}`. O idioma `dados.registros || []`, usado em todo o `server.js`, transforma isso numa lista vazia indistinguível de "não há registros".

**Consequência já em produção:** a rota `/api/grupos` do projeto devolve `[]` há tempo indeterminado, sem erro, porque o recurso `grupo` não está disponível. Ninguém percebeu.

`ixcListar` passa a checar `type === 'error'` e lançar. É a diferença entre uma lista vazia e uma pergunta errada.

### Achado 2 — Três dos cinco FKs obrigatórios não têm recurso próprio

| Recurso | Esperado | Medido |
|---|---|---|
| `filial` | fonte de `filial_id` | ✓ 20 registros |
| `empresa_setor` | fonte de `id_departamento` | ✓ 60 registros |
| `fl_funcoes` | fonte de `id_funcao` | ✗ **indisponível** |
| `usuarios_grupo` | fonte de `id_grupo` | ✗ **indisponível** |
| `grupo` | alternativa para `id_grupo` | ✗ **indisponível** |
| `planejamento_analitico` | fonte de `id_conta` | ✓ mas **52.481** registros |

Um select vazio é pior que nenhum select: some com a informação sem admitir que sumiu. A saída é **derivar do uso real** — `funcionarios` (478) e `usuarios` (444) estão acessíveis e carregam os FKs preenchidos. As opções saem da distribuição desses valores, ordenadas por frequência, cada uma com um exemplo de quem a usa. O operador escolhe por analogia: *"que `id_funcao` tem o outro técnico?"* — que é exatamente como resolveria abrindo o IXC.

Listas derivadas são marcadas em `derivados` na resposta, para que a UI possa declarar que aquilo é inferência, não cadastro.

Para `id_conta`, o mesmo princípio corta 52.481 opções para as **105 em uso**, e essas têm nome útil: *"Salários e Ordenados - T.I."*. As contas de folha são sinalizadas com `folha: true` e vão para o topo — algumas das 105 são contas de cliente e de fornecedor, usadas por colaboradores PJ.

Custo: request frio de ~20s (varredura de `funcionarios`, `usuarios` e `planejamento_analitico`). Cacheado 6h; quente responde em ~54ms.

### Achado 3 — `funcionarios.uf` é um campo vestigial

A Decisão 3 previa derivar `funcionarios.uf` do registro de cidade escolhido. Os dados dizem outra coisa:

```
   279×  funcionarios.uf=1   cidade="Penedo"    cidade.uf=7
    39×  funcionarios.uf=0   cidade="Penedo"    cidade.uf=7
    34×  funcionarios.uf=1   cidade="Neópolis"  cidade.uf=28
    22×  funcionarios.uf=1   cidade="Coruripe"  cidade.uf=7
                                    …

   funcionarios.uf == cidade.uf :   3
   funcionarios.uf != cidade.uf : 475
```

O campo é preenchido com `1` (ou `0`) independentemente da cidade — não é a mesma escala de `cidade.uf`, ou simplesmente nunca foi mantido. Apenas 3 registros em 478 são coerentes.

Preencher com o valor semanticamente correto tornaria nossos cadastros os únicos divergentes do resto do ERP; preencher com `1` propaga um dado errado. **Decisão pendente do usuário.** Enquanto isso, o dry-run exibe os dois valores e marca o campo como pendência explícita — o que é honesto e não custa nada, já que na v1 nada é gravado.

### Achado 4 — Formatos reais, para calibrar validação e busca

De um colaborador ativo real:

| Campo | Valor real | Implicação |
|---|---|---|
| `cpf_cnpj` | `"073.244.184-65"` | armazenado **com máscara** — a busca de duplicidade precisa tentar mascarado primeiro |
| `data_nascimento` | `"1996-03-04"` | `yyyy-mm-dd` confirmado |
| `estado_civil` / `cor_raca` / `grau_escolaridade` | `"S"` / `"B"` / `"EM"` | conjunto BR confirmado |
| `ferias_colaborador` | `"N"` em **478 de 478** | a doc sugere `"S"` como default — a doc está errada |
| `tipo_documento_identificacao_col` | `"13"` | populado mesmo em registros brasileiros; enviar `''` divergiria |
| `language` / `scheme` / `tipo_acesso` / `template` | `"Pt-Br"` / `"light"` / `"A"` / `"vg"` | defaults reais de `usuarios` |
| `cidade` | 6.701 registros, **5.570 brasileiros** (`cod_ibge != 0`) | a tabela inclui cidades colombianas — filtrar |

## Riscos

| | Risco | Mitigação |
|---|---|---|
| 🔴 | **Não há ficha de exemplo no repositório.** A tabela `REGRAS` parte de rótulos genéricos de admissão brasileira — é hipótese, não medição. | Regras são **dados**, não código. O painel de texto bruto sempre existe. `naoReconhecido` devolve as linhas `Rótulo: valor` que nenhuma regra capturou, que é exatamente o insumo para calibrar. E a extração nunca bloqueia o preenchimento manual. **Calibrar assim que houver uma ficha real, mesmo anonimizada.** |
| 🔴 | **`fl_funcoes` pode não estar acessível.** Não está entre os 108 recursos da doc, e o fato de `/api/funcoes` ser chamado pelo front sem nunca ter sido implementado sugere que já se tentou. | A rota degrada para `{sucesso: true, funcoes: [], aviso}` — nunca 500, senão `Configuracoes.jsx` passa a exibir erro onde hoje falha em silêncio. Se vier vazio, o campo vira texto livre e o dry-run emite aviso em vez de erro. |
| 🟠 | **`id_conta` é conta contábil.** Errar vincula o colaborador à conta errada da folha. | **Nunca auto-preencher.** Select explícito, default por `IXC_ID_CONTA_PADRAO`, erro duro (não aviso) se vazio. |
| 🟠 | **`pdfjs-dist` + wasm do Tesseract no backend** (~10MB + ~15MB de modelo). | Import dinâmico dentro do handler isola o cold start. O ramo OCR é uma fase separada e removível. |
| 🟡 | **A forma da resposta de `incluir` só está comprovada para `su_oss_chamado`.** | A fase 2 não pode assumir `{type:'success', id}`; tratar `type !== 'success'` e resposta não-JSON. Fora do escopo desta change. |
| 🟡 | **`backend/server.js` e `backend/cache.js` já estão modificados no working tree** (change `cobertura-resolver-endereco-cliente`). | `git diff` antes de editar; o TTL novo entra depois de `IXC_UF`, longe do bloco de `COBERTURA_CLIENTES` que está sendo alterado. |
| ⚠️ | **Fora do escopo, mas registrado:** `backend/.env copy.example` está versionado com o `IXC_TOKEN_SECRET` real (64 hex). O `adminAuth` também é falsificável — é só o header `x-admin-email` comparado com o banco, sem prova de identidade. | Nenhuma nesta change. Merece issue própria, e pesa na decisão de manter a v1 em dry-run. |

## Alternativas descartadas

**Portar o `index.html` como página estática servida pelo Express.** Descartado: perderia o shell, o tema, a sessão e o gate de admin, e criaria uma segunda identidade visual dentro do mesmo produto. O protótipo entra como especificação de fluxo, não como código.

**Formulário em wizard (uma seção por vez).** Descartado: o operador está *conferindo* uma transcrição, não preenchendo do zero. Esconder seções obriga a navegar para descobrir o que está errado. As seções ficam todas visíveis, e o dry-run enumera os problemas de uma vez, com links que rolam até o campo.

**Bloquear o botão "Simular" enquanto houver erro de cliente.** Descartado pelo mesmo motivo: o propósito do dry-run é listar tudo que está errado numa passada. Bloquear obrigaria a descobrir os problemas um a um.

**Preview do PDF embutido (`<iframe>` ou `pdfjs` no browser).** Descartado: `pdfjs` no bundle do front custa caro e o `<iframe>` com blob URL não sobrevive bem aos temas. O painel lateral mostra o **texto extraído** — que é o que realmente explica por que um campo não veio.
