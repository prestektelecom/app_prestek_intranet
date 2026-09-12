## Why

O `ComunicadoBanner` no topo do Dashboard atualmente exibe apenas 1 comunicado fixo. O usuário deseja que o banner funcione como um **carousel automático** que transite suavemente entre os **3 últimos comunicados de maior prioridade (Urgente e Importante)**, além de permitir o envio de imagens de capa no cadastro/edição de comunicados para enriquecer a experiência visual.

## What Changes

- **Backend & Database**:
  - Migration SQL para adicionar a coluna `imagem_url TEXT` na tabela `comunicados`.
  - Atualização dos endpoints `POST /api/comunicados` e `PUT /api/comunicados/:id` no `server.js` para receber e persistir `imagem_url`.
- **Formulário de Comunicados (`Comunicados.jsx`)**:
  - Adição do campo de input "URL da Imagem de Capa" no formulário modal de cadastro e edição.
- **Carousel no Banner (`Dashboard.jsx`)**:
  - Transformar `ComunicadoBanner` em um carousel automático rotativo com os 3 últimos comunicados prioritários (`Urgente` ou `Importante`).
  - Troca automática a cada 6 segundos com efeito fade suave (`opacity` transition).
  - Indicadores de navegação (dots `● ○ ○`) no canto inferior direito do banner para troca manual e visualização do slide ativo.
  - Pausa automática do timer quando o usuário passa o mouse por cima (hover).

## Capabilities

### New Capabilities
- `comunicado-carousel`: Banner rotativo com auto-play, navegação por dots, transição fade e pausa no hover para os 3 comunicados principais.
- `comunicado-imagem-capa`: Suporte a campo `imagem_url` no banco de dados, API e formulário de comunicados.

### Modified Capabilities
- `comunicado-banner-destaque`: O banner estático de 1 item é promovido a um carousel dinâmico de até 3 comunicados de alta relevância.

## Impact

- **`backend/migrations/019_add_imagem_url_comunicados.sql`**: Nova migration.
- **`backend/server.js`**: Atualização dos SQLs de INSERT/UPDATE da tabela `comunicados`.
- **`src/components/Comunicados.jsx`**: Atualização do estado do formulário e campo de input de imagem.
- **`src/components/Dashboard.jsx`**: Refatoração do `ComunicadoBanner` para suporte a carousel com estado do slide ativo.
