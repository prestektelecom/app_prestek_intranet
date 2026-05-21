## 1. Componente TiSupportModal

- [x] 1.1 Adicionar estado `solicitantes` (array `[{ id, nome }]`) inicializado com o usuário logado
- [x] 1.2 Adicionar estado `solicitanteSelecionado` inicializado com o nome do usuário logado
- [x] 1.3 Substituir o texto estático de solicitante no banner informativo por referência a `solicitanteSelecionado`
- [x] 1.4 Adicionar campo `<select>` com label monospace uppercase, estilizado com inline styles da paleta `C`
- [x] 1.5 Atualizar o `handleSubmit` para enviar `nome_solicitante: solicitanteSelecionado` ao invés do nome fixo do usuário

## 2. Verificação

- [x] 2.1 Validar que ao abrir o modal, o `<select>` já exibe o nome do usuário logado selecionado
- [x] 2.2 Validar que o banner informativo atualiza dinamicamente ao mudar a seleção
- [x] 2.3 Validar que o payload enviado ao backend contém o `nome_solicitante` correto conforme a seleção
- [x] 2.4 Verificar que os estilos do `<select>` estão alinhados ao padrão do Dashboard (borda `C.line`, fundo `C.bg`, fonte "Plus Jakarta Sans")
