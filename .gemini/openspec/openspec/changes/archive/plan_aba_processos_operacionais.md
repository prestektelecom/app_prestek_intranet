# Planejamento Estratégico: Ativação da Aba "Processos Operacionais"

Este documento detalha o planejamento estratégico para a ativação e otimização da aba "Processos Operacionais" na Intranet da Prestek. O objetivo é transformar a interface estática atual em um repositório dinâmico, organizado e intuitivo de Procedimentos Operacionais Padrão (POPs), integrando-se aos dados reais e documentos do Google Docs (como o POP-T.I-01).

## 1. Análise dos Documentos e Mapeamento Atual

- **Documento Base (Google Docs):** A análise do link fornecido (`POP-T.I-01`) revela que os documentos de processos da Prestek possuem um "Controle Histórico" padronizado contendo: *Revisão, Data, Elaboração, Verificação, e Aprovação*. 
- **Situação da Interface Atual:** O arquivo `src/components/Processos.jsx` atualmente possui dados "hardcoded" (fixos) na tabela e nos cards de resumo, ignorando a estrutura rica já definida em `src/data/processosData.js`.
- **Gaps Identificados:** 
  - Desconexão entre a UI e a base de dados central.
  - A navegação entre categorias (botões no topo da tabela) é inativa.
  - O campo de busca visual não filtra os resultados.

## 2. Oportunidades de Otimização e Visualização Intuitiva

- **Dinamização de Dados:** Refatorar `Processos.jsx` para mapear e consumir a constante `PROCESSOS` de `processosData.js`.
- **Filtros e Busca em Tempo Real:** Implementar a lógica React para que a barra de busca e as abas de categoria filtrem os processos instantaneamente sem recarregar a página.
- **Visualização Detalhada Dinâmica:** Ao clicar em um processo, fornecer informações ricas diretamente na listagem ou permitir que o link abra diretamente o Google Docs do POP correspondente, otimizando o fluxo de leitura do colaborador.

## 3. Estrutura Hierárquica por Categorias

Manter e integrar ativamente as categorias estipuladas no sistema:
- Atendimento ao Cliente (`AT`)
- NOC / Infraestrutura (`NOC`)
- Vendas Comercial (`VD`)
- Financeiro (`FIN`)
- Recursos Humanos (`RH`)
- Tecnologia da Informação (`TI`)
- Operações Gerais (`OP`)

## 4. Templates Padronizados para Documentação Futura

Com base no `POP-T.I-01`, o template padrão de todo novo processo deverá exigir as seguintes meta-informações na Intranet:
- **Cabeçalho:** Título, ID Único, Categoria e Status (Ativo/Revisão/Rascunho).
- **Controle Histórico Estruturado:** Versão atual, Data da Última Modificação, Elaborador/Responsável.
- **Anexo:** URL do documento no Google Docs.

## 5. Versionamento e Controle de Alterações

- **Versionamento Semântico:** Adoção de versionamento simples (MAJOR.MINOR), como `1.0`, `1.1`, `2.0`.
  - *Minor (0.1)*: Pequenas correções de texto, links ou anexos secundários.
  - *Major (1.0)*: Alterações significativas no fluxo do processo ou políticas.
- A interface da intranet destacará visualmente, através de badges de status, os processos que estão "Em Revisão" alertando o colaborador.

## 6. Responsáveis e Permissões

- **Responsáveis (Colaboradores IXC):** A estrutura de dados já prevê `responsavel.funcionario_id`. Este ID será a ponte para puxar e exibir o nome dinamicamente da listagem de colaboradores ativos do IXC Soft já implementada no portal.
- **Permissões de Acesso:** A aba Processos Operacionais será configurada como **visão global (Todos veem tudo)**. Nenhum bloqueio de visualização será imposto, democratizando o acesso aos manuais e fluxos da Prestek.

## 7. Decisões Pendentes

- **Botão "Novo Processo":** Abordagem a definir entre: Modal Interno (recomendado), Google Forms, ou desabilitado com aviso de "Em breve".
