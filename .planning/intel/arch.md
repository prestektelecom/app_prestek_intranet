---
updated_at: "2026-04-08T21:15:00Z"
---

## Visão Geral da Arquitetura (Módulo de Cobertura)

O sistema de cobertura é um modelo híbrido que sincroniza dados em tempo real do ERP IXC com configurações manuais locais armazenadas em PostgreSQL.

## Fluxo de Dados

1. **Extração**: O backend busca todos os contratos ativos no IXC via `/webservice/v1/cliente_contrato`.
2. **Normalização (Crítico)**: Os bairros extraídos são tratados com `.trim().toUpperCase()` para garantir que variações de caixa (ex: "Centro" vs "CENTRO") sejam agrupadas na mesma entidade.
3. **Agrupamento**: Os contratos são agrupados pela chave `cidade_ixc_id::bairro`.
4. **Merge**: O sistema buscaOverrides na tabela local `cobertura_cidades` usando a mesma chave normalizada.
5. **Serviço**: A API retorna um objeto consolidado contendo estatísticas (total de contratos) e definições técnicas (tecnologia, velocidade).

## Componentes Chaves

| Componente | Caminho | Responsabilidade |
|-----------|------|---------------|
| Backend Server | `backend/server.js` | Gerencia o agrupamento de bairros e merge com banco local. |
| Cobertura Table | `cobertura_cidades` (DB) | Armazena overrides de tecnologia e status. |
| Coverage View | `src/components/Coverage.jsx` | Interface de administração e visualização do mapa. |

## Convenções de Bairros

- **Sempre** use `.toUpperCase()` ao comparar ou agrupar bairros vindos do IXC.
- A chave primária lógica para qualquer configuração regional é a combinação de `ID da Cidade (IXC)` + `Nome do Bairro (Normalizado)`.
