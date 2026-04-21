# Análise Crítica: Poluição na Raiz do Backend

## Descrição do Problema
A raiz do diretório `backend/` contém mais de **120 arquivos**, a maioria dos quais são scripts de teste, diagnósticos pontuais e arquivos JSON de backup ou log.

Exemplos de arquivos identificados:
- `test_*.js` (dezenas de variacoes de testes de API).
- `check_*.js` (verificações de banco e serviços).
- `diagnostico_*.js` (scripts de auditoria e correção).
- `*.json` (dados de OS, funcionários e resultados de auditoria).

## Impactos
- **Confusão Visual**: Dificulta a identificação dos arquivos de configuração e infraestrutura reais (como `db.js`, `cache.js`, `server.js`).
- **Segurança**: Arquivos `.json` com dados reais do IXC ou banco podem estar expostos ou serem versionados indevidamente.
- **Padronização**: Falta de diretório dedicado para ferramentas de suporte e manutenção.

## Sugestão de Melhoria
1. Criar uma pasta `/backend/tools` ou `/backend/scripts` para mover todos os utilitários de diagnóstico e teste.
2. Criar uma pasta `/backend/tmp` ou utilizar `.gitignore` para arquivos `.json` de dados temporários.
3. Manter na raiz apenas arquivos essenciais de configuração e o arquivo principal do servidor.
