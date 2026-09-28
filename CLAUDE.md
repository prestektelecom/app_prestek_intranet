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

## Impeccable é obrigatório em toda mudança de interface

O hook automático (`impeccable hook`, em `.claude/settings.local.json`) só faz uma
varredura de padrões e NÃO substitui a skill. Regra fixa, decidida pelo Felix em
2026-09-21:

- Toda mudança que toque a interface (`src/**/*.jsx`, `*.css`, componentes, temas,
  mapas, modais, textos visíveis) DEVE passar pela skill `/impeccable` antes de ser
  dada como concluída — no mínimo `audit` (acessibilidade, contraste nos 5 temas,
  alvos de toque, tipografia) da tela tocada; `critique` quando a mudança for
  visual/estrutural, não só troca técnica.
- Rode ao final da implementação e antes de `/opsx:archive`. Registre o resultado
  (nota, achados) na change ou no `MEMORIA.md`; corrija P0/P1 antes de fechar.
- Só pule com justificativa explícita quando a mudança não tiver efeito visual
  nenhum (só backend, migration, dependência, docs) — e diga isso ao Felix em vez
  de omitir o passo em silêncio.
- Tarefas do `tasks.md` de uma change de UI devem incluir o passo Impeccable.

## Contexto do projeto

@MEMORIA.md
@CONTEXTO_IA.md
@AGENTS.md
