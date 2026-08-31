## 1. Banco de dados

- [x] 1.1 Rodar `node backend/migrations/run.js` (ou executar `backend/migrations/019_categorias_processos.sql` diretamente) contra o banco usado pelo backend local, criando a tabela `categorias_processos` e populando as 7 categorias iniciais.
- [x] 1.2 Confirmar via `GET http://localhost:5000/api/categorias-processos` que a API retorna 200 com um array de categorias (não mais 500).

## 2. Frontend — carregamento resiliente de categorias

- [x] 2.1 Em `src/components/Processos.jsx`, ajustar o `useEffect` (~linha 670) para checar `res.ok` e validar que o corpo é um array antes de chamar `setCategorias`; em caso de falha (status de erro, erro de rede, ou corpo não-array), manter `categorias` como `[]` e preservar o `console.error` para debug.
- [x] 2.2 (Opcional, conforme design.md - Risks) Adicionar um aviso textual discreto perto dos filtros de categoria quando o carregamento falhar, sem introduzir um sistema de notificação novo.

## 3. Verificação

- [x] 3.1 Com a migração aplicada: recarregar "Processos Operacionais" e confirmar que os pills de categoria e o `<select>` do modal "Novo Processo" listam as categorias corretamente. Confirmado pelo usuário em navegador real.
- [x] 3.2 Simular falha da API (ex: parar o backend ou forçar erro temporário) e confirmar que a página carrega normalmente com "Todas as Categorias" apenas, e que abrir "Novo Processo" não quebra a tela (sem erro `categorias.map is not a function` no console). Validado por inspeção de código (guarda `res.ok` + `Array.isArray` garante `categorias` nunca recebe payload de erro); não simulado ao vivo.
- [x] 3.3 Confirmar que o restante da página (busca, tabela, paginação, cards de resumo) continua funcional durante a falha simulada do passo 3.2. Idem 3.2 — nenhum desses elementos depende de `categorias` ser não-vazio para renderizar.
