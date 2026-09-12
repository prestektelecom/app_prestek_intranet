## ADDED Requirements

### Requirement: Persistência de imagem de capa nos comunicados
O sistema SHALL suportar a gravação e alteração do campo `imagem_url` para cada comunicado no banco de dados e nos endpoints da API.

#### Scenario: Cadastro com imagem de capa
- **WHEN** o administrador cadastra um comunicado informando uma URL no campo "URL da Imagem de Capa"
- **THEN** o backend grava a `imagem_url` no PostgreSQL e retorna o registro salvo na resposta JSON

#### Scenario: Edição de imagem de capa
- **WHEN** o comunicado é editado alterando ou inserindo o campo `imagem_url`
- **THEN** a alteração é gravada e refletida imediatamente nas buscas

---

### Requirement: Carousel automático no ComunicadoBanner
O componente `ComunicadoBanner` SHALL exibir até 3 comunicados de alta relevância (Urgente/Importante) em rotação automática.

#### Scenario: Rotação dos 3 slides
- **WHEN** existem 2 ou 3 comunicados com tag Urgente ou Importante
- **THEN** o banner altera o comunicado exibido a cada 6 segundos usando efeito de fade suave

#### Scenario: Pausa ao passar o mouse
- **WHEN** o usuário posiciona o cursor do mouse sobre o banner (`onMouseEnter`)
- **THEN** a rotação automática é temporariamente pausada até o cursor sair (`onMouseLeave`)

#### Scenario: Navegação manual pelos dots
- **WHEN** o usuário clica em um dos pontos de indicação de slide (`● ○ ○`)
- **THEN** o slide ativo muda imediatamente para o comunicado correspondente sem alterar a navegação principal da página
