## ADDED Requirements

### Requirement: Configuração de região não assume classificação inexistente
O formulário de configuração de uma região (`OverrideModal`) SHALL apresentar tecnologia, status e percentual de cobertura sem nenhuma opção pré-selecionada quando a região não tiver esses dados, em vez de assumir os valores mais comuns como se já fossem a classificação real.

Enquanto um campo não tiver sido alterado pelo administrador, o formulário SHALL exibir uma indicação visual de que o valor ainda não foi definido.

#### Scenario: Região sem nenhum dado abre sem seleção
- **WHEN** o administrador abre a configuração de uma região sem `tecnologia`, `status` ou `percentual_cobertura` cadastrados
- **THEN** nenhuma opção de tecnologia ou status aparece marcada, e o percentual aparece como não definido
- **AND** cada campo exibe uma indicação de que ainda não foi definido

#### Scenario: Região já configurada preserva os valores existentes
- **WHEN** o administrador abre a configuração de uma região que já tem tecnologia, status ou percentual cadastrados
- **THEN** o formulário exibe os valores existentes normalmente, sem a indicação de "não definido"

### Requirement: Contraste e área de toque dos controles de alternância
Os controles de alternância de visão (Mapa/Lista) e de ordenação da Central de Cobertura SHALL usar, no estado ativo, um tom de texto que passa 4,5:1 de contraste em todos os cinco temas (`--accent-dark`), não o tom de marca (`--accent`) diretamente. O toggle Mapa/Lista SHALL ter altura efetiva de no mínimo 44px, e o ícone de configuração de região SHALL ter área de toque efetiva de no mínimo 44px, mesmo quando a caixa visual for menor.

#### Scenario: Toggle ativo legível nos cinco temas
- **WHEN** o toggle Mapa/Lista ou o toggle de ordenação está no estado ativo, em qualquer tema
- **THEN** seu contraste de texto contra o fundo é de no mínimo 4,5:1

#### Scenario: Alvo de toque do ícone de configuração
- **WHEN** o ícone de configuração de uma região é renderizado
- **THEN** sua área de toque efetiva (incluindo a expansão invisível) mede no mínimo 44px
