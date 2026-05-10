# Substituição do ui-avatars.com por Geração Local de Iniciais

O componente `TeamAvailability.jsx` atualmente depende do serviço externo `ui-avatars.com` para gerar imagens com as iniciais dos usuários que não possuem uma foto de perfil definida. 

Depender de um serviço externo para algo tão simples introduz:
- Problemas de privacidade (nomes de funcionários sendo enviados para uma API pública).
- Lentidão no carregamento e possíveis falhas de rede.
- Dependência de conexão com a internet para um recurso visual básico.

## User Review Required
> [!IMPORTANT]
> A solução proposta criará um novo componente reutilizável (`InitialsAvatar`) que pode ser usado em outras partes do sistema no futuro. Por favor, valide se a abordagem baseada em componentes agrada e se as cores propostas estão alinhadas com o design.

## Proposed Changes

### 1. Novo Componente: `src/components/common/InitialsAvatar.jsx`
Vamos criar um componente que:
- Recebe o `name` do usuário.
- Extrai até 2 letras iniciais (ex: "Marcio Eduardo" -> "ME").
- Gera uma cor de fundo determinística baseada no nome (para que o mesmo usuário sempre tenha a mesma cor).
- Retorna um `div` com a mesma estilização (Tailwind) que a imagem atual.

#### [NEW] InitialsAvatar.jsx
Implementação de um hash string-to-number para selecionar uma cor de uma paleta pré-definida de cores (Tailwind classes como `bg-blue-500`, `bg-emerald-500`, etc).

### 2. Modificação no Componente: `src/components/TeamAvailability.jsx`
Vamos substituir a tag `<img>` rígida por uma renderização condicional. Se o usuário tiver `member.foto`, exibe a imagem. Caso contrário, exibe o `InitialsAvatar`.

#### [MODIFY] TeamAvailability.jsx
- Importar `InitialsAvatar`.
- Atualizar o mapeamento `displayedMembers.map(...)` na linha 74.
- Remover as referências a `https://ui-avatars.com/api/`.

## Verification Plan
### Manual Verification
1. Abrir o Dashboard na rota padrão.
2. Observar o widget "Disponibilidade da Equipe" (Team Availability).
3. Verificar se usuários sem foto exibem um círculo com suas iniciais formatado corretamente (tamanho, borda e cor).
4. Desconectar a internet ou bloquear requisições externas para testar se os avatares continuam renderizando instantaneamente.
