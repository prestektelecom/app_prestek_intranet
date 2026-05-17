# Novo Design da Tela de Login

Este documento descreve o plano para substituir a tela de login atual da intranet pela nova versão "Variant B (Floating dual card)", de acordo com os protótipos fornecidos no diretório `nova_tela_de_login`. 

A nova versão apresenta um visual mais limpo, corporativo e moderno, removendo os efeitos interativos antigos (como fundo de partículas e areia magnética) em favor de um fundo com gradiente radial sutil e um grande card central dividido em duas colunas (Ilustração e Formulário).

## User Review Required

> [!WARNING]
> **Componentes a serem removidos:** 
> O novo design requer a remoção de efeitos como o `ParticlesBackground` e o `MagneticSandCard`. Você aprova a remoção definitiva destes componentes visuais antigos?
>
> **Migração para Tailwind:**
> O protótipo fornecido em `login-b.jsx` utiliza CSS inline. Planejo traduzir todos esses estilos para **Tailwind CSS**, que é o padrão utilizado no projeto. Você concorda com essa abordagem?

## Open Questions

> [!NOTE]
> A ilustração geométrica/isométrica fornecida no protótipo (`<Illustration />`) atua como um placeholder no código original. Devemos manter o código SVG dessa ilustração fornecida ou existe alguma outra imagem/asset oficial 3D que você gostaria de usar no lugar?
> 
> As estatísticas (`99.99% Uptime SLA`, `1.2M Endpoints`, etc.) devem ser dados estáticos por agora ou planeja conectá-los a alguma API no futuro?

## Proposed Changes

### Componentes de Login

Modificações nos componentes dentro de `src/components/` e `src/components/Login/`.

#### [DELETE] `src/components/ParticlesBackground.jsx`
- Remover este componente, pois não faz parte do novo design limpo.

#### [DELETE] `src/components/MagneticSandCard.jsx`
- Remover este componente de efeito visual que não será mais utilizado.

#### [DELETE] `src/components/Login/LoginHeader.jsx` & `LoginFooter.jsx`
- Estes componentes isolados serão absorvidos na nova estrutura do card e no layout principal de `Login.jsx`.

#### [NEW] `src/components/Login/Icons.jsx`
- Criar um arquivo para exportar todos os SVGs da nova interface: `PrestekMark`, `Brand`, `UserIcon`, `LockIcon`, `EyeIcon`, `ArrowIcon` e `ShieldIcon`.

#### [NEW] `src/components/Login/LoginIllustration.jsx`
- Novo componente para o painel esquerdo do card duplo.
- Conterá a marca (Logo), o status pill ("All systems operational"), a ilustração geométrica SVG e os blocos de estatísticas.

#### [MODIFY] `src/components/Login/LoginForm.jsx`
- Refatorar completamente o código para utilizar a nova aparência visual do formulário (Variant B).
- Criar internamente (ou em arquivo separado) o componente `<Field />` para os inputs customizados.
- Substituir botões e checkboxes para os novos estilos utilizando classes do Tailwind.
- Manter toda a lógica atual de autenticação e comunicação com a API intocada.

#### [MODIFY] `src/components/Login.jsx`
- Atualizar a estrutura da página inteira.
- Adicionar o fundo radial, as "soft blobs" desfocadas (usando utilitários `blur` do Tailwind) e a estampa pontilhada.
- Adicionar a estrutura do card principal (`grid-cols-2` no Desktop e `grid-cols-1` no Mobile).
- Chamar `<LoginIllustration />` e `<LoginForm />`.

## Verification Plan

### Automated Tests
- N/A para esta alteração primariamente visual.

### Manual Verification
- Visualizar a página de login para garantir fidelidade com o protótipo.
- Testar a responsividade da página: em telas menores (mobile), o painel da ilustração deve ser ocultado ou as colunas empilhadas (segundo o protótipo `.html` ele oculta a ilustração em `< 900px`).
- Executar um fluxo de login válido e inválido para certificar de que a integração do `LoginForm.jsx` modificado continua funcionando corretamente e exibindo mensagens de erro de forma satisfatória.
