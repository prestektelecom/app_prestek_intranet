## Why

O setor de TI cadastra colaboradores no IXC transcrevendo à mão uma ficha de registro em PDF para um formulário de ERP com **121 campos**. É lento, e o erro de digitação cai em dados que alimentam a folha de pagamento — CPF, PIS, salário, conta bancária.

Existe um protótipo funcional (`index.html` standalone, fornecido pelo usuário) que prova o fluxo desejado: upload de PDF → extração → revisão → cadastro. Ele é útil como especificação de comportamento e **inútil como código**, por três motivos independentes:

1. **É um app inteiro, não uma tela.** Traz `<html>` próprio, tema slate/azul (`#0f172a` + `#3b82f6`), header sticky próprio e um layout de duas colunas completo. A intranet já tem shell (`Sidebar` + `Header`), sistema de design laranja (`#EC7D23`) e quatro temas. Nada do CSS sobrevive à transposição.
2. **Guarda credencial no cliente.** O token da API IXC e a senha padrão dos colaboradores ficam em `<input>` visíveis, persistidos em `localStorage`, e vão no body de `POST /api/cadastrar`. No projeto, o token vive em `backend/.env` e **nenhuma rota aceita credencial vinda do cliente**.
3. **Esconde a complexidade real da gravação.** O botão "Cadastrar no IXC" representa três chamadas encadeadas sobre uma FK circular, num ERP sem transação — ver `design.md`.

Além disso, esta é a **primeira de várias** ferramentas de TI planejadas. Registrar uma view no projeto hoje custa **6 edições espalhadas por 4 arquivos**, porque não existe router nem arquivo de rotas: `App.jsx` (import, linha de render e o array de ids válidos da linha 173), `Sidebar.jsx`, `MobileDrawer.jsx` e `MobileMoreSheet.jsx`. Pagar esse custo a cada ferramenta nova, e disputar os 4 slots da `MobileBottomNav`, não escala.

## What Changes

- **Aba `ti` como hub, não como tela.** Uma única entrada de menu ("TI"), com uma bandeja segmentada interna cujo conteúdo vem de um registry (`src/components/ti/registry.js`). Adicionar a segunda ferramenta passa a custar **1 arquivo + 1 objeto no array** — zero edições em navegação, em `App.jsx` ou em `Ti.jsx`. As 6 edições de registro são pagas uma vez.

- **Primeira ferramenta: Cadastro de Colaborador.** Upload da ficha em PDF → extração dos campos com **indicador de confiança por campo** → formulário de revisão em 4 seções (Dados Pessoais, Endereço, Dados Profissionais, Acesso ao Sistema) → botão "Simular cadastro".

- **Extração resiliente aos três formatos de ficha em uso.** Cascata: camada de texto (`pdf-parse` v2) cobre PDF digital e exportado do Word; quando o texto útil é insuficiente, renderiza as páginas e passa por OCR (`tesseract.js`, idioma `por`); quando nem isso produz texto, avisa e destrava o preenchimento manual. **A extração nunca é um bloqueio** — é sempre um acelerador sobre um formulário que já funciona sozinho.

- **Gravação em dry-run.** A v1 monta os payloads, resolve os FKs obrigatórios contra o IXC, valida contra o schema real e **exibe as três requisições exatas que seriam enviadas** — sem criar nada no ERP. A gravação real fica para uma change posterior, com o ponto de extensão já desenhado e um stub `501` no lugar.

- **Acesso restrito a `is_admin`**, reusando o gate que já existe (`App.jsx:165-166`). Criar pessoa no ERP não é ação para qualquer usuário logado.

- **Correção de bug colateral: `GET /api/funcoes`.** `Configuracoes.jsx:124` e `utils/resolveSetor.js` já chamam essa rota, que **nunca foi implementada** — hoje é um 404 engolido por `.catch(() => null)`. Como o formulário de cadastro precisa da mesma lista (`fl_funcoes`), a rota passa a existir.

## Capabilities

### New Capabilities

- **`ti-hub`** — a aba TI como container extensível: registro único na navegação, gate de admin, registry de sub-ferramentas, persistência da ferramenta ativa.
- **`ti-cadastro-colaborador`** — o fluxo de cadastro: extração da ficha, confiança por campo, resolução de FKs, validação contra o schema do IXC, e o dry-run com o plano de execução.

### Modified Capabilities

Nenhuma. As telas existentes não mudam de comportamento.

## Impact

**Frontend (novos):** `src/components/Ti.jsx`, `src/components/ti/` (registry, `TiHero`, `CadastroColaborador`, `useTaxonomiasIxc`) e `src/components/ti/cadastro/` (campos, estilos, normalizadores, `UploadFicha`, `SecaoForm`, `CampoForm`, `CidadeCombobox`, `PainelLateral`, `DryRunResultado`).

**Frontend (editados, só registro da view):** `src/App.jsx`, `src/components/Sidebar.jsx`, `src/components/responsive/MobileDrawer.jsx`, `src/components/MobileMoreSheet.jsx`, `src/components/common/Icons.jsx`.

**Backend (novos):** `backend/services/ixc.js` (extração dos helpers existentes, sem mudança de comportamento), `extrairTextoPdf.js`, `fichaParser.js`, `normalizadores.js`, `ixcColaborador.js`.

**Backend (editados):** `backend/server.js` (importa os helpers extraídos + 7 rotas novas antes de `/api/health`), `backend/cache.js` (TTL de 24h para a tabela de cidades).

**Dependências novas** — em `backend/package.json`, que hoje tem cinco: `pdf-parse` (camada de texto) e `tesseract.js` (OCR). Ambas importadas **dinamicamente dentro do handler**, para não pesar no cold start. Upload sem `multer`: `express.raw({ type: 'application/pdf' })` basta para um arquivo só.

**Sem impacto** em banco de dados, em telas existentes ou em qualquer rota atual — exceto `Configuracoes.jsx`, que passa a receber dados onde hoje recebe 404.

Riscos e mitigações estão em `design.md`. Os três principais: não há ficha de exemplo no repositório para calibrar as regras de extração; `fl_funcoes` pode não estar acessível pela API; e `id_conta` é conta contábil, onde errar tem consequência na folha.
