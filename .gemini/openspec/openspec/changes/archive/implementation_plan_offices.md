# Mapa Interativo de Escritórios — Aba Escritórios

Adicionar um mapa interativo usando **Leaflet** (já instalado no projeto) na aba **Escritórios** da intranet, exibindo as 18 unidades/filiais da Prestek com pins clicáveis, popups com endereço completo e uma lista lateral navegável.

---

## Decisões de Design

> [!IMPORTANT]
> **Leaflet já está instalado** (`leaflet ^1.9.4` + `react-leaflet ^4.2.1`) — nenhuma dependência nova necessária.
> As coordenadas serão **hardcoded** no arquivo de dados (`officesData.js`), evitando chamadas externas à API Nominatim e garantindo velocidade de carregamento imediata.

> [!NOTE]
> O projeto já tem `CoverageMap.jsx` como referência de padrão Leaflet. O novo componente seguirá a mesma arquitetura (import dinâmico, `useRef`, `useEffect`).

---

## Dados das Unidades (18 no total)

| # | Nome | Cidade/UF | Endereço |
|---|------|-----------|----------|
| 1 | PENEDO/AL (MATRIZ) | Penedo - AL | Rodovia Mário Freire Leahy, 1658 - Sr. do Bonfim |
| 2 | PENEDO/AL (CENTRO) | Penedo - AL | Av. Duque de Caxias, 253 - Centro Histórico |
| 3 | SÃO SEBASTIÃO/AL | São Sebastião - AL | Av. Antônio Custódio Pôrto, 171 |
| 4 | PIAÇABUÇU/AL | Piaçabuçu - AL | R. João S de Góis, 102 |
| 5 | IGREJA NOVA/AL | Igreja Nova - AL | R. Pedro Falcão, 48 |
| 6 | CORURIPE/AL | Coruripe - AL | R. da Oliveira, 34-172 - Vila do Mansinho |
| 7 | SÃO MIGUEL DOS CAMPOS/AL | São Miguel dos Campos - AL | Lot. Hélio Jatobá II, QD L2, Nº 57 |
| 8 | ESTÂNCIA/SE - PRESTEK | Estância - SE | Av. Raimundo Silveira Souza, 470 |
| 9 | PORTO REAL DO COLÉGIO/AL | Porto Real do Colégio - AL | R. da Alegria |
| 10 | BATALHA/AL | Batalha - AL | Av. Mair Guedes do Amaral, 146 - Centro |
| 11 | PINDORAMA/AL | Coruripe - AL | Av. Camaçari, 32 B |
| 12 | MAJOR ISIDORO/AL | Major Isidoro - AL | R. Cícero Ferreira de Souza, Sn, Centro |
| 13 | NEÓPOLIS/SE | Neópolis - SE | R. Dr. Eronildes de Carvalho, 249 - Centro |
| 14 | ILHA DAS FLORES/SE | Ilha das Flores - SE | Av. Barão do Rio Branco, 40, Centro |
| 15 | PROPRIÁ/SE | Propriá - SE | R. Nilo Peçanha, 1640 |
| 16 | JAPOATÃ/SE | Japoatã - SE | R. Dr. Augusto Falcão - Centro |
| 17 | CEDRO DE SÃO JOÃO/SE | Cedro de São João - SE | R. Antônio Batista |
| 18 | PINDORAMA/AL (2) | Coruripe - AL | Av. Camaçari, 32 B |

---

## Arquitetura

```
src/
├── components/
│   └── Offices.jsx          [NEW] — componente principal da aba
├── data/
│   └── officesData.js       [NEW] — 18 escritórios com coords fixas + metadados
└── App.jsx                  [MODIFY] — importar e renderizar <Offices/>
```

---

## Proposed Changes

### 1. Dados Estáticos dos Escritórios

#### [NEW] `officesData.js`

Arquivo com array de objetos contendo:
- `id`, `nome`, `tipo` (`"Matriz"` | `"Filial"`)
- `cidade`, `estado` (`"AL"` | `"SE"`)
- `endereco`, `cep`
- `lat`, `lng` (coordenadas fixas já pesquisadas)
- `cor` — diferenciador visual: matriz = laranja Prestek, filial AL = azul, filial SE = verde

---

### 2. Componente Principal

#### [NEW] `src/components/Offices.jsx`

**Layout em duas colunas:**
- **Coluna esquerda (35%)** — lista lateral scrollável com cards de cada escritório, filtrável por estado (AL / SE / Todos) e pesquisa por nome/cidade
- **Coluna direita (65%)** — mapa Leaflet com pins clicáveis

**Funcionalidades do mapa:**
- Centralizado em `[-10.2, -36.8]` zoom 8 (cobre AL + SE)
- Pin da **MATRIZ** em cor `#F97316` (laranja) com tamanho maior
- Pins das filiais AL em `#3B82F6` (azul)
- Pins das filiais SE em `#10B981` (verde)
- Ao clicar num pin → popup com nome, endereço, CEP e badge de tipo (MATRIZ / FILIAL)
- Ao clicar num card da lista → mapa faz `flyTo()` naquela unidade e abre popup

**Header do componente:**
- Título "Escritórios Prestek" com ícone `apartment`
- Badge com contagem total: "18 unidades em 2 estados"
- Filtros rápidos: `Todos` | `Alagoas` | `Sergipe`
- Campo de busca

**Visual:**
- Estilo consistente com o restante da intranet (dark mode, cores `#a17745`, bordas `#f4eee6`)
- Cards com hover effect e animação de seleção
- Badge "MATRIZ" em destaque laranja no card da unidade principal

---

### 3. Integração no App

#### [MODIFY] `src/App.jsx`

```diff
+ import Offices from './components/Offices'

  // No bloco de renderização:
+ {currentView === 'offices' && <Offices user={user} />}

  // Na lista de views válidas do fallback:
- ['dashboard','services','coverage','directory','sectors','schedule','processes','announcements','settings','tickets']
+ ['dashboard','services','coverage','directory','sectors','schedule','processes','announcements','settings','tickets','offices']
```

---

## Verificação

### Testes Automáticos
- `npm run dev` já está rodando — verificação visual no browser após criação dos arquivos

### Verificação Manual
- [ ] Mapa carrega sem erro ao acessar aba Escritórios
- [ ] 18 pins aparecem no mapa
- [ ] Clicar num pin abre popup com dados corretos
- [ ] Clicar num card da lista faz flyTo() no mapa
- [ ] Filtros AL / SE funcionam corretamente
- [ ] Dark mode funcionando
- [ ] MATRIZ tem destaque visual diferenciado

---

## Open Questions

> [!IMPORTANT]
> **Coordenadas das unidades:** As coordenadas serão pesquisadas e definidas durante a implementação usando dados geográficos do OpenStreetMap. Confirme se isso é adequado, ou se prefere usar a API Nominatim em tempo real (como no CoverageMap existente).

> [!NOTE]
> **"PINDORAMA/AL"** — o endereço informado é `Av. Camaçari, 32 B - Coruripe/AL`, ou seja, está geograficamente em Coruripe. Confirme se o nome da unidade está correto assim mesmo.

> [!NOTE]
> **Unidade 18 duplicada?** A lista do usuário tem dois registros com endereço em Coruripe (CORURIPE/AL e PINDORAMA/AL, ambos com endereços diferentes). Foram mantidos como unidades distintas.
