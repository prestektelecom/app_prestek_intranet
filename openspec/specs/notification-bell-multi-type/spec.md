# notification-bell-multi-type Specification

## Purpose
Tipos de comunicado exibidos no sino: Urgente e Importante (Geral não aparece).

## Requirements

### Requirement: Sino exibe Urgente e Importante
O sino SHALL buscar e exibir comunicados dos tipos **Urgente** e **Importante**. Comunicados do tipo Geral NÃO devem aparecer no sino.

#### Scenario: Badge aparece com comunicado Urgente
- **WHEN** a API retorna ao menos um comunicado com `tipo === 'Urgente'` não visto
- **THEN** o badge é exibido na cor vermelha (`C.danger`) no ícone do sino

#### Scenario: Badge aparece com comunicado Importante (sem Urgente)
- **WHEN** a API retorna comunicados com `tipo === 'Importante'` mas nenhum com `tipo === 'Urgente'` não visto
- **THEN** o badge é exibido na cor amarela (`C.warning`) no ícone do sino

#### Scenario: Dropdown lista Urgentes e Importantes separados por tipo
- **WHEN** o usuário abre o sino e há comunicados Urgentes e Importantes
- **THEN** cada card no dropdown exibe o ícone e cor corretos para seu tipo (`priority_high`/vermelho para Urgente; `notification_important`/amarelo para Importante)

#### Scenario: Badge não exibe comunicados Gerais
- **WHEN** a API retorna somente comunicados com `tipo === 'Geral'`
- **THEN** nenhum badge é exibido no sino
