# Oportunidade: Evolução da Navegação no Frontend

## Descrição da Situação Atual
A navegação do sistema é baseada em um estado centralizado no `App.jsx` (`currentView`). A troca de telas ocorre via renderização condicional simples:

```jsx
{currentView === 'dashboard' && <Dashboard />}
{currentView === 'tickets' && <TicketsList />}
// ...
```

## Benefícios do Modelo Atual
- **Simplicidade**: Sem dependências externas de roteamento.
- **Persistência Animada**: Fácil de controlar transições entre estados de view se necessário.

## Pontos Críticos / Oportunidades
- **Histórico do Navegador**: O botão "voltar" do navegador não funciona para alternar entre as views da aplicação, o que pode frustrar o usuário.
- **Deep Linking**: Impossibilidade de compartilhar um link direto para uma tela específica (ex: enviar o link da Escala de Plantão para um colega).
- **SEO/Indexação**: Embora seja uma intranet, a falta de slugs de URL dificulta a navegação interna e organização de módulos grandes.

## Sugestão de Melhoria
Integrar o **React Router** ou similar para:
1. Mapear cada view para uma rota (`/dashboard`, `/tickets`, `/schedule`).
2. Permitir que o usuário utilize a navegação nativa do browser.
3. Manter a lógica de permissões baseada no estado de login, mas agora atrelada às rotas.
