# Aplicar Curva Varredora no Layout de Login

O objetivo é implementar o estilo visual "Opção B" discutido anteriormente. Isso consiste em criar uma curva ampla e orgânica no canto superior esquerdo do painel do formulário (branco), fazendo-o sobrepor de forma suave e elegante a área de ilustração.

## ⚠️ Revisão do Usuário Necessária
Esta é uma mudança estritamente visual (CSS/Tailwind). Não afeta a lógica de autenticação. Confirme se as classes e raios da curva (`80px`) estão alinhados com sua expectativa de design.

## Mudanças Propostas

### 1. `src/components/Login.jsx`
- O contêiner principal (`grid`) **deixará de ser** totalmente branco (`bg-white`).
- Ele **receberá o gradiente** de fundo para que essa cor preencha a área vazada pela curva.
- O painel direito (onde fica o `LoginForm`) **receberá o fundo branco** e a classe de curva apenas para desktop (`bg-white rounded-none lg:rounded-tl-[80px]`), além de uma leve sombra lateral para dar a ilusão de profundidade.

#### [MODIFY] Login.jsx
- Editar o `div` principal (linha ~58).
- Editar o `div` que envolve o `<LoginForm />`.

### 2. `src/components/Login/LoginIllustration.jsx`
- Precisamos **remover o fundo** deste componente, já que o gradiente foi movido para o contêiner pai no `Login.jsx`.
- Isso garante que não haja problemas de bordas duras ou inconsistências de cor no encontro da ilustração com a curva do formulário.

#### [MODIFY] LoginIllustration.jsx
- Remover `bg-gradient-to-br from-[#EAF4FF] via-[#F0F8FF] to-[rgba(74,158,245,0.05)]` da div principal.

## Plano de Verificação

### Verificação Manual
1. Abrir o navegador no modo Desktop e visualizar a tela de login.
2. Confirmar se o formulário à direita possui uma grande curva superior esquerda (80px) sobrepondo o fundo da ilustração.
3. Redimensionar para o modo Mobile e garantir que o layout retorne a uma única coluna branca fluida (sem a curva quebrada).
