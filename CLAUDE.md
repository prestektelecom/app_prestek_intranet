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

## Git e GitHub: branches, PRs, releases e packages

Repositório: `prestektelecom/app_prestek_intranet` (privado). Regra decidida pelo
Felix em 2026-10-04: trabalho novo passa a ir por **branch + Pull Request**, não
mais direto na `main`. Isso substitui o merge direto de 2026-09-28; a `main` continua
sendo a única branch de vida longa.

**Branches**
- A `main` é sempre implantável: é o que o servidor puxa. Nunca commitar nela nem
  fazer force-push; nunca reescrever histórico publicado (`rebase`/`reset` em
  commit já enviado, `filter-repo`).
- Uma branch por assunto, curta, a partir da `main` atualizada: `feat/<assunto>`,
  `fix/<assunto>`, `docs/<assunto>`, `chore/<assunto>`, `hotfix/<assunto>` (correção
  urgente de produção). Minúsculas, hífens, sem acento. Para changes do OpenSpec, usar
  o nome da change (`feat/setores-membros-manuais`).
- Apagar a branch depois do merge (`git branch -d` e no GitHub). Antes de apagar,
  conferir `git rev-list --count main..origin/<branch>` = 0. Trabalho que não vai ser
  mesclado vira tag `archive/<nome>`, não branch esquecida.

**Commits**
- Conventional Commits em português, como o histórico já faz: `tipo(escopo): resumo
  no imperativo`, até ~72 caracteres. Tipos: `feat`, `fix`, `docs`, `chore`,
  `refactor`, `perf`, `test`, `style`. O corpo explica o **porquê**, não repete o diff.
- Um assunto por commit. Misturar interface, backend e migration no mesmo commit só
  quando um não funciona sem o outro.
- Nunca `--no-verify` nem pular hooks. Nunca commitar `.env`, `.claude/settings.local.json`,
  tokens, senhas, dumps de banco, `node_modules/` ou `dist/`. Em dúvida, `git diff --cached`
  antes de commitar.

**Pull Requests**
- Todo PR vai para a `main`, com título no mesmo formato de commit, descrição com **o
  que mudou, por que e como testar**, e o resultado do `/impeccable` quando tocar
  interface (regra acima). Migration nova: dizer no PR qual arquivo aplicar em
  produção (nunca `migrations/run.js` inteiro).
- Merge por **squash**, para a `main` ficar com um commit por mudança.
- O `gh` não está instalado nesta máquina e o push do Claude é bloqueado pelo
  classificador de permissões: o Claude prepara a branch, o commit e o texto do PR,
  e o **Felix** roda `git push` e abre o PR no GitHub. O Claude nunca faz push, nem
  de tag, sem pedido explícito naquela hora.
- Proteção da `main` (Settings → Branches): exigir PR e bloquear force-push e
  exclusão. Repositório privado em organização precisa de plano pago para impor
  isso; se não houver, a regra vale por convenção.

**Releases**
- Versionamento semântico (`vMAJOR.MINOR.PATCH`): `PATCH` correção, `MINOR` funcionalidade
  nova compatível, `MAJOR` mudança que exige ação de quem opera (migration obrigatória,
  variável nova no `.env`, rota removida). Hoje o `package.json` está em `0.1.0`.
- Release é uma **tag anotada** na `main` (`git tag -a v0.2.0 -m "..."`) + uma Release
  no GitHub. As notas vêm da seção `[Unreleased]` do `CHANGELOG.md`, que deve ser
  fechada (`## [0.2.0] - AAAA-MM-DD`) no mesmo commit que sobe a versão do `package.json`.
- Toda release lista os **passos de implantação**: migration a aplicar, variáveis novas
  do `.env`, se precisa de novo build (`VITE_API_URL` entra no bundle) e reiniciar o
  backend.
- O servidor passa a atualizar por tag: `git fetch --tags && git checkout vX.Y.Z`
  (ou `git pull origin main` enquanto não houver release). Registrar em
  `PENDENCIAS_PRODUCAO.md` o commit/tag anterior para poder voltar.

**Packages**
- Não publicar nada agora: é um app, não uma biblioteca, e o `dist/` leva a URL da API
  embutida (`VITE_API_URL`), então um pacote genérico não serviria a outro ambiente.
  Reavaliar se surgir imagem Docker (GitHub Container Registry, `ghcr.io`) ou módulo
  compartilhado; antes disso, registrar a decisão na `MEMORIA.md`.
- Artefato de build, se for útil, vai como arquivo anexado à Release, não como Package.

**Segurança e automação do repositório**
- O histórico já contém senhas expostas (decisão de risco aceito em
  `PENDENCIAS_PRODUCAO.md`, seção 8). Por isso o repositório fica **privado**; nunca
  torná-lo público sem antes reescrever o histórico e rotacionar essas credenciais.
- Ligar no GitHub: Dependabot (alertas e atualizações de segurança) e secret scanning.
  Chave de deploy do servidor é somente leitura. Ações de CI (`.github/workflows/`), se
  vierem, rodam build e testes, nunca fazem deploy com credencial de produção.

## Contexto do projeto

@MEMORIA.md
@CONTEXTO_IA.md
@AGENTS.md
