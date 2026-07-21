#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const OPENPEC_DIR = path.join(ROOT, 'openspec');
const CHANGES_DIR = path.join(OPENPEC_DIR, 'changes');
const ARCHIVE_DIR = path.join(CHANGES_DIR, 'archive');
const SPECS_DIR = path.join(OPENPEC_DIR, 'specs');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function fail(message) {
  log(`Erro: ${message}`, 'red');
  process.exit(1);
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function readYamlDate(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/created:\s*(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function generateOpenspecYaml(title, description, specs) {
  const specList = specs.length
    ? `specs:\n${specs.map((s) => `  - ${s}`).join('\n')}`
    : 'specs: []';

  return `schema: spec-driven
status: draft
created: ${todayISO()}
title: ${title}
description: ${description || title}
${specList}
`;
}

function generateProposal(title) {
  return `## Why

Descreva o problema ou motivação para esta mudança.

## What Changes

- Liste aqui as alterações principais

## Capabilities

### New Capabilities
- (nenhuma)

### Modified Capabilities
- (nenhuma)

## Impact

- Liste os arquivos/componentes impactados
`;
}

function generateDesign() {
  return `## Context

Descreva o contexto atual e a stack envolvida.

## Goals / Non-Goals

**Goals:**
- Liste os objetivos

**Non-Goals:**
- Liste o que está fora de escopo

## Decisions

### D1 — Título da decisão

**Decisão:** descreva a decisão tomada.

**Alternativas consideradas:**
- Alternativa A
- Alternativa B

**Rationale:** justifique a escolha.

## Risks / Trade-offs

- Liste riscos e mitigações
`;
}

function generateTasks() {
  return `## 1. Tarefa inicial

- [ ] 1.1 Subtarefa
- [ ] 1.2 Subtarefa

## 2. Próxima etapa

- [ ] 2.1 Subtarefa
- [ ] 2.2 Subtarefa

## 3. Validação

- [ ] 3.1 Verificar comportamento esperado
- [ ] 3.2 Testar cenários de erro
`;
}

function generateSpec(specName) {
  return `## ADDED Requirements

### Requirement: Título do requisito
Descreva o que o sistema SHALL fazer.

#### Scenario: Cenário principal
- **WHEN** condição
- **THEN** resultado esperado

#### Scenario: Cenário alternativo
- **WHEN** outra condição
- **THEN** outro resultado esperado
`;
}

function cmdNew(args) {
  const title = args.find((a) => !a.startsWith('--'));
  if (!title) fail('Uso: openspec new "Título da change" [--spec nome-spec] [--desc descricao]');

  const descFlag = args.find((a) => a.startsWith('--desc='));
  const description = descFlag ? descFlag.replace('--desc=', '') : '';

  const specs = args
    .filter((a) => a.startsWith('--spec='))
    .map((a) => a.replace('--spec=', ''));

  const slug = slugify(title);
  const changeDir = path.join(CHANGES_DIR, slug);

  if (fs.existsSync(changeDir)) fail(`Já existe uma change com o slug "${slug}"`);

  ensureDir(changeDir);
  ensureDir(path.join(changeDir, 'specs'));

  fs.writeFileSync(path.join(changeDir, '.openspec.yaml'), generateOpenspecYaml(title, description, specs));
  fs.writeFileSync(path.join(changeDir, 'proposal.md'), generateProposal(title));
  fs.writeFileSync(path.join(changeDir, 'design.md'), generateDesign());
  fs.writeFileSync(path.join(changeDir, 'tasks.md'), generateTasks());

  for (const spec of specs) {
    const specDir = path.join(changeDir, 'specs', spec);
    ensureDir(specDir);
    fs.writeFileSync(path.join(specDir, 'spec.md'), generateSpec(spec));
  }

  log(`Change criada: openspec/changes/${slug}/`, 'green');
  log(`Arquivos: .openspec.yaml, proposal.md, design.md, tasks.md${specs.length ? ` + ${specs.length} spec(s)` : ''}`, 'cyan');
}

function cmdArchive(args) {
  const slug = args[0];
  if (!slug) fail('Uso: openspec archive <slug>');

  const source = path.join(CHANGES_DIR, slug);
  if (!fs.existsSync(source)) fail(`Change "${slug}" não encontrada em openspec/changes/`);

  ensureDir(ARCHIVE_DIR);
  const datePrefix = todayISO();
  const target = path.join(ARCHIVE_DIR, `${datePrefix}-${slug}`);

  if (fs.existsSync(target)) fail(`Destino já existe: ${target}`);

  fs.renameSync(source, target);
  log(`Change arquivada: openspec/changes/archive/${path.basename(target)}/`, 'green');
}

function cmdList() {
  const changes = listDirs(CHANGES_DIR).filter((d) => d !== 'archive');
  const archived = listDirs(ARCHIVE_DIR);
  const specs = listDirs(SPECS_DIR);

  log(`Changes ativas (${changes.length}):`, 'bright');
  for (const change of changes.sort()) {
    const date = readYamlDate(path.join(CHANGES_DIR, change, '.openspec.yaml'));
    log(`  • ${change}${date ? ` (${date})` : ''}`, 'cyan');
  }

  if (archived.length) {
    log(`\nArquivadas (${archived.length}):`, 'bright');
    for (const item of archived.sort().slice(0, 10)) {
      log(`  • ${item}`, 'dim');
    }
    if (archived.length > 10) log(`  ... e mais ${archived.length - 10}`, 'dim');
  }

  if (specs.length) {
    log(`\nSpecs reutilizáveis (${specs.length}):`, 'bright');
    for (const spec of specs.sort()) log(`  • ${spec}`, 'yellow');
  }
}

function cmdShow(args) {
  const slug = args[0];
  if (!slug) fail('Uso: openspec show <slug>');

  const changeDir = path.join(CHANGES_DIR, slug);
  if (!fs.existsSync(changeDir)) fail(`Change "${slug}" não encontrada.`);

  const files = fs.readdirSync(changeDir, { recursive: true }).filter((f) => typeof f === 'string');
  log(`Estrutura de openspec/changes/${slug}/:`, 'bright');
  for (const file of files.sort()) log(`  ${file}`, 'cyan');
}

function printHelp() {
  log(`Uso: openspec <comando> [opções]\n`, 'bright');
  log('Comandos:');
  log('  new "Título" [--desc=descricao] [--spec=nome-spec]   Cria uma nova change');
  log('  archive <slug>                                       Arquiva uma change ativa');
  log('  list                                               Lista changes e specs');
  log('  show <slug>                                         Mostra arquivos da change');
  log('  help                                                Mostra esta ajuda');
}

async function main() {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case 'new':
      cmdNew(args);
      break;
    case 'archive':
      cmdArchive(args);
      break;
    case 'list':
      cmdList();
      break;
    case 'show':
      cmdShow(args);
      break;
    case 'help':
    case undefined:
    default:
      printHelp();
      break;
  }
}

main().catch((err) => fail(err.message));
