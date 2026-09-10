# not-found-screen Specification

## Purpose

Tela de erro de navegação do portal nas duas situações que existem: a view não existe (ou a sessão caiu) e a view existe mas o papel do usuário não permite; ilustração que respeita o tema e ação de voltar coerente com a sessão.

## Requirements

### Requirement: Duas variantes com copy honesta
A tela SHALL ter a variante "não encontrado" ("Esta página não existe") e a variante "sem permissão" ("Você não tem acesso a esta área", com orientação de falar com a TI). A ação principal SHALL ser "Voltar para o Início" para quem está autenticado e "Voltar para o login" para quem não está.

#### Scenario: View inexistente autenticado
- **WHEN** um usuário autenticado chega a uma view que não existe
- **THEN** vê "Esta página não existe" e o botão "Voltar para o Início"

#### Scenario: Área restrita
- **WHEN** um usuário sem papel de admin chega a uma view de admin
- **THEN** vê "Você não tem acesso a esta área" com um cadeado, sem nenhum conteúdo da área

### Requirement: Ilustração que respeita o tema
A ilustração da variante "não encontrado" SHALL usar as cores do tema (tinta e accent) e SHALL ter contraste mínimo de 3:1 contra o card em todos os temas. A variante "sem permissão" SHALL NOT carregar a ilustração da outra variante.

#### Scenario: Escuro
- **WHEN** a variante "não encontrado" abre no Default Dark ou no AMOLED
- **THEN** a ilustração é visível, nas cores do tema

#### Scenario: Sem permissão
- **WHEN** a variante "sem permissão" abre
- **THEN** nenhum asset da ilustração de 404 é transferido

### Requirement: Foco e teclado
Ao abrir a tela, o foco SHALL ir para o título ou para a ação principal, e a ação SHALL ser o primeiro controle alcançável por Tab dentro do conteúdo. A ação principal SHALL ter no mínimo 44px de altura e texto com contraste mínimo de 4,5:1 em todos os temas.

#### Scenario: Teclado
- **WHEN** a tela abre e o usuário pressiona Tab a partir do conteúdo
- **THEN** o foco chega em "Voltar para o Início" antes de qualquer outro controle da página
