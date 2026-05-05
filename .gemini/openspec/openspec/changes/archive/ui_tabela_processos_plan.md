# Plano de Melhoria de UX/UI: Tabela de Processos

Este plano detalha as implementações para transformar a tabela atual de Processos em uma interface mais moderna, amigável e com responsividade avançada (utilizando o padrão "Cards" para mobile).

## Mudanças Propostas

### 1. Transformar Linhas em Hitbox (Clicáveis)
- **O que faremos:** Adicionar a ação `onClick={() => abrirEditar(p)}` diretamente na `<tr>` e a classe `cursor-pointer`.
- **Prevenção de Conflitos:** Nos botões da coluna de Ações, será adicionado `e.stopPropagation()` para que, ao clicar diretamente no botão de "Ver POP", o modal de edição não seja aberto acidentalmente.

### 2. Layout Híbrido: Cards (Mobile) e Tabela (Desktop)
Em vez de forçar o usuário do celular a arrastar a tabela para a direita para ver todas as colunas, o layout será adaptativo.
- **Desktop (`md:block`):** A tabela tradicional existente continuará sendo exibida em telas a partir de 768px (tablets e monitores).
- **Mobile (`md:hidden`):** A tabela será ocultada e substituída por uma lista vertical de "Cards" arredondados. Cada Card exibirá o ID, Status, Nome, Descrição e as Ações organizadas de maneira agradável para visualização em telas estreitas.

### 3. Simplificação da Coluna de Ações
- O botão "Ver POP" (com texto + ícone) ocupa muito espaço e polui a interface visualmente.
- **Solução:** Transformar os botões da coluna de "Ações" em "Ghost Buttons" minimalistas contendo apenas os ícones (`edit` e `open_in_new`). Eles terão um *hover* sutil arredondado (`hover:bg-primary/10`) e os atributos `title` atuarão como mini-tooltips. 
- O alinhamento ficará mais limpo e reduzirá a largura da coluna.

---

### Alterações Estruturais no Código

#### Componente `Processos.jsx`

**Criação da Exibição Mobile (Cards):**
Será injetado um novo bloco condicional renderizando a lista de processos para celulares.
Exemplo da estrutura do Card (simplificado):
```jsx
<div className="block md:hidden">
    {processosPagina.map(p => (
        <div key={p.id} onClick={() => abrirEditar(p)} className="p-4 border-b border-[#eaddcd] dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2c2217]">
            <div className="flex justify-between items-start mb-2">
                <span className="font-mono font-bold text-primary text-sm">{p.id}</span>
                <StatusBadge status={p.status} />
            </div>
            <h3 className="font-bold text-[#1d150c] dark:text-white text-base">{p.nome}</h3>
            <p className="text-xs text-[#a17745] dark:text-orange-400 mb-2">{p.responsavel.setor}</p>
            <p className="text-sm text-[#a17745] dark:text-orange-300 line-clamp-2 mb-4">{p.descricao}</p>
            {/* ...Ações no rodapé do card... */}
        </div>
    ))}
</div>
```

**Alteração na Tabela Desktop:**
- A tabela será envelopada em uma `div` com a classe `hidden md:block overflow-x-auto`.
- As linhas receberão `cursor-pointer`.
- As células de "Ações" serão padronizadas.

## User Review Required

> [!IMPORTANT]
> - O uso de Cards no Mobile vai melhorar imensamente a usabilidade (nada de scroll horizontal).
> - Deixarei a ordenação das colunas (sort) de fora nesta etapa para manter a complexidade baixa e focada puramente na interface. Podemos adicionar ordenação de dados em um próximo momento se desejar.
> 
> Gostou da proposta? Se estiver de acordo, pode aprovar e eu prosseguirei com as alterações no código!

## Plano de Verificação
1. Validar interface no Desktop: Tabela limpa, botões de ação minimalistas com hover, cursor aparecendo ao passar sobre a linha.
2. Validar o comportamento de Hitbox: Clicar na linha deve abrir a edição. Clicar em "Ver POP" deve abrir a nova aba e não o modal.
3. Validar interface no Mobile: Inspecionar como iPhone 12/Pixel. A tabela deve sumir e dar lugar aos Cards responsivos.
