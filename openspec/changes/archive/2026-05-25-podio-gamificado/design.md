## Context

A seção de Pódios de Vendas no componente `ServicesDirectory.jsx` exibe o ranking de vendas (Planos, Colaboradoras e Ticket Médio) utilizando um carrossel automático (`activeSlide`). Atualmente, os colaboradores no ranking são exibidos com o ícone genérico do Material Symbols (`person`). A gamificação e a melhoria visual do pódio visam trazer um visual muito mais interativo e moderno para incentivar o time de vendas.

## Goals / Non-Goals

**Goals:**
- Substituir o ícone genérico `person` por avatares 3D reais mapeados a partir de `avatarPngs.js` no ranking de Colaboradoras e Ticket Médio.
- Desenvolver e aplicar uma lógica determinística para selecionar avatares baseados no gênero (heurística de primeiro nome) e no ID dos colaboradores.
- Carregar dinamicamente a biblioteca `canvas-confetti` via CDN e disparar confetes virtuais quando as abas de conquistas de colaboradores (slides de Colaboradoras e Ticket Médio) ficarem ativas.
- Melhorar o design do pódio de vendas adicionando efeitos de glow azul/ciano, coroa flutuante 3D e medalhas decorativas para o Top 3.

**Non-Goals:**
- Modificar tabelas de banco de dados ou endpoints do backend para guardar ou retornar URLs de avatares (toda a lógica de seleção de avatares deve ser determinística no frontend).
- Modificar o fluxo de dados da API `/api/top-vendedores`.

## Decisions

### 1. Injeção Dinâmica do script `canvas-confetti` via CDN
- **Decisão**: Carregar a biblioteca `canvas-confetti` via CDN inserindo a tag `<script>` no DOM apenas quando necessário.
- **Alternativa Considerada**: Instalar `canvas-confetti` como dependência no `package.json`. No entanto, como essa comemoração visual é exclusiva desta tela, o carregamento via CDN dinâmico reduz o bundle inicial e preserva a performance da aplicação geral.
- **Implementação**: Uma função utilitária `triggerConfetti()` verificará se `window.confetti` já está definido. Caso contrário, criará um script apontando para a CDN, disparando o efeito logo após o evento `onload`.

### 2. Lógica Determinística para Seleção de Avatares 3D
- **Decisão**: Utilizar uma heurística no frontend sobre o primeiro nome e o ID do colaborador para determinar a escolha do avatar na lista `AVATAR_PNGS`.
- **Regra da Heurística**: 
  - Se o primeiro nome do vendedor terminar com as letras 'a', 'e', 'i' (característicos de nomes femininos na língua portuguesa), escolhemos um avatar da faixa feminina de `AVATAR_PNGS` (índices 32 a 47) utilizando a fórmula `32 + (id % 16)`.
  - Caso contrário, escolhemos um avatar masculino (índices 0 a 31) utilizando `id % 32`.
- **Vantagem**: Garante avatares condizentes e consistentes (mesmo avatar para a mesma vendedora) sem exigir novos campos no banco de dados.

### 3. Melhoria Visual e Efeitos de Gamificação
- **Decisão**: Adicionar sombras coloridas personalizadas com CSS inline e classes Tailwind para gerar um efeito de brilho (`glow`) de acordo com a posição (ouro, prata e bronze).
- **Coroa Flutuante**: O vencedor (1º lugar) do pódio receberá um destaque extra com uma coroa premium flutuando logo acima do avatar, estilizada com brilho dourado e uma animação suave de levitação (`animate-bounce` simplificada ou CSS transition).

## Risks / Trade-offs

- **[Risco] Bloqueio de carregamento da CDN**: Se o cliente do usuário final bloquear scripts externos ou CDNs (por exemplo, devido a um adblocker restritivo), a biblioteca de confete não será executada.
  - *Mitigação*: A função de confete será encapsulada dentro de um bloco try/catch e verificações de existência de objeto no window para evitar que erros de rede quebrem o componente React. O restante da interface continuará funcionando normalmente.
- **[Risco] Erros de gênero na heurística de nomes**: Algumas vendedoras podem ter nomes que fogem da regra padrão (ex: nomes unissex ou grafias estrangeiras).
  - *Mitigação*: Sendo uma heurística puramente visual e estética para gamificação, eventuais inconsistências pontuais não afetam a funcionalidade das vendas. No futuro, se for necessário, podemos permitir a seleção manual de avatares nas configurações de perfil.
