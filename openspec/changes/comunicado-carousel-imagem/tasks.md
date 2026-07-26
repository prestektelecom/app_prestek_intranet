## 1. Banco de Dados e Backend

- [x] 1.1 Criar arquivo de migration `backend/migrations/019_add_imagem_url_comunicados.sql` adicionando a coluna `imagem_url TEXT`
- [x] 1.2 Atualizar `backend/server.js` na rota `POST /api/comunicados` para aceitar `imagem_url`
- [x] 1.3 Atualizar `backend/server.js` na rota `PUT /api/comunicados/:id` para atualizar `imagem_url`

## 2. Formulário de Comunicados

- [x] 2.1 Atualizar estado inicial de `formData` em `src/components/Comunicados.jsx` incluindo `imagem_url: ''`
- [x] 2.2 Adicionar input de texto "URL da Imagem de Capa (opcional)" no modal de cadastro/edição de comunicados em `Comunicados.jsx`

## 3. Carousel no ComunicadoBanner

- [x] 3.1 Refatorar `ComunicadoBanner` em `src/components/Dashboard.jsx` para selecionar os 3 comunicados de maior prioridade (`Urgente` / `Importante` / recentes)
- [x] 3.2 Implementar estado `currentIndex` e `isHovered` para controlar a rotação dos slides
- [x] 3.3 Adicionar `useEffect` com `setInterval` de 6000ms para avançar os slides quando `!isHovered` e `slides.length > 1`
- [x] 3.4 Implementar renderização dos slides com efeito fade de opacidade suave e background da `imagem_url`
- [x] 3.5 Adicionar barra/dots de navegação (`● ○ ○`) no canto inferior do banner com manipulador `onClick` que altera o `currentIndex` com `e.stopPropagation()`
