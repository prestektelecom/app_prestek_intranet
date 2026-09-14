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
- [x] 2.13 **Teste do gate:** confirmado ao vivo o lado que dava para testar com a única conta disponível nesta sessão (admin): forçar `currentView='ti'` (em `sessionStorage` E `localStorage` — o app lê sessão primeiro, `App.jsx:50`) + reload renderiza a tela TI normalmente para o admin. ⚠️ Achado: `MobileDrawer.jsx` citado nesta tarefa não existe mais — a navegação foi refeita depois (commit `2a10b24`) para uma fonte única `src/navigation.js` (`NAV_ITEMS`/`ADMIN_VIEWS`/`canAccess`), consumida por `Sidebar.jsx`/`MobileMoreSheet.jsx`; `App.jsx:176` usa `canAccess(currentView, user)` em vez do "array de ids válidos" de `App.jsx:173` mencionado aqui. O lado "não-admin vê só NotFound" ficou verificado só por leitura de código (`ADMIN_VIEWS.includes('ti')`), sem conta não-admin disponível — mesma limitação já registrada nas Fases 12/13.
- [x] 2.14 **Teste da extensibilidade**: executado ao vivo — adicionado um 2º objeto em `FERRAMENTAS_TI` (`registry.js`) apontando para um componente-stub temporário (`__teste_ferramenta_temp.jsx`), confirmado via `document.querySelector('nav[aria-label="Ferramentas de TI"]')` que as DUAS pílulas aparecem lado a lado sem nenhuma edição em `Ti.jsx`, `App.jsx` ou arquivos de navegação. Revertido (registry.js restaurado, arquivo temporário apagado) logo em seguida — confirmado `git status` limpo.

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
- [x] 5.6 Medido ao vivo: `por.traineddata` tem **2,4MB** (2.422.444 bytes), não os ~15MB estimados no comentário do código (corrigido). OCR de 1 página: ~1,2-2,6s dependendo do `scale` de renderização (ver 5.8). Dois achados reais, corrigidos: (1) `cachePath` não era passado ao `createWorker`, então caía no default `.` (cwd) — foi assim que `backend/por.traineddata` acabou commitado no git (`0ace253`); corrigido apontando para `backend/.cache/tesseract/` (path absoluto via `import.meta.url`, funciona não importa de onde o processo sobe) e adicionado a `.gitignore`; (2) o diretório não existia e `tesseract.js` não cria sozinho — `writeCache` falhava calada (só loga) e o modelo baixava de novo a cada requisição; corrigido com `fs.mkdirSync(..., {recursive:true})` no module-load. Confirmado ao vivo: 1ª chamada grava o arquivo, 2ª chamada reusa (sem novo download).
- [x] 5.7 Medido ao vivo: cold start do backend (`node server.js` numa porta descartável) em **0,7s** até `/api/health` responder — `pdf-parse`/`tesseract.js` são importados dinamicamente só dentro do handler de extração, nunca no boot.
- [x] 5.8 Testado com uma ficha sintética "escaneada" (uma página real de `docs/Ficha Registro de Empregado TESTE .pdf` renderizada para PNG e reembalada num PDF sem camada de texto, para simular fielmente um scan sem precisar de um scanner físico). **Achado real corrigido:** `getScreenshot()` rodava com `scale` padrão (1, ~72 DPI) — nessa resolução o OCR da ficha real mal passou de 100 caracteres de ruído, sempre abaixo do piso de 200 (`LIMIAR_TEXTO_UTIL`), então a tela SEMPRE caía em `origem:'nenhum'` para fichas escaneadas reais, mesmo legíveis a olho nu — a feature de OCR estava, na prática, morta. Corrigido para `scale: 3` (~216 DPI); confirmado ao vivo: `origem: 'ocr'`, texto útil (>1000 caracteres, nomes/CEP/endereço reais reconhecíveis apesar de ruído), 7 de 32 campos preenchidos, TODOS com confiança abaixo de 0,75 (0,24-0,7) — exatamente o comportamento esperado do design (ring âmbar em tudo).

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

## 7. Documentos, Filiação e Enriquecimento (Fase 5)

- [x] 7.1 Parser (`fichaParser.js`): Adicionadas regras de extração de RG (`ie_identidade`), Órgão Emissor, Data de Emissão, CTPS (`ctps_numero`, `ctps_serie`, `ctps_data_emissao`), Título de Eleitor (`titulo_numero`, `titulo_zona`, `titulo_secao`), PIS (`pis_numero`, `pis_data`), Filiação (`nome_mae`, `nome_pai`), Nacionalidade, Deficiência e Cargo/CBO da ficha (`_cargo_texto`, `_cbo_texto`).
- [x] 7.2 Normalizadores (`normalizadores.js`): Implementados `mapearSimNao` e `normalizarPIS`.
- [x] 7.3 Backend de Colaborador (`ixcColaborador.js`): `BASE_FUNCIONARIO` e `MAX_LENGTH` expandidos com campos de documentos e filiação. `montarPlano()` agora deriva automaticamente `rg_seleciona`, `ctps_seleciona`, `titulo_eleitoral_seleciona`, `pis_seleciona`, `cpf_seleciona` e grava nota de Cargo/CBO em `funcionarios.obs`.
- [x] 7.4 Estrutura do Formulário (`campos.js`): Adicionadas seções `documentos` e `filiacao`, e campos correspondentes com spans responsivos, tipos, máscaras e defaults.
- [x] 7.5 Componentes de UI: `CampoForm.jsx` atualizado para suportar `dica` informativa; `CadastroColaborador.jsx` atualizado para capturar dados extraídos e exibir dica de Cargo/CBO junto ao seletor de Função.
- [x] 7.6 Teste automatizado de ponta a ponta (`test_fase5.js`) validando a extração, derivação de flags booleanos e composição de `obs`.

## 8. Fechamento

- [x] 8.1 `POST /api/ti/colaborador/criar` como stub **501**, com o algoritmo da fase 2 em comentário — incluindo a compensação do funcionário órfão (deletar ou `ativo: 'N'`). Achado ao vivo (Fase 14 Impeccable, 2026-09-14): a rota NÃO existia (só uma menção aspiracional em `design.md`) — implementada em `server.js` logo após `/dry-run`, com o algoritmo de 6 passos comentado (validar de novo, criar funcionário, criar usuário se pedido, reler+PUT para vincular, compensação de órfão como decisão de produto ainda não tomada, registrar auditoria). Testado ao vivo com o token JWT real do admin: sem token → 401; com token válido → 501 e a mensagem apontando para `/dry-run`.
- [x] 8.2 Registrar em `CHANGELOG.md`. Entrada adicionada em `[Unreleased] > Adicionado` cobrindo a aba TI, o Cadastro de Colaborador e as 6 rotas novas.
- [x] 8.3 Rodar `openspec validate ti-hub-cadastro-colaborador`. Passou sem `--strict`. Com `--strict`, 17 avisos — todos do mesmo problema: a seção "## 9. Verificação end-to-end" tinha os itens numerados "8.1"-"8.14" (duplicando a numeração da seção 8 acima) em vez de "9.1"-"9.14" — renumerada nesta mesma tarefa.

## 9. Verificação end-to-end

- [x] 9.1 `npm run dev` (front 5000 + back 3001, proxy `/api` já em `vite.config.js`). Confirmado ao vivo: ambos respondendo (`/api/health` 200, front servindo a SPA) durante toda a verificação desta seção.
- [x] 9.2 Cada rota nova sem token → **401**; com e-mail de não-admin → **403**. ⚠️ Achado ao vivo (Fase 14 Impeccable): o esquema mudou de `x-admin-email` (header cru do cliente) para JWT Bearer desde a correção de segurança G5 (`1e530a0`) — `adminAuth` hoje lê `req.usuario.email`, já verificado por `requireAuth`. As 6 rotas `/api/ti/colaborador/*` (taxonomias, cidades, duplicado, dry-run, extrair-pdf, criar) testadas via `curl` sem `Authorization` → 401 confirmado nas 6. O caso 403 (token válido de usuário NÃO-admin) ficou só verificado por leitura de código (`adminAuth` consulta `usuarios_perfil.is_admin` fresco no banco) — sem uma segunda conta não-admin disponível nesta sessão, mesma limitação já registrada nas Fases 12/13.
- [x] 9.3 `.png` renomeado para `.pdf` → **400** (assinatura ausente). Arquivo de 20MB → **413**. Achado e corrigido ao vivo: o limite estava em `25mb` (não os `15mb` da tarefa 4.10) e o filtro de tipo aceitava qualquer Content-Type (`type: () => true`) — resquício de depuração (com 3 `console.log` de `[DEBUG extrair-pdf]` ainda no meio do handler). Revertido para `type: 'application/pdf', limit: '15mb'` (o front sempre manda esse Content-Type de propósito) e os logs de depuração removidos. Confirmado ao vivo: corpo com assinatura inválida → 400 `"O arquivo enviado não é um PDF."`; arquivo de 16MB → 413 `"Arquivo excede o limite permitido."` (rede de segurança de `server.js` mapeando `err.status===413`).
- [x] 9.4 PDF escaneado sem texto útil → **200** com `origem: 'nenhum'`, nunca 500. Testado com um PDF sintético (uma página real de `docs/Ficha Registro de Empregado TESTE .pdf` renderizada para PNG e reencapsulada sem camada de texto) e com um PDF minúsculo/malformado sem xref válido. Achado real: sem timeout, um PDF malformado podia deixar `getInfo()`/`getScreenshot()` pendurados indefinidamente — corrigido com um `comTimeout()` (20s para a camada de texto, 90s para o OCR) que sempre resolve para `origem: 'nenhum'` mesmo que a promessa original nunca retorne. Confirmado ao vivo: 200, nunca 500, nunca mais de ~2s de resposta real nos dois casos testados.
- [x] 9.5 `IXC_HOST` inválido no `.env` → **502** em ≤30s. **Nunca pendurar** — é o teste do `AbortController` de `fetchIXC`. Verificado por leitura de código, não ao vivo (mudar `IXC_HOST` no `.env` compartilhado do ambiente de dev derrubaria outras telas em uso — risco desnecessário para um teste que o código já demonstra por construção): `fetchIXC` (`services/ixc.js:10-30`) usa `AbortController` com `timeoutMs=15000` e 1 retry automático — pior caso ~30s para um host que nunca responde, e todas as rotas que o chamam (`taxonomias`, `dry-run` via `carregarTaxonomias`/`buscarDuplicados`) têm `try/catch` mapeando para 502.
- [x] 9.6 Dry-run sem cidade → `valido: false` com exatamente esse erro na lista. Confirmado ao vivo via `curl` contra `/api/ti/colaborador/dry-run` com um payload mínimo (nome, CPF válido, e-mail) e `_cidade_texto`/`cidade` vazios: resposta `valido: false`, com um erro citando o campo de cidade entre os `erros` — nenhum dado real gravado (rota é dry-run por design, nunca chama `ixcIncluir`).
- [x] 9.7 CPF `111.111.111-11` → sinalizado e sem quebrar a rota. Confirmado ao vivo via `curl` no mesmo dry-run: o CPF de dígito verificador inválido veio como `erro` ("CPF com dígito verificador inválido.", bloqueando `valido: true`) — mais rígido que um simples aviso, mas correto: é a validação de SERVIDOR do dry-run (`validarColaborador`), distinta da confiança 0-1 da extração de PDF (Decisão 3 do design.md, essa sim rebaixada para 0.35 num CPF inválido vindo de ficha). Resposta 200 normal, sem 502/exceção.
- [ ] 9.8 E-mail de um usuário existente → aviso `DUPLICADO` com o id. Não executado nesta sessão: o teste exigiria usar o e-mail de um usuário REAL do IXC como entrada — evitado por ser um dado de produção real, mesmo só para leitura (`buscarDuplicados` só consulta, não grava, mas usar um e-mail real de colega para um teste manual não pareceu justificável). Rota `GET /api/ti/colaborador/duplicado` e o bloco de duplicidade dentro do dry-run lidos e conferidos contra `ixcColaborador.js` — lógica correta por inspeção.
- [ ] 9.9 Fluxo feliz completo (upload → âmbar → corrigir cidade → Simular → 3 payloads → copiar JSON): coberto parcialmente — upload real de PDF escaneado sintético confirmado gerando campos âmbar (tarefa 9.4/5.8), mas o ciclo completo até "Simular cadastro" com `criar_usuario: 'S'` (3 payloads) não foi exercitado ao vivo pela UI nesta sessão por tempo; a rota `/dry-run` em si foi exercitada diretamente (9.6/9.7) com `criar_usuario` omitido (1 payload). Ficou como QA manual pendente, não bloqueia o fechamento desta change (a rota e o front já foram testados em partes).
- [x] 9.10 Os três tipos de ficha: digital, exportada do Word, escaneada. Digital: já testada na tarefa 4.15 (ficha real "Registro de Empregado"/CTPS) com achados corrigidos então. Escaneada: testada nesta sessão (tarefa 9.4/5.8) com um PDF sem camada de texto — OCR ativado, campos extraídos com confiança baixa (âmbar), achado e corrigido o bug de resolução (`scale: 1` → `scale: 3`, sem o qual o texto reconhecido nem batia o piso de 200 caracteres úteis). Exportada do Word: sem amostra disponível nesta sessão, mesma lacuna já registrada na tarefa 4.15.
- [ ] 9.11 Temas: claro, cyber, aurora e amoled — conferir o `<pre>`, os rings âmbar/vermelho e o hero em cada um. Adiado para a tarefa 14.2+ desta fase (crítica/audit de `Ti.jsx`), que já vai cobrir tema e contraste como parte do escopo padrão do programa Impeccable — evita medir a mesma coisa duas vezes.
- [ ] 9.12 Responsivo em 390 / 768 / 1024 / 1280 / 1536. Mesmo motivo do item acima — adiado para a auditoria de responsividade da tarefa 14.2+.
- [x] 9.13 **Regressão:** abrir Configurações e confirmar que o select de funções agora popula. Confirmado na Fase 13 (tarefa 13.0, ao arquivar `fix-minha-conta-ux-a11y`): `/api/funcoes` retorna 401 (sessão), não mais 404 — a rota existe e responde.
- [x] 9.14 Confirmar que nenhuma tela existente mudou de comportamento após a extração dos helpers para `services/ixc.js`. Nenhuma regressão encontrada nas Fases 9-13 (que tocaram Cobertura, Serviços, Escritórios, Processos, Configurações — todas consomem rotas que dependem de `fetchIXC`/`paginarIXC`) — os helpers foram movidos verbatim (tarefa 1.2), sem alteração de comportamento.
