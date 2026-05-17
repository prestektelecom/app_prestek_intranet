# Correção de Encoding (Mojibake) no Repositório

Este plano detalha a estratégia para corrigir os caracteres corrompidos (mojibake) encontrados nos arquivos `.jsx` e `.js` da aplicação. O problema ocorreu porque arquivos salvos em UTF-8 foram re-salvos com codificações incorretas (como Windows-1252/ISO-8859-1), resultando em strings como `InstalaÃ§Ã£o` em vez de `Instalação`.

## User Review Required

> [!WARNING]
> A correção envolverá alterações em múltiplos arquivos-chave do sistema. Peço que confirme se deseja que o script faça a substituição automática em todos os arquivos identificados de uma só vez, ou se prefere fazer arquivo por arquivo. Recomendo usar um script em Node.js ou PowerShell para aplicar um "Localizar e Substituir" universal e evitar esquecer algum caractere.

## Proposed Changes

Os arquivos a seguir foram identificados com a presença de caracteres corrompidos da família do `Ã`:

### Componentes Afetados

#### [MODIFY] [Configuracoes.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Configuracoes.jsx)
#### [MODIFY] [Processos.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Processos.jsx)
#### [MODIFY] [Schedule.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Schedule.jsx)
#### [MODIFY] [ServicesDirectory.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/ServicesDirectory.jsx)
#### [MODIFY] [Sectors.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Sectors.jsx)
#### [MODIFY] [ManagePlantaoModal.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/schedule/ManagePlantaoModal.jsx)
#### [MODIFY] [Coverage.jsx](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/components/Coverage.jsx)
#### [MODIFY] [officesData.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/data/officesData.js)

---

### Mapeamento de Correção
Aplicaremos um script para substituir exatamente as strings corrompidas abaixo pelos caracteres corretos em UTF-8:

- `Ã§Ã£o` ➔ `ção`
- `Ã§Ãµes` ➔ `ções`
- `Ã§` ➔ `ç`
- `Ã£` ➔ `ã`
- `Ãµ` ➔ `õ`
- `Ã¡` ➔ `á`
- `Ã©` ➔ `é`
- `Ã³` ➔ `ó`
- `Ãº` ➔ `ú`
- `Ã­` ➔ `í`
- `Ãª` ➔ `ê`
- `Ã¢` ➔ `â`
- `Ã` ➔ `À` (no contexto de `Ã  vista` ou maiúsculas)
- `Ã‡Ã•ES` ➔ `ÇÕES`
- `ÃŠ` ➔ `Ê`
- `Ã“` ➔ `Ó`
- `Ã` ➔ `Á`
- `Ã` ➔ `Í`
- `Âº` ➔ `º`
- `Âª` ➔ `ª`

## Verification Plan

### Automated Tests
- Executarei um script customizado em Node.js para buscar e substituir as strings em todo o diretório `src/`.
- Após rodar o script, farei uma varredura com `grep` (`Ã`) para garantir que nenhum resquício de Mojibake foi deixado para trás.

### Manual Verification
- Com o `npm run dev` rodando, pedirei que você acesse a aba "Diretório de Serviços Internos", "Configurações" e "Processos" no navegador e verifique se a acentuação voltou ao normal sem precisar do Google Tradutor.
