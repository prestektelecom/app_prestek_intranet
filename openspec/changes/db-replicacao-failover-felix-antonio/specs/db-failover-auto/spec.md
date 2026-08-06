## Purpose

Define o comportamento de failover: quando o nó PRIMÁRIO se torna inacessível, o STANDBY assume o papel de PRIMÁRIO, mantendo o serviço disponível.

## Status

**BLOQUEADO.** A versão anterior desta spec prescrevia `repmgrd` como mecanismo, com Felix e Antonio nomeados nos requisitos. Ambas as premissas caíram no levantamento:

- `repmgr` está ausente da imagem `postgres:14` do Felix e não é instalável via apt (não há PostgreSQL bare-metal ali). Seu modelo pressupõe controle do ciclo de vida do PostgreSQL via systemd e SSH nó-a-nó, o que conflita com o Docker Swarm que gerencia o container — ver D2 em `design.md`.
- O Felix não hospeda o banco da intranet, então nunca foi candidato a PRIMÁRIO.

Os requisitos abaixo estão redigidos em termos de **comportamento observável**, sem prescrever ferramenta, para sobreviverem à decisão de topologia (D3). Se o failover automático for descartado em favor de promoção manual, esta capability é removida da change e os requisitos viram procedimento operacional.

## ADDED Requirements

### Requirement: Detecção de falha do PRIMÁRIO

A falha do nó PRIMÁRIO SHALL ser detectada em no máximo 30 segundos, por verificação ativa de conectividade.

#### Scenario: PRIMÁRIO para de responder

- **WHEN** o PRIMÁRIO deixa de responder na porta do PostgreSQL por mais de 30 segundos
- **THEN** o processo de promoção do STANDBY SHALL ser iniciado

#### Scenario: Falha de rede breve não dispara promoção prematura

- **WHEN** o PRIMÁRIO fica inacessível por menos de 15 segundos
- **THEN** nenhuma promoção SHALL ocorrer

### Requirement: Promoção do STANDBY

Confirmada a falha, o STANDBY SHALL assumir o papel de PRIMÁRIO e passar a aceitar escritas.

#### Scenario: Promoção concluída

- **WHEN** o failover é acionado
- **THEN** o STANDBY SHALL ser promovido e aceitar escritas em no máximo 60 segundos após a detecção da falha

#### Scenario: Promoção registrada em log

- **WHEN** um nó é promovido
- **THEN** o evento SHALL ser registrado com timestamp, motivo e nó promovido

### Requirement: Backend acompanha a troca de papel sem reinício

O backend SHALL migrar para o novo PRIMÁRIO sem reinicialização do processo Node.

#### Scenario: Migração transparente

- **WHEN** o nó em uso pelo backend cai e o outro nó é promovido
- **THEN** o backend SHALL detectar a queda, reavaliar os hosts candidatos e adotar o novo PRIMÁRIO — comportamento já entregue pela capability `db-multi-host-connection`

### Requirement: Retorno do nó antigo sem risco de split-brain

Quando o nó que falhou volta, ele SHALL entrar como STANDBY do nó atualmente PRIMÁRIO. A reversão de papéis SHALL exigir ação manual explícita.

#### Scenario: Nó recuperado entra como STANDBY

- **WHEN** o nó que falhou volta ao ar
- **THEN** SHALL assumir o papel de STANDBY e sincronizar o que perdeu, sem se autopromover

#### Scenario: Reversão manual de papéis

- **WHEN** o administrador solicita explicitamente a troca de papéis
- **THEN** a troca SHALL ocorrer somente após o nó de destino estar plenamente sincronizado, sem perda de transações confirmadas

## Open Questions

- Failover automático é mesmo necessário, ou promoção manual documentada atende? Automático adiciona risco de falso positivo e exige um mecanismo de quórum que 2 nós não fornecem.
- Se automático: qual mecanismo, dado que repmgr está descartado sob Swarm (D2) e Patroni exige um terceiro nó para quórum?
