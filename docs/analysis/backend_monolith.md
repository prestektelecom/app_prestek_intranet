# Análise Crítica: Monolito no Backend

## Descrição do Problema
O arquivo `backend/server.js` atingiu um tamanho crítico de aproximadamente **2.700 linhas**. Este arquivo centraliza todas as responsabilidades do servidor:
- Configuração de Middlewares (CORS, JSON).
- Gerenciamento de Conexões com o Banco de Dados.
- Lógica de Proxy para o Sistema IXC (incluindo retries e timeouts).
- Gerenciamento de Cache manual.
- Roteamento de dezenas de endpoints (Login, Comunicados, Funcionários, OS, etc.).
- Lógica de negócio intercalada com as rotas.

## Impactos
- **Manutenibilidade**: Dificuldade extrema de localizar bugs ou implementar melhorias sem causar efeitos colaterais.
- **Escalabilidade**: O arquivo tende a crescer indefinidamente conforme novas funcionalidades são adicionadas.
- **Arquitetura**: Viola o princípio de responsabilidade única (SRP).

## Sugestão de Melhoria
Implementar uma refatoração estrutural (Pattern Layered Architecture):
1. **Routes**: Mover as definições de endpoints para uma pasta `/backend/routes`.
2. **Controllers**: Isolar a lógica de tratamento de requisições em `/backend/controllers`.
3. **Services**: Mover a lógica de integração com o IXC e manipulação de dados para `/backend/services`.
4. **Middlewares**: Isolar validações e tratamentos comuns em `/backend/middlewares`.
