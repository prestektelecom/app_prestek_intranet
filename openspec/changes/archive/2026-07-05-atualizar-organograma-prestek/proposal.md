## Why

O organograma atual na página de Setores (`src/components/Sectors.jsx`) exibe uma estrutura genérica e plana (CEO → 4 diretorias) que não reflete a organização real da Prestek Telecom. É necessário atualizá-lo para representar a hierarquia real da empresa, mantendo o estilo visual Bento Blue já consolidado.

## What Changes

- Substituir a estrutura flat do componente `OrgChart` por uma árvore hierárquica de dois níveis.
- Atualizar o nó raiz para CEO **Severino Júnior** (Sócio Diretor).
- Criar 6 áreas de primeiro nível abaixo do CEO:
  - **Gerente Operacional** (Caroline)
  - **Supervisor Comercial** (responsável a definir — "?")
  - **Supervisor Relacionamento com Cliente** (Erika)
  - **Controladoria** (Roberta)
  - **RH / Cultura Performance** *(staff)*
  - **TI / Sistemas / BI** *(staff)*
- Adicionar os sub-setores abaixo de cada área, conforme organograma alvo.
- Representar as áreas de staff (RH e TI) com linhas tracejadas, diferenciando-as da linha operacional.
- Manter todos os estilos visuais atuais (cards dark, gradiente roxo, tipografia, sombras, responsividade).
- Não alterar o banco de dados PostgreSQL nem a listagem de "Diretório de Setores" abaixo do organograma.

## Capabilities

### New Capabilities
- `organograma-prestek`: Representação visual hierárquica da estrutura organizacional da Prestek no componente `OrgChart`.

### Modified Capabilities
- Nenhuma capability existente terá seus requisitos alterados. A mudança é estritamente visual e estrutural dentro do componente já existente.

## Impact

- `src/components/Sectors.jsx` — componente `OrgChart` e seus nós auxiliares (`OrgNode`).
- Nenhuma API do backend será criada ou modificada.
- Nenhuma dependência nova.
