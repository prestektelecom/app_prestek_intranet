## ADDED Requirements

### Requirement: Exibição legível do número de protocolo sem transbordo
O modal de sucesso de chamado de TI SHALL exibir o número de protocolo gerado sem transbordo visual na caixa do container. A caixa SHALL ter um tamanho responsivo e o texto do protocolo SHALL quebrar linha se a largura ultrapassar o limite interno, garantindo a exibição integral do número.

#### Scenario: Visualização do protocolo longo com quebra de linha
- **WHEN** o chamado é criado com sucesso e o IXC Soft retorna um número de protocolo longo (como 20 dígitos ou mais)
- **THEN** o modal SHALL exibir o número do protocolo inteiramente dentro de uma caixa container estilizada
- **THEN** o texto do número de protocolo SHALL quebrar linha (word-break) se necessário, sem estourar as bordas laterais do container
