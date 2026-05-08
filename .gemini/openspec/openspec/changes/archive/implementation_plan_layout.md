# Plano de Implementação - Ajuste de Layout na Aba Escritórios

Você solicitou um planejamento para fixar a barra superior (cabeçalho) e criar uma barra de rolagem para a lista lateral de escritórios. 

Atualmente, o layout utiliza flexbox (`flex-1 overflow-hidden`), mas em algumas resoluções ou dependendo do contêiner pai, isso pode fazer com que a página inteira role, "escondendo" o cabeçalho, ou a barra de rolagem pode ficar com o visual padrão (grosso) do navegador.

## Proposed Changes

### 1. Fixar o Cabeçalho (Header)
Para garantir que o cabeçalho fique fixo no topo e nunca seja rolado junto com o conteúdo:
- Adicionar as classes `flex-shrink-0` (para evitar que ele seja espremido) e `z-10 relative` (para ficar acima do mapa e do conteúdo).
- Como precaução extra contra problemas de herança de altura, podemos transformá-lo em `sticky top-0 z-20`.

### 2. Barra de Rolagem (Scrollbar) na Lista Lateral
A `div` da lista já possui `overflow-y-auto`, mas precisamos garantir duas coisas:
- Que ela não cresça infinitamente (adicionando `min-h-0` no contêiner pai para forçar o limite do flexbox).
- Que a barra tenha um visual elegante (Custom Scrollbar). Podemos adicionar estilos CSS customizados no `index.css` (como `::-webkit-scrollbar`) ou usar utilitários customizados (ex: `scrollbar-thin`, `scrollbar-thumb-primary`) se houver suporte.

### [MODIFY] `src/components/Offices.jsx`
- **Cabeçalho:** 
  ```diff
  - <div className="px-6 py-4 border-b border-[#f4eee6] dark:border-[#2c2217] bg-white dark:bg-[#1a130b]">
  + <div className="px-6 py-4 border-b border-[#f4eee6] dark:border-[#2c2217] bg-white dark:bg-[#1a130b] flex-shrink-0 sticky top-0 z-20">
  ```
- **Contêiner Principal:**
  ```diff
  - <div className="flex flex-col flex-1 overflow-hidden bg-[#fdf8f3] dark:bg-[#120d08]">
  + <div className="flex flex-col h-full bg-[#fdf8f3] dark:bg-[#120d08] relative">
  ```
- **Lista Lateral:** Adicionar uma classe customizada `custom-scrollbar` para estilizar a barra.
  ```diff
  - <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
  + <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-2 min-h-0">
  ```

### [MODIFY] `src/index.css` (ou onde os estilos globais estiverem)
- Adicionar o CSS para a classe `.custom-scrollbar` para deixar a rolagem fina e estilizada, combinando com o tema (laranja/marrom).

```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #eaddcd;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #2c2217;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #c4a882;
}
```

## Open Questions
> [!NOTE]
> 1. O layout da Intranet possui uma barra de navegação principal (Sidebar global)? Se sim, o cabeçalho dos escritórios precisa considerar um espaçamento superior?
> 2. O comportamento atual do mapa deve se manter inalterado (ocupando 100% da altura disponível ao lado da lista)?

## Verification Plan
1. **Teste Visual**: Encher a lista de escritórios (ou diminuir a altura da janela) para forçar o scroll.
2. **Rolagem**: Confirmar que o cabeçalho permanece travado no topo.
3. **Scrollbar**: Confirmar que a barra de rolagem está fina, estilizada e visível apenas no espaço da lista lateral.
