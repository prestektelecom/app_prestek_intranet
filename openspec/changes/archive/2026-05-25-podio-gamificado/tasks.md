## 1. Setup e Importação de Recursos

- [x] 1.1 Importar o utilitário de avatares `resolveAvatarUrl` e a constante `AVATAR_PNGS` de `src/utils/avatarPngs.js` para o arquivo `src/components/ServicesDirectory.jsx`.
- [x] 1.2 Declarar o estado ou referência no componente para controlar o carregamento do script de confete e sua execução segura.

## 2. Implementação da Gamificação e Avatares

- [x] 2.1 Criar a função utilitária helper `getDeterministicAvatar` em `src/components/ServicesDirectory.jsx` que aplica a heurística determinística (primeiro nome e ID) para selecionar o avatar correspondente de `AVATAR_PNGS`.
- [x] 2.2 Substituir o ícone genérico `person` no slide "Top 3 Colaboradoras" pela renderização do avatar 3D resolvido por `getDeterministicAvatar`.
- [x] 2.3 Substituir o ícone genérico `person` no slide "Ticket Médio" pela renderização do avatar 3D resolvido por `getDeterministicAvatar`.
- [x] 2.4 Ajustar o estilo dos contêineres de avatar para permitir exibição adequada das imagens circulares com brilho suave e bordas arredondadas.

## 3. Comemoração de Confetes e Destaques Premium

- [x] 3.1 Implementar a função utilitária `triggerConfetti()` para injeção dinâmica da CDN do `canvas-confetti` no DOM e disparo de confetes nas laterais da tela.
- [x] 3.2 Configurar o hook `useEffect` no componente para disparar a função `triggerConfetti()` sempre que o `activeSlide` for atualizado para 1 (Colaboradoras) ou 2 (Ticket Médio).
- [x] 3.3 Adicionar os estilos premium no 1º colocado de cada pódio (Top Planos, Top Colaboradoras e Ticket Médio), incluindo a coroa flutuante e o gradiente com brilho azul pulsante (`glow`).

## 4. Testes e Validação

- [x] 4.1 Validar a inicialização do app e carregamento da página de Serviços Internos.
- [x] 4.2 Verificar se as colaboradoras do Top 3 e Ticket Médio exibem os avatares 3D reais e correspondentes.
- [x] 4.3 Testar a injeção do script e o disparo de confetes ao alternar para os slides de Colaboradoras e Ticket Médio.
- [x] 4.4 Verificar a harmonia do layout com o design responsivo nos modos claro e escuro.
