# Integração do SLA do IXC Soft no Cálculo de Eficiência

## Contexto

Atualmente, o cálculo de eficiência usa **apenas** o campo `data_prazo_limite`.
Porém, o IXC Soft possui um sistema de **SLA** que pode preencher os prazos das OS
em campos diferentes dependendo da configuração — podendo resultar em OS "sem prazo"
sendo descartadas do cálculo indevidamente.

Este plano expande a lógica para cobrir **todos os cenários de prazo do IXC Soft**.

---

## Campos Disponíveis nas OS (`su_oss_chamado`)

| Campo | Descrição | Preenchido por |
|---|---|---|
| `data_prazo_limite` | Prazo oficial de solução da OS | SLA automático ou manualmente |
| `data_prev_final` | Previsão de finalização da OS | Técnico ou SLA de segunda linha |
| `status_sla` | Situação do SLA (`A`=Ativo, `V`=Vencido, vazio) | IXC automático |
| `data_fechamento` | Data/hora real de encerramento | Técnico ao fechar |

> **Observação da amostra (`os-data.json`):** Tanto `data_prazo_limite` quanto
> `data_prev_final` estão **vazios** na OS de exemplo. Isso confirma que as OS do
> setor de TI podem não ter esses campos preenchidos — tornando o SLA crítico
> como ponto de verificação.

---

## Nova Hierarquia de Prazo (Regra de Negócio)

A nova lógica usará **prioridade de campos** para determinar o prazo de cada OS:

```
1º → data_prazo_limite   (prazo oficial — mais preciso)
2º → data_prev_final     (previsão gerada pelo SLA ou pelo técnico)
3º → OS descartada       (sem nenhum prazo = não entra no cálculo)
```

Não haverá mais o fallback de 72h — **o prazo deve sempre vir do IXC Soft**.

---

## User Review Required

> [!IMPORTANT]
> Confirmar com o setor de TI: quando vocês criam uma OS no IXC, o sistema
> **preenche automaticamente algum prazo** (via SLA configurado) ou o campo
> `data_prazo_limite` fica vazio por padrão?
> Isso define se o problema é na nossa lógica ou no processo de criação das OS.

> [!WARNING]
> Se os campos `data_prazo_limite` e `data_prev_final` estiverem **sempre vazios**
> nas OS do TI, significa que o SLA não está configurado no IXC para o assunto de TI.
> Nesse caso, antes de qualquer código, será preciso **configurar o SLA no IXC Soft**
> para que os campos sejam preenchidos automaticamente.

---

## Proposed Changes

### Backend — `server.js`

#### [MODIFY] [server.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/backend/server.js)

**Trecho a alterar:** Função `calcEficiencia` (linhas 715–732)

Mudança: substituir o acesso exclusivo a `data_prazo_limite` pela **hierarquia de campos**:

```javascript
// ANTES (atual)
const prazoLimite = os.data_prazo_limite;
if (!fechamento || !prazoLimite || ...) return;

// DEPOIS (novo)
const prazoEfetivo = [os.data_prazo_limite, os.data_prev_final]
    .find(d => d && d.trim() !== '' && d !== '0000-00-00 00:00:00' && d !== '0000-00-00');
if (!fechamento || !prazoEfetivo) return; // OS sem nenhum prazo — descarta
```

Também adicionar ao **retorno do endpoint** o campo `fonte_prazo` para facilitar debug:
```json
{
  "eficiencia_atual": 87,
  "total_os_mes": 15,
  "no_prazo_mes": 13,
  "os_sem_prazo": 2,      ← NOVO: quantas OS foram descartadas por falta de prazo
  "variacao": 5,
  "tendencia": "subindo"
}
```

---

### Frontend — `Dashboard.jsx`

#### [MODIFY] [Dashboard.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Dashboard.jsx)

**Tooltip do card "Meu Setor"** — adicionar linha informando OS descartadas por falta de prazo:

```
Período:        mai/25
OS com prazo:   13 de 15 (2 sem prazo definido no IXC)
No prazo:       13 OS (87%)
Mês anterior:   82%
```

Isso dá visibilidade sobre a qualidade dos dados diretamente no dashboard.

---

## Verification Plan

### Teste 1 — Endpoint direto (sem SLA preenchido)
```
GET http://localhost:3001/api/eficiencia/[ID_USUARIO_TI]
```
Resultado esperado: `os_sem_prazo` indica quantas OS foram ignoradas.

### Teste 2 — Verificar campos no IXC manualmente
Abrir uma OS de TI no IXC Soft e confirmar se:
- `data_prazo_limite` está preenchido → SLA configurado ✅
- Ambos os campos vazios → SLA não configurado ⚠️

### Teste 3 — Log no terminal do servidor
O console deve exibir:
```
[Eficiência] Técnico 42: Atual=87% (13/15), Sem prazo=2, Anterior=82%, Variação=+5
```

### Manual
Comparar o percentual exibido no card com uma contagem manual das OS do técnico
no painel IXC Soft para validar a acurácia do cálculo.
