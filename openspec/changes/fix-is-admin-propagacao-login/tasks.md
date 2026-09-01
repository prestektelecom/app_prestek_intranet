## 1. Instrumentação temporária de diagnóstico

- [x] 1.1 Em `src/App.jsx`, dentro do callback `onLogin` (linha ~128), adicionar temporariamente `alert(JSON.stringify(resultado, null, 2))` logo no início, antes de qualquer transformação.
- [x] 1.2 Adicionar um segundo `alert(JSON.stringify(userData, null, 2))` logo após a montagem de `userData`, antes de `setUser(userData)`.
- [x] 1.3 Pedir para o usuário (marciofelix@) fazer logout completo (botão "Sair") e login novamente, e reportar o conteúdo dos dois alerts.

## 2. Diagnóstico

- [x] 2.1 Com base nos dois alerts, determinar se `resultado.usuario.is_admin` já chega `false`/ausente (aponta para backend/rede/`loginUsuario`) ou se chega `true` mas `userData.is_admin` não (aponta para a montagem em `App.jsx`). **Achado: ambos os alerts mostraram `is_admin: true`** — o problema NÃO está no login nem na montagem de `userData`; o valor correto chega até `setUser(userData)`.
- [x] 2.2 (não foi necessário repetir — resultado já foi conclusivo na primeira tentativa)
- [x] 2.4 (Adicionado — evidência do 2.1 aponta para depois do `setUser`) Instrumentar visivelmente `src/components/Sidebar.jsx` no ponto exato onde o menu "TI" é filtrado (~linha 431), exibindo `user?.is_admin` e `user?.email` recebidos pela Sidebar, sem depender de DevTools. **Achado: `user?.is_admin = true` também ali** — e o usuário confirmou por print que o item "TI" estava presente, ativo e funcionando o tempo todo.
- [x] 2.3 Localizar a causa raiz exata no trecho de código identificado. **Conclusão da investigação: NÃO HÁ bug de propagação de `is_admin`.** O menu "TI" sempre funcionou. O sintoma real relatado pelo usuário — "não aparece o botão Gerenciar Categorias" — tinha outra causa: em `src/data/processosData.js:72`, `export const PROCESSOS = []` é um mock estático vazio. Como `Processos.jsx` usa `lista.length === 0` para decidir entre mostrar o `EmptyState` (tela "Nenhum processo cadastrado ainda") ou a barra de busca/filtros, e a barra de filtros é onde vive o botão "Gerenciar Categorias", qualquer usuário — admin ou não — via a tela vazia sem acesso a esse botão, independente do valor de `is_admin`. Confirmado por print de tela do usuário mostrando "Processos: 0" no hero e o estado vazio.

## 3. Correção

- [x] 3.1 Aplicar a correção mínima na causa raiz identificada no passo 2.3. Em `src/components/Processos.jsx`, a condição que decide entre `EmptyState` e o conteúdo completo (busca/filtros/tabela) passou de `lista.length === 0` para `lista.length === 0 && !user?.is_admin` — agora um admin sempre vê a barra de filtros (e "Gerenciar Categorias") mesmo com zero processos cadastrados; usuários não-admin continuam vendo o `EmptyState` de boas-vindas quando não há processos.
- [x] 3.2 Remover os dois `alert()` temporários adicionados nas tasks 1.1 e 1.2, e o bloco de diagnóstico visível adicionado na task 2.4 em `Sidebar.jsx`.

## 4. Verificação

- [x] 4.1 marciofelix@ faz logout completo e login novamente; confirmar que o menu "TI" aparece no Sidebar. Confirmado por print — já funcionava antes de qualquer correção de código.
- [x] 4.2 Confirmar que o botão "Gerenciar Categorias" aparece em Processos Operacionais mesmo com "Processos: 0" no hero (cenário real do usuário, após a correção da task 3.1). Confirmado por print de tela do usuário. Nesse mesmo print, notou-se poluição visual adicional (botão "Exportar Lista" desabilitado isolado, tabela vazia com paginação "0 de 0", 7 cards repetindo "0 processos") — corrigido como melhoria de layout na mesma sessão: a barra de filtros continua visível para admin com lista vazia, mas a tabela/paginação/cards de resumo (que só fazem sentido com dados) foram substituídos por um único `EmptyState` limpo, e o botão "Exportar Lista" só aparece quando há processos.
- [x] 4.3 Confirmar que um usuário com `is_admin = false` (ex: qualquer um dos outros 11 usuários listados em `usuarios_perfil`) continua vendo o `EmptyState` de boas-vindas (sem a barra de filtros/Gerenciar Categorias) quando não há processos — a correção não deve mudar o comportamento para não-admins. Garantido pela própria condição `lista.length === 0 && !user?.is_admin` na barra de filtros (inalterada para quem não é admin) — verificação por leitura de código, não testado ao vivo com conta não-admin.
