# notification-seen-persistence Specification

## Purpose
Persistência no `localStorage`, por usuário, dos comunicados já vistos, para controlar o badge.

## Requirements

### Requirement: Estado visto persistido no localStorage por usuário e ID
O sistema SHALL persistir os IDs dos comunicados já vistos pelo usuário no `localStorage` sob a chave `notif_seen_{userId}`. O badge SHALL aparecer apenas para comunicados cujo `id` não esteja presente nessa lista.

#### Scenario: Badge não retorna após recarregar página
- **WHEN** o usuário abre o sino, marcando os comunicados como vistos, e então recarrega a página
- **THEN** o badge NÃO deve reaparecer para os mesmos comunicados

#### Scenario: Badge aparece para comunicado novo após persistência
- **WHEN** um novo comunicado Urgente ou Importante é criado (ID novo) e o polling o detecta
- **THEN** o badge aparece mesmo que comunicados anteriores já estejam no localStorage como vistos

#### Scenario: Persistência isolada por usuário
- **WHEN** dois usuários distintos compartilham o mesmo browser
- **THEN** cada um tem sua própria lista de vistos (chave `notif_seen_{userId}`)
