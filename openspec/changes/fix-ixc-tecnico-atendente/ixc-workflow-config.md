# Configuracao do Workflow no IXC Soft

## Problema

O workflow "CHAMADO SUPORTE DE T.I (Dev)" (processo ID `237`) cria uma Ordem de Servico (`su_oss_chamado`) automaticamente ao abrir um ticket (`su_ticket`).

Atualmente ele **nao herda** o campo `id_responsavel_tecnico` do ticket para o campo `id_tecnico` da OS. Por isso a OS nasce com `id_tecnico = 0` e `status = "A"` (Aberto), mesmo quando o ticket ja tem tecnico definido.

A intranet nao consegue corrigir isso via API porque:
- O workflow cria a OS antes da intranet conseguir criar uma manual
- PUT na OS do workflow retorna sucesso mas nao persiste `id_tecnico`, `status` nem `data_agenda`
- Eventos de encaminhamento/agendamento (4 e 5) sao bloqueados por permissao do token

## Solucao

Configurar o workflow no IXC Soft para que, na tarefa que cria a OS, ele copie o tecnico do ticket e ja deixe a OS agendada.

## Passo a passo

### 1. Acessar o workflow

No IXC Soft:
- Menu: **Sistema > Workflow > Processos**
- Localizar o processo: **CHAMADO SUPORTE DE T.I (Dev)**
- ID do processo: `237`
- Abrir para edicao

### 2. Localizar a tarefa que cria a OS

Dentro do workflow, encontrar a tarefa/acao que executa o comando de criacao da `su_oss_chamado`.

Geralmente e uma tarefa do tipo:
- "Criar OS"
- "Gerar ordem de servico"
- Ou uma tarefa vinculada a acao de criacao do registro `su_oss_chamado`

### 3. Alterar o mapeamento de campos

Na tarefa de criacao da OS, garantir que os seguintes campos sejam preenchidos:

| Campo da OS (`su_oss_chamado`) | Valor esperado | Origem |
|---|---|---|
| `id_cliente` | `681` | Fixo (cliente Prestek) |
| `id_login` | `1` | Fixo |
| `id_contrato` | `18426` | Fixo |
| `id_filial` | `1` | Fixo |
| `id_assunto` | `1154` | Fixo (Sup. TI) |
| `id_ticket` | ID do ticket | `su_ticket.id` |
| `id_ticket_setor` | `16` | Fixo |
| `setor` | `54` | Fixo |
| `id_cidade` | `1721` | Fixo |
| `id_tecnico` | `59570` ou `59841` | **`su_ticket.id_responsavel_tecnico`** |
| `prioridade` | `N` | Fixo |
| `origem_endereco` | `CC` | Fixo |
| `status` | `"AG"` | Fixo (para ja nascer agendada) |
| `data_agenda` | data/hora atual | Funcao de data do IXC |
| `data_agenda_final` | hoje 23:59:59 | Funcao de data do IXC |

**Importante:** o campo `id_tecnico` deve ser mapeado a partir de `su_ticket.id_responsavel_tecnico`.

### 4. Definir as datas de agendamento

Se o workflow permitir funcoes/expressoes, usar:
- `data_agenda` = data/hora atual (mesmo minuto)
- `data_agenda_final` = data atual + `23:59:59`

Exemplo de formato: `2026-06-29 14:30:00`

### 5. Salvar e publicar o workflow

Apos fazer as alteracoes:
- Salvar
- Publicar/ativar a nova versao do workflow
- Verificar se o processo continua vinculado ao assunto `1154` e ao canal de atendimento usado pela intranet

## Teste no IXC Soft

1. Acesse o painel do IXC
2. Abra um ticket de TI manualmente
3. No ticket, preencha o campo **Responsavel tecnico** com `MARCIO EDUARDO FELIX` (59570) ou `EVERTON DOS SANTOS VIEIRA` (59841)
4. Salve/execute o workflow
5. Verifique a OS criada:
   - Campo **Colaborador responsavel** deve estar preenchido
   - Status deve ser **AG** (Agendada)
   - Deve aparecer data de agendamento

## Teste pela Intranet

Apos configurar o workflow, abra um chamado de TI pela intranet:
1. Selecione um tecnico
2. Abra o chamado
3. Anote o protocolo
4. No IXC Soft, localize a OS pelo protocolo
5. Confirme que:
   - `id_tecnico` corresponde ao tecnico selecionado
   - Status e `AG`
   - Historico mostra o tecnico vinculado

## Contato / Suporte

Se nao for possivel editar o workflow internamente, entrar em contato com o suporte do IXC Soft informando:
- Processo: `CHAMADO SUPORTE DE T.I (Dev)` (ID `237`)
- Necessidade: herdar `su_ticket.id_responsavel_tecnico` para `su_oss_chamado.id_tecnico` e criar a OS com `status = "AG"`
