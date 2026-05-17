# Dashboard Customization (Drag and Drop)

We have successfully transformed the static Intranet Dashboard into an interactive, personalized workspace using **react-grid-layout**.

## O que foi implementado

1. **Backend & Persistência (PostgreSQL)**
   - Criamos os endpoints `GET /api/user/dashboard-layout` e `POST /api/user/dashboard-layout`.
   - O layout modificado por cada usuário agora é armazenado via *upsert* na tabela `user_dashboard_layouts` utilizando o tipo de dado JSONB.

2. **Frontend & Grid Dinâmico (React Grid Layout)**
   - Instalamos as dependências `react-grid-layout` e os estilos base.
   - Refatoramos completamente o `Dashboard.jsx`, substituindo o CSS Grid nativo pela estrutura gerada pelo componente `<ResponsiveReactGridLayout>`.
   - Incluímos uma lógica para converter todos os Cards e Bentos anteriores (HeroCard, Eficiencia, Plantao, Atalhos, etc) em **widgets** que respeitam os identificadores do layout.

3. **Modo "Personalizar Dashboard"**
   - Para evitar acidentes e cliques errados na interface de arrastar e soltar, adicionamos o estado `isEditing`. 
   - Ao ativar a personalização, a grid ganha bordas pontilhadas sônicas e uma indicação de quais elementos estão soltos para a edição, além dos cursores de *grab* mudarem quando hoverizados.
   - O botão *Salvar Layout* envia as configurações de eixo (x,y) e dimensões (w,h) que ficam salvas permanentemente no banco.

> **Como testar:** Na tela de Início (Dashboard), clique no botão **"Personalizar Dashboard"** no canto superior direito da grid, redimensione e arraste os cards. Ao clicar em **"Salvar Layout"** e recarregar a página, a nova organização permanecerá intacta!
