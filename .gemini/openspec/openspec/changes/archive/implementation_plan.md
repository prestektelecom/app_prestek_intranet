# Plano de Implementação - Gerenciamento de Escritórios

O objetivo deste plano é transformar a lista estática de escritórios (atualmente lida de `officesData.js`) em um sistema dinâmico, permitindo que administradores possam criar, editar e excluir unidades diretamente pela interface.

## User Review Required
> [!IMPORTANT]
> A transição para um banco de dados requer a criação de uma nova tabela e a migração dos dados atuais. Verifique se os campos propostos atendem a todas as necessidades atuais e futuras.

## Open Questions
> [!NOTE]
> 1. A cor padrão (`cor`) associada a cada escritório tem sido definida manualmente (ex: Matriz = Laranja, AL = Azul, SE = Verde). Ao criar um novo escritório, o sistema deve deduzir a cor baseado no tipo/estado, ou o administrador deve escolher a cor manualmente num *color picker*?
> 2. O usuário comum do sistema verá alguma mudança além de ver os dados atualizados em tempo real? (Atualmente, assumo que apenas usuários com `isAdmin` verdadeiro verão os botões de edição).

## Proposed Changes

### Backend (Banco de Dados e API)
O armazenamento dos escritórios precisa ser movido para o banco de dados PostgreSQL.

#### [NEW] Script de Migração (ex: `backend/migrations/create_escritorios_table.js`)
- Criar a tabela `escritorios`:
  - `id` (SERIAL PRIMARY KEY)
  - `nome` (VARCHAR)
  - `tipo` (VARCHAR) - Ex: 'Matriz', 'Filial'
  - `cidade` (VARCHAR)
  - `estado` (VARCHAR 2)
  - `endereco` (TEXT)
  - `cep` (VARCHAR)
  - `lat` (NUMERIC)
  - `lng` (NUMERIC)
  - `cor` (VARCHAR)
- Migrar os dados existentes do arquivo estático para a nova tabela.

#### [MODIFY] `backend/server.js`
- Adicionar rotas RESTful para `escritorios`:
  - `GET /api/escritorios` - Retorna a lista de escritórios.
  - `POST /api/escritorios` - Cria um novo escritório.
  - `PUT /api/escritorios/:id` - Atualiza um escritório existente.
  - `DELETE /api/escritorios/:id` - Exclui um escritório.

---

### Frontend (Interface do Usuário)
A interface precisará consumir a API e fornecer formulários para usuários administradores.

#### [MODIFY] `src/components/Offices.jsx`
- **Estado Dinâmico:** Remover o import estático `officesData.js` e implementar um `useEffect` para buscar os dados via `GET /api/escritorios`.
- **Controle de Acesso:** Obter o usuário logado (ex: via `useLogin` ou contexto de usuário) para verificar a propriedade `isAdmin`.
- **Ações de Admin:**
  - Adicionar um botão **"Adicionar Escritório"** no cabeçalho (visível apenas para admins).
  - Adicionar ícones de **Editar** e **Excluir** ao lado de cada item na lista lateral de escritórios.
- **Modal de Formulário:** Implementar um modal contendo os campos:
  - Nome, Tipo (Dropdown), Cidade, Estado (Dropdown ou Texto), Endereço, CEP, Latitude, Longitude, Cor.
- **Integração com o Mapa:** Garantir que o mapa (Leaflet) re-renderize os marcadores dinamicamente após qualquer operação de criação, edição ou exclusão.

#### [DELETE] `src/data/officesData.js`
- Remover o arquivo após confirmar que a migração dos dados para o PostgreSQL e a integração com o frontend foram concluídas com sucesso.

## Verification Plan

### Manual Verification
1. **Verificação de Permissões**: Acessar com um usuário comum e confirmar que os botões de edição NÃO aparecem. Acessar com um usuário admin e confirmar que eles aparecem.
2. **Operação CRUD**: 
   - Criar um escritório teste e verificar se ele aparece no mapa e na lista.
   - Editar o escritório teste (ex: alterar endereço e cor) e confirmar se as alterações refletem na interface e no banco de dados.
   - Excluir o escritório teste e confirmar sua remoção da interface.
3. **Persistência**: Recarregar a página e garantir que todos os dados continuam corretos e renderizando o mapa normalmente.
