## 1. Alteração de Código

- [x] 1.1 Adicionar estado `isExpanded` no componente `SectorCard` em [Sectors.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Sectors.jsx)
- [x] 1.2 Atualizar o estilo da descrição para responder ao estado `isExpanded`
- [x] 1.3 Inserir o botão "Ver mais" / "Ver menos" condicionado a `description.length > 90`

## 2. Verificação e Validação

- [x] 2.1 Validar que setores com descrição curta (ex: TI) não exibem o botão
- [x] 2.2 Validar que setores com descrição longa (ex: Atendimento) exibem o botão e expandem/recolhem corretamente ao clicar
- [x] 2.3 Garantir que o clique no botão de expansão não ativa outras ações indesejadas no card
