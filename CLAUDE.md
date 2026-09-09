# Prestek Intranet — instruções para o Claude Code

## Memória persistente (Obsidian)

A memória duradoura deste projeto vive na nota `MEMORIA.md`, na raiz do
projeto. O projeto está dentro do vault do Obsidian (`F:\vault`), então essa
nota é editável pelo Obsidian e é importada abaixo, carregada em toda sessão.
A nota `../prestek-intranet.md` no vault é só um atalho para ela.

Regras:
- Decisões de arquitetura, design ou produto que devam sobreviver à sessão:
  registre na seção **Decisões** da nota do vault, uma linha por decisão, com data.
- Trabalho pendente ou combinado com o usuário: registre na seção **Pendências**
  como checkbox (`- [ ]`). Marque `- [x]` quando concluir.
- Fatos sobre ambiente, servidores, credenciais de onde encontrar (nunca o valor),
  integrações: seção **Ambiente**.
- Não duplique ali o que já está em `CONTEXTO_IA.md`, `AGENTS.md`, `DESIGN.md`
  ou no histórico do git. A nota é para o que não dá para derivar do código.
- Mantenha a nota curta. Se uma seção crescer demais, mova para uma nota
  separada no vault e deixe um `[[wikilink]]` na nota principal.
- O usuário edita a mesma nota pelo Obsidian. Antes de escrever, releia o
  arquivo para não sobrescrever alterações feitas fora da sessão.

## Contexto do projeto

@MEMORIA.md
@CONTEXTO_IA.md
@AGENTS.md
