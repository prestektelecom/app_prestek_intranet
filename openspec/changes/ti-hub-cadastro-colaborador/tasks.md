Organizado em 7 fases. A ordem não é arbitrária:

```
  1  BACKEND DE TAXONOMIA   ← primeiro de tudo: elimina todo chute de FK
        │                      se fl_funcoes ou planejamento_analitico não
        │                      responderem, o desenho do formulário muda
        ▼
  2  HUB + NAVEGAÇÃO        ← valida o gate de admin e a linha 173
        ▼
  3  FORMULÁRIO             ← ENTREGÁVEL SOZINHO: cadastro manual funciona
        │                      sem PDF nenhum
        ├──► 4  EXTRAÇÃO (camada de texto)
        │         └──► 5  OCR (removível se pesar)
        ▼
  6  DRY-RUN                ← fecha a v1
        ▼
  7  STUB DA FASE 2 + CHANGELOG
```

As fases 4 e 5 **não bloqueiam** a 6: o dry-run opera sobre o estado do formulário, venha ele de PDF ou de digitação.

---

## 1. Backend de taxonomia — elimina os chutes de FK

- [x] 1.1 Rodar `git diff backend/server.js backend/cache.js` e confirmar o que já está modificado no working tree (change `cobertura-resolver-endereco-cliente`), para não misturar mudanças.
- [x] 1.2 Criar `backend/services/ixc.js` movendo `fetchIXC` (server.js:14-34), `ixcHeaders` (36-44), `IXC_RP_MAX` e `paginarIXC` (59-113) **verbatim**, sem alterar uma linha do corpo. Importar de volta em `server.js`.
- [x] 1.3 Confirmar que nada quebrou: `grep -c 'fetchIXC\|paginarIXC\|ixcHeaders' backend/server.js` antes e depois, e subir o backend com uma rota que use cada helper (`/api/cobertura-ixc` usa `paginarIXC`).
- [x] 1.4 Adicionar ao módulo: `ixcUrl(recurso)` → `https://${IXC_HOST}/webservice/v1/${recurso}` (⚠️ **não** `/api/v1/`, apesar da doc) e `ixcListar(recurso, {qtype, query, oper, rp, page, sortname})`.
- [x] 1.5 Adicionar `ixcIncluir(recurso, payload)` (POST + `ixcsoft: 'incluir'`, parse de `{type, id|message}`) e `ixcAtualizar(recurso, id, registroCompleto)` (PUT `/{id}` **sem** header `ixcsoft`). Escritos agora, chamados só na fase 2 — deixar comentário dizendo isso.
- [x] 1.6 Em `backend/cache.js`, adicionar `IXC_CIDADES: 86400 * 1000` logo após `IXC_UF`, com o comentário do motivo (tabela estática). Não encostar no bloco `COBERTURA_CLIENTES`, que está sendo alterado por outra change.
- [x] 1.7 Implementar `GET /api/funcoes` — lista `fl_funcoes`. **Corrige um 404 existente**: `Configuracoes.jsx:124` e `utils/resolveSetor.js` já chamam essa rota. Em falha do IXC, responder `200 {sucesso: true, funcoes: [], aviso}` — **nunca 500**.
- [x] 1.8 Verificar 1.7 na prática: `Invoke-RestMethod http://localhost:3001/api/funcoes`. **Se `fl_funcoes` não existir ou vier vazio, anotar aqui e ajustar a tarefa 3.4** (o campo Função vira texto livre e o dry-run emite aviso em vez de erro).
- [x] 1.9 Implementar `GET /api/ti/colaborador/taxonomias` — `filiais`, `cargos` (`empresa_setor`), `funcoes` (`fl_funcoes`), `grupos` (`usuarios_grupo`), `contas` (`planejamento_analitico`) num round-trip. `Promise.allSettled`: cada falha vira `[]` mais uma entrada em `parciais`. Cache `TTL.SETORES`.
- [x] 1.10 Verificar que `planejamento_analitico` responde e inspecionar a forma dos registros — é de onde sai `id_conta`, o FK de maior consequência (folha de pagamento).
- [x] 1.11 Implementar `GET /api/ti/colaborador/cidades?q=&uf=&limite=` — `paginarIXC('cidade', ...)` com `rp: 9999`, `concorrencia: 1`, `timeoutMs: 120000` e `projetar` para `{id, nome, uf, cod_ibge}`; cachear com `TTL.IXC_CIDADES` e filtrar em memória (normalizar acentos, `startsWith` antes de `includes`).
- [x] 1.12 Medir o tempo do request frio de 1.11 e anotar. Se passar de 120s, reduzir para busca direta no IXC com `qtype: 'cidade.nome'` e `oper: 'L'`.
- [x] 1.13 Confirmar que `cidade.uf` é **id numérico** (é ele que vira `funcionarios.uf`) e não sigla — inspecionar um registro real.
- [x] 1.14 Aplicar `adminAuth` em todas as rotas novas e confirmar 401 sem `x-admin-email` e 403 com e-mail de não-admin.

## 2. Hub e navegação — 7 edições de registro

- [x] 2.1 Em `src/components/common/Icons.jsx`, adicionar a chave `Chip` (chip/CPU), usando o preset `sk` do arquivo (`20×20`, `viewBox 0 0 24 24`, `strokeWidth 1.7`). Distinta de `Tools` (chave inglesa) e `Settings` (engrenagem).
- [x] 2.2 Criar `src/components/ti/registry.js` com `FERRAMENTAS_TI` e `FERRAMENTA_PADRAO`.
- [x] 2.3 Criar `src/components/ti/TiHero.jsx` — anatomia de `coverage/CoverageHero.jsx:68-98`: `rounded-[24px] p-6 sm:p-8`, gradiente `120deg accentDeep→accentDark→accent`, pattern SVG 40×40 opacity `.15`, dois blobs, split 6/6, `KpiTile` copiado de `CoverageHero.jsx:15-34`. Incluir o selo âmbar "Modo simulação".
- [x] 2.4 Verificar o piso de contraste do hero: sobre `bg-black/55`, nenhum texto abaixo de `text-white/70` (`/75` para labels).
- [x] 2.5 Criar `src/components/Ti.jsx` — `<main className="flex-1 overflow-y-auto bg-background px-4 py-8 text-foreground md:px-10">` + `<div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">`. **`flex-1` é obrigatório** (ver `coverage-layout-proporcional`). Bandeja segmentada no padrão de `Coverage.jsx:149-171`. Persistir a ferramenta ativa em `localStorage`.
- [x] 2.6 `src/App.jsx` — import de `Ti` junto dos demais (linhas 2-18).
- [x] 2.7 `src/App.jsx` — par de render após a linha 171, espelhando `plantao-historico` (165-166): `{currentView === 'ti' && user?.is_admin && <Ti .../>}` e o `NotFound` para não-admin.
- [x] 2.8 `src/App.jsx:173` — acrescentar `'ti'` ao array de ids válidos. ⚠️ **Sem isto a página renderiza junto com o NotFound.**
- [x] 2.9 `src/components/Sidebar.jsx:11-20` — entrada `{ id: 'ti', icon: 'Chip', label: 'TI', group: 'menu', somenteAdmin: true }`. Como `menuItems` é const de módulo (não vê `user`), aplicar `.filter(i => !i.somenteAdmin || user?.is_admin)` no `.map` do render.
- [x] 2.10 `src/components/responsive/MobileDrawer.jsx:6-18` — mesma entrada e mesmo `.filter` no map (`user` já está em escopo).
- [x] 2.11 `src/components/MobileMoreSheet.jsx` — `push` da entrada dentro do bloco `if (user?.is_admin)` que já existe (~linha 50).
- [x] 2.12 Confirmar que `MobileBottomNav.jsx` e `Header.jsx` **não** precisam de edição (o "Mais" acende por exclusão; o Header não tem mapa de títulos).
- [ ] 2.13 **Teste do gate:** logar como não-admin → "TI" ausente na Sidebar, no Drawer e no MoreSheet. Depois `localStorage.setItem('@Stitch:currentView','ti')` + reload → renderiza **só** o `NotFound` (é o teste da tarefa 2.8).
- [ ] 2.14 **Teste da extensibilidade** (critério de aceitação da Decisão 1 do `design.md`): adicionar temporariamente um segundo objeto em `FERRAMENTAS_TI` apontando para um componente vazio e confirmar que a segunda pílula aparece **sem tocar em `Ti.jsx`, `App.jsx` ou navegação**. Reverter depois.

## 3. Formulário — entregável sozinho, sem PDF

- [x] 3.1 Criar `src/components/ti/cadastro/estilos.js` com `CAMPO` e `ROTULO` copiados de `coverage/OverrideModal.jsx:6-9` (variante densa, correta para grid de 3 colunas — o `FIELD_CLASS` do `ModalShell` é para modal de 1 coluna), `HINT`, `BTN_PRIMARIO`, `BTN_SECUNDARIO`, `CARD`.
- [x] 3.2 Criar `src/components/ti/cadastro/normalizadores.js` (espelho de cliente, só para máscara ao vivo).
- [x] 3.3 Criar `src/components/ti/cadastro/campos.js` — descrição declarativa das 4 seções e de cada campo (`nome, rotulo, tipo, obrigatorio, opcoes, span, maxLength`). O formulário é **gerado** daqui; mudar um campo passa a ser mudar dado.
- [x] 3.4 Nos campos de enum, usar **apenas o conjunto BR**: `cor_raca` ∈ `A/B/I/P/N/O`, `grau_escolaridade` ∈ `EF/EM/ES/PG/M/D`. ⚠️ A doc do IXC concatena BR e CO com chaves duplicadas (`N` = Negro *e* Rrom; `EF` duas vezes).
- [x] 3.5 Criar `src/components/ti/useTaxonomiasIxc.js` — carrega `/api/ti/colaborador/taxonomias` uma vez; expõe `carregando`, `erro` e `parciais`.
- [x] 3.6 Criar `SecaoForm.jsx` — `CARD` + faixa `h-1 bg-gradient-to-r from-[#7C2D12] via-[#C2410C] to-[#EC7D23]` + header `border-b border-border px-6 py-4` com ícone em `rounded-xl bg-[var(--accent-soft)]` + corpo `grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3`.
- [x] 3.7 Criar `CampoForm.jsx` — label, badge de confiança, input/select/segmentado, hint de erro. Cada input recebe `id={'campo-' + nome}` (é o alvo do scroll-to da tarefa 6.9).
- [x] 3.8 Criar `CidadeCombobox.jsx` — type-ahead contra `/cidades`, grava `{cidade_id, cidade_nome, uf_id}`. **Nunca pré-selecionar com mais de um resultado.**
- [x] 3.9 Criar `CadastroColaborador.jsx` — orquestrador com os estados `ficha → revisão → simulação`, o grid `xl:grid-cols-[minmax(0,1fr)_360px]` (**`xl`, não `lg`** — ver Decisão 9) e o trilho de etapas.
- [x] 3.10 Criar `PainelLateral.jsx` — resumo, botão "Simular cadastro", duplicados, texto bruto do PDF e log.
- [x] 3.11 Validação de cliente `onBlur`, que **pinta mas não bloqueia**: obrigatório vazio, DV do CPF, CEP de 8 dígitos, e-mail, datas plausíveis, `funcionario` ≤ 100 (contador a partir de 90).
- [x] 3.12 Estado de taxonomia carregando: skeleton `h-[38px] animate-pulse rounded-xl bg-surface-raised`, **nunca spinner** (padrão do projeto — ver `PlansGrid.jsx:6-15`).
- [x] 3.13 Toast no padrão de `ServicesDirectory.jsx:660-673` (`fixed right-4 top-4 z-[1120]`).
- [x] 3.14 **Marco: cadastro manual completo e usável, sem nenhum PDF.** Preencher o formulário inteiro à mão e confirmar que todos os selects populam.

## 4. Extração — camada de texto

- [x] 4.1 Adicionar `pdf-parse` a `backend/package.json`. ⚠️ É **API v2**: `new PDFParse({data})` → `await parser.getText()` → `await parser.destroy()`. O `read-pdf.js` da raiz usa a API v1 e **não** serve de exemplo.
- [x] 4.2 Criar `backend/services/normalizadores.js` — versão canônica (o servidor é a autoridade): `soDigitos`, `normalizarCPF` **com validação de DV**, `normalizarCEP`, `normalizarData` (aceita `dd/mm/aaaa`, `dd-mm-aaaa`, `aaaa-mm-dd`, `dd/mm/aa` → sempre `yyyy-mm-dd`), `normalizarTelefone`, `normalizarNome`, `normalizarMoeda`, `gerarLogin`, `mapearEstadoCivil`, `mapearCorRaca`, `mapearEscolaridade`.
- [x] 4.3 Criar `backend/services/extrairTextoPdf.js` — validar a assinatura `%PDF-` (senão 400) e implementar o ramo de camada de texto. Limiar de "texto útil": `texto.replace(/\s/g,'').length >= 200`.
- [x] 4.4 Criar `backend/services/fichaParser.js` com a tabela `REGRAS` e as três estratégias de casamento (mesma linha 1.0 / linha seguinte 0.5 / `padraoGlobal` 0.35).
- [x] 4.5 ⚠️ Casar rótulos **do mais longo para o mais curto** — senão `'nome'` captura `'Nome da Mãe'`. É o erro silencioso mais provável do parser. Escrever um caso de teste manual para isso.
- [x] 4.6 Normalização do texto antes do parsing: `\r\n → \n`, remover soft-hyphen `­`, colapsar espaços e nbsp, `split('\n').map(trim).filter(Boolean)`. Matching com acentos removidos (`NFD` + strip), mas **o valor sai da string original**.
- [x] 4.7 Normalizador que invalida o valor (CPF com DV errado) mantém o valor cru e derruba a confiança para 0.35.
- [x] 4.8 Emitir `naoReconhecido`: linhas no formato `Rótulo: valor` cujo rótulo não bateu com nenhuma regra. É o insumo para calibrar a tabela com fichas reais.
- [x] 4.9 `_cidade_texto` e `_uf_texto` saem do parser como texto; a resolução para FK é do front (tarefa 3.8). **Não chutar `uf: 1`.**
- [x] 4.10 Implementar `POST /api/ti/colaborador/extrair-pdf` com `adminAuth` + `express.raw({type:'application/pdf', limit:'15mb'})`. Import dinâmico de `pdf-parse` **dentro do handler**. **Nunca persistir o arquivo.**
- [x] 4.11 `registrarAuditoria(email, 'ti_extrair_ficha', ...)` sem dados pessoais na descrição.
- [x] 4.12 Criar `UploadFicha.jsx` — dropzone com os estados vazio / arrastando / lendo / OCR / ok / escaneado / erro. Card âmbar no padrão de `Coverage.jsx:126-134`.
- [x] 4.13 Badge de confiança em `CampoForm`: `≥ .75` limpo · `.35–.75` ícone `help` + `ring-1 ring-inset ring-amber-400/60` · `< .35` ícone `priority_high` + ring + hint · obrigatório ausente `ring-red-400/60` · editado pelo usuário → chip mono `editado`.
- [x] 4.14 Painel de texto bruto no `PainelLateral`: `<details>` + `<pre className="max-h-[320px] overflow-auto rounded-xl bg-surface-raised p-3 font-mono text-[11px] whitespace-pre-wrap text-muted">`.
- [x] 4.15 Testado com uma ficha real digital (modelo "Registro de Empregado" / CTPS, não o modelo "Ficha de Cadastro" que `REGRAS` assumia). Achados:
    - **Bug bloqueante:** `extrairCampos` chamava `extrairCampo(linhas, regra)` sem o 3º argumento `linhasConsumidas` — `undefined.has()` quebrava o parser inteiro em qualquer entrada. Corrigido.
    - **Bug do próprio critério da tarefa 4.5** (nunca tinha sido testado): rótulo curto `nome` casava com a linha "Nome da Mãe". Corrigido com uma lista `negativos` por regra.
    - Adicionado fallback: quando o rótulo casa mas o valor não valida (ex.: "CPF" seguido de uma linha que não é CPF), tenta `padraoGlobal` no texto inteiro antes de desistir — corrigiu CPF e data de nascimento nesta ficha.
    - Adicionada borda de palavra no casamento de rótulo (`empregado` não pode casar com `empregador`) e uma guarda para a estratégia B não capturar outro rótulo conhecido como se fosse valor.
    - `mapearEscolaridade` agora aceita sufixo "Completo/Incompleto/Cursando" (ex.: "Ensino Médio Completo"), padrão universal em fichas reais.
    - Rótulos novos: `empregado` (nome do colaborador), `residência`/`residencia` (endereço, distinto do endereço do empregador), `cor` (cor/raça).
    - **Limitação conhecida, não corrigida:** este modelo de ficha imprime rótulos em bloco antes dos valores correspondentes (ex.: "Empregado / Residência / Beneficiários" seguido só depois pelos 3 valores, fora de ordem 1:1 simples) — um artefato de formulário em grade. As estratégias A/B (mesma linha / linha seguinte) não resolvem esse caso; `funcionario`, `estado_civil`, `cor_raca` e o endereço granular (número/complemento/bairro/cidade) ficam vazios nesta ficha em vez de errados — consistente com "nunca preenche errado com confiança alta", mas exige preenchimento manual. Corrigir isso de verdade exigiria casar blocos de rótulos com blocos de valores pela posição, o que é escopo de uma tarefa própria, não desta calibração.
    - Sem ficha exportada do Word disponível para este teste — pendente se aparecer uma.

## 5. OCR — fichas escaneadas

- [x] 5.1 Adicionar `tesseract.js` a `backend/package.json`. Import dinâmico dentro do handler.
- [x] 5.2 Em `extrairTextoPdf.js`, implementar o ramo OCR: `getScreenshot()` → PNG por página → Tesseract com idioma `por`.
- [x] 5.3 Confiança de campo vindo de OCR é **multiplicada por 0.7** — na prática todo campo de ficha escaneada aparece com ring âmbar, que é o comportamento correto.
- [x] 5.4 Reportar progresso por página para a UI e exibir barra em `UploadFicha`.
- [x] 5.5 Quando nem o OCR produzir texto útil: `origem: 'nenhum'`, **HTTP 200** com aviso âmbar e formulário destravado. **Nenhum ramo da cascata retorna erro ao usuário.**
- [ ] 5.6 Medir o tempo de OCR por página e o tamanho do download de `por.traineddata` no primeiro uso. Anotar aqui.
- [ ] 5.7 Confirmar que `npm run dev` ainda sobe em tempo aceitável com as duas dependências novas instaladas (o import dinâmico deve manter o cold start igual).
- [ ] 5.8 Testar com uma ficha escaneada real e confirmar que **todos** os campos vêm em âmbar.

## 6. Dry-run

- [x] 6.1 Criado `backend/services/ixcColaborador.js` com `OBRIGATORIOS_FUNCIONARIO` (7) e `OBRIGATORIOS_USUARIO` (12, incluindo os 5 flags financeiros). Confirmados contra os campos `required: "Sim"` reais da doc (`docs/querys_ixc_prestek/ixc_api_recursos_endpoints.json`) — bateram exatamente 7 e 12.
- [x] 6.2 `BASE_FUNCIONARIO`/`BASE_USUARIO` a partir do payload de `create` da doc. Além dos dois defaults colombianos já documentados (`tipo_documento_identificacao_col`, `cor_raca`), **achado durante a implementação**: a doc mistura, no mesmo payload, campos já corrigidos à mão (`ctps_seleciona: 'N'`) com outros que ainda trazem o **rótulo humano em vez do código** do `values` — `estado_civil: 'Solteiro(a)'` (código real `'S'`), `status: 'Ativo'` em usuários (código `'A'`), `tipo_acesso: 'Ambos'` (código `'A'`), `template: 'Moderno'` (código `'vg'`), `scheme: 'Modo claro'` (código `'light'`), `desc_parc_atraso: 'Padrão'` (código `'P'`), `rastreador_tipo: 'Externo'` (código `'S'`). Todos corrigidos com comentário citando o `values` da doc como evidência. Também aplicado o achado de `ferias_colaborador` (doc sugere `'S'`, 478/478 registros reais são `'N'`) e `uf: '1'` fixo (Achado 3).
- [x] 6.3 `validar(dados, taxonomias)` implementado como descrito. **Achado durante a implementação:** o cadastro (fase 3) usava o código `'U'` para União Estável — código inexistente no schema real (`'UE'`) — e não tinha `'SE'` (Separado(a)). Corrigido em `campos.js` e em `normalizadores.js` (backend), já que a validação de enum do dry-run só faz sentido se o conjunto aceito for o real.
- [x] 6.4 `id_conta` ausente é erro duro (`OBRIGATORIOS_FUNCIONARIO`), nunca preenchido automaticamente — confirmado por teste ao vivo.
- [x] 6.5 `montarPlano()` implementado — 1 passo sem "criar usuário", 3 com. Testado ao vivo (via `curl` contra o backend em dev) nos dois modos.
- [x] 6.6 `GET /api/ti/colaborador/duplicado?cpf=&email=` implementado e testado ao vivo: `?email=` de um usuário real devolveu `DUPLICADO` com o id correto.
- [x] 6.7 `POST /api/ti/colaborador/dry-run` implementado, roda a checagem de duplicados internamente.
- [x] 6.8 Senha: `usuarios.senha` no IXC real **já é o hash SHA-256 hex** (confirmado em `server.js` — o login compara `usuario.senha === sha256(digitada)`), então o hash calculado é literalmente o valor do payload, não uma redação — a UI só decide se mostra ou mascara. Texto puro nunca sai da rota. Default por `IXC_SENHA_PADRAO_COLABORADOR` (adicionada a `.env copy.example`), override no campo `senha` já existente do formulário (fase 3).
- [x] 6.9 Criado `DryRunResultado.jsx` — banner verde/vermelho, erros/avisos clicáveis com `scrollIntoView` + `focus()`, `<details><pre>` por passo do plano (1 ou 3, conforme 6.5), botão "Copiar JSON".
- [x] 6.10 Faixa fixa no rodapé implementada.
- [x] 6.11 Hash com toggle "revelar" implementado.
- [x] 6.12 Confirmado: o botão em `PainelLateral.jsx` só desabilita durante a chamada em curso (`disabled={simulando}`), nunca por causa de erro de validação.
- [x] 6.13 `registrarAuditoria(email, 'ti_dry_run_colaborador', ...)` chamado na rota. **Achado durante a implementação:** a rota de extração de PDF (fase 4) já tinha esse mesmo bug — `req.adminEmail` nunca é setado pelo middleware `adminAuth` (que só valida o header, não o anexa ao `req`), então o e-mail do admin gravado na auditoria de `ti_extrair_ficha` sempre foi vazio. Corrigido para ler `req.headers['x-admin-email']`, igual às demais rotas.
- [x] 6.14 Dry-run completo e válido rodado ao vivo contra o backend em dev (`valido: true`, sem erros); em seguida, busca em `funcionarios` por nome e por CPF confirmou **zero registros** — nada foi gravado.

## 7. Fechamento

- [ ] 7.1 `POST /api/ti/colaborador/criar` como stub **501**, com o algoritmo da fase 2 em comentário — incluindo a compensação do funcionário órfão (deletar ou `ativo: 'N'`).
- [ ] 7.2 Registrar em `CHANGELOG.md`.
- [ ] 7.3 Rodar `openspec validate ti-hub-cadastro-colaborador`.

## 8. Verificação end-to-end

- [ ] 8.1 `npm run dev` (front 5000 + back 3001, proxy `/api` já em `vite.config.js`).
- [ ] 8.2 Cada rota nova sem `x-admin-email` → **401**; com e-mail de não-admin → **403**.
- [ ] 8.3 `.png` renomeado para `.pdf` → **400** (assinatura ausente). Arquivo de 20MB → **413**.
- [ ] 8.4 PDF escaneado sem texto útil → **200** com `origem: 'nenhum'`, nunca 500.
- [ ] 8.5 `IXC_HOST` inválido no `.env` → **502** em ≤30s. **Nunca pendurar** — é o teste do `AbortController` de `fetchIXC`.
- [ ] 8.6 Dry-run sem cidade → `valido: false` com exatamente esse erro na lista.
- [ ] 8.7 CPF `111.111.111-11` → aviso de DV, confiança rebaixada, sem quebrar.
- [ ] 8.8 E-mail de um usuário existente → aviso `DUPLICADO` com o id.
- [ ] 8.9 Fluxo feliz completo: TI → upload → campos com âmbar nos duvidosos → corrigir cidade → Simular → 3 payloads → copiar JSON → validar o JSON.
- [ ] 8.10 Os três tipos de ficha: digital, exportada do Word, escaneada.
- [ ] 8.11 Temas: claro, cyber, aurora e amoled — conferir o `<pre>`, os rings âmbar/vermelho e o hero em cada um.
- [ ] 8.12 Responsivo em 390 / 768 / 1024 / 1280 / 1536: abaixo de `xl` o painel lateral empilha; o `<pre>` rola horizontalmente em vez de alargar a página; dropzone e botões ≥ 44×44 (`AGENTS.md`).
- [ ] 8.13 **Regressão:** abrir Configurações e confirmar que o select de funções agora popula (o `/api/funcoes` era 404 silencioso) — e que continua funcionando se a rota devolver `funcoes: []`.
- [ ] 8.14 Confirmar que nenhuma tela existente mudou de comportamento após a extração dos helpers para `services/ixc.js`.
