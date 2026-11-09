// Casos de borda da regra de aniversariantes (backend/services/aniversariantes.js)
// e comparação dia a dia com a conta que o navegador fazia antes. Uso:
//   node scripts/testar-aniversariantes.mjs
import { hojeEmSaoPaulo, proximoAniversario, listarAniversariantes } from '../backend/services/aniversariantes.js'

let falhas = 0
const igual = (nome, obtido, esperado) => {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado)
  if (!ok) { falhas++; console.error(`FALHOU ${nome}\n  obtido:   ${JSON.stringify(obtido)}\n  esperado: ${JSON.stringify(esperado)}`) }
  else console.log(`ok  ${nome}`)
}

// ── proximoAniversario
igual('hoje mesmo',            proximoAniversario('1990-11-08', '2026-11-08'), { proximo: '2026-11-08', dias: 0 })
igual('amanhã',                proximoAniversario('1990-11-09', '2026-11-08'), { proximo: '2026-11-09', dias: 1 })
igual('ontem vira o ano que vem', proximoAniversario('1990-11-07', '2026-11-08'), { proximo: '2027-11-07', dias: 364 })
igual('virada de ano',         proximoAniversario('2000-01-02', '2026-12-29'), { proximo: '2027-01-02', dias: 4 })
igual('29/02 em ano comum',    proximoAniversario('2000-02-29', '2027-02-27'), { proximo: '2027-03-01', dias: 2 })
igual('29/02 em ano bissexto', proximoAniversario('2000-02-29', '2028-02-20'), { proximo: '2028-02-29', dias: 9 })
igual('data vinda com hora',   proximoAniversario('1990-11-10 00:00:00', '2026-11-08'), { proximo: '2026-11-10', dias: 2 })
for (const ruim of ['', null, undefined, '0000-00-00', '1990-13-01', '1990-00-10', 'abc']) {
  igual(`data inválida ${JSON.stringify(ruim)}`, proximoAniversario(ruim, '2026-11-08'), null)
}

// ── hojeEmSaoPaulo: 23h em Brasília ainda é "hoje", mesmo já sendo o dia seguinte em UTC
igual('fuso: 23h BRT = ontem em UTC', hojeEmSaoPaulo(new Date('2026-11-09T02:00:00Z')), '2026-11-08')
igual('fuso: 00h30 BRT',              hojeEmSaoPaulo(new Date('2026-11-09T03:30:00Z')), '2026-11-09')

// ── listarAniversariantes
const F = (id, nome, nasc, extra = {}) => ({ id, funcionario: nome, email: `${nome}@x.com`, id_departamento: '10', id_funcao: '3', data_nascimento: nasc, foto_perfil: null, ...extra })
const hoje = '2026-11-08'
const lista = listarAniversariantes([
  F('1', 'Zeca',  '1990-11-15'),   // +7  -> entra (limite)
  F('2', 'Ana',   '1985-11-08'),   // hoje
  F('3', 'Bia',   '1992-11-16'),   // +8  -> fora
  F('4', 'Caio',  '1980-11-10'),   // +2
  F('5', 'Duda',  null),           // sem data -> fora
  F('6', 'Edu',   '1995-11-10'),   // +2, empate com Caio: desempata por nome
], { hoje, dias: 7 })
igual('janela de 7 dias, ordenada', lista.map(a => `${a.funcionario_nome}:${a.dias}`), ['Ana:0', 'Caio:2', 'Edu:2', 'Zeca:7'])
igual('janela de 1 dia', listarAniversariantes([F('1', 'A', '1990-11-08'), F('2', 'B', '1990-11-09'), F('3', 'C', '1990-11-10')], { hoje, dias: 1 }).map(a => a.funcionario_nome), ['A', 'B'])
igual('lista vazia', listarAniversariantes([], { hoje }), [])
igual('entrada ausente', listarAniversariantes(undefined, { hoje }), [])

// ── privacidade: nada que identifique o ano de nascimento ou o e-mail sai daqui
const campos = Object.keys(lista[0]).sort()
igual('campos devolvidos', campos, ['dias', 'foto_perfil', 'funcionario_id', 'funcionario_nome', 'id_departamento', 'id_funcao', 'proximo'])
igual('nenhum ano de nascimento na saída', JSON.stringify(lista).includes('1990') || JSON.stringify(lista).includes('1985'), false)

// ── paridade com a conta antiga do navegador (src/components/Dashboard.jsx, diasAteAniversario)
// em todos os dias de 2026 a 2028, para todos os aniversários de um ano bissexto.
function diasAntigo(nasc, ano, mes0, dia) {
  const [, m, d] = nasc.split('-').map(Number)
  const inicioHoje = new Date(ano, mes0, dia)
  let prox = new Date(ano, m - 1, d)
  if (prox < inicioHoje) prox = new Date(ano + 1, m - 1, d)
  return Math.round((prox - inicioHoje) / 86400000)
}
let comparados = 0, divergentes = 0
const nascs = []
for (let m = 1; m <= 12; m++) for (let d = 1; d <= new Date(2000, m, 0).getDate(); d++) nascs.push(`2000-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
for (let ano = 2026; ano <= 2028; ano++) {
  for (let m0 = 0; m0 < 12; m0++) {
    const ultimo = new Date(ano, m0 + 1, 0).getDate()
    for (let d = 1; d <= ultimo; d++) {
      const hojeISO = `${ano}-${String(m0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      for (const n of nascs) {
        comparados++
        if (proximoAniversario(n, hojeISO).dias !== diasAntigo(n, ano, m0, d)) {
          if (divergentes++ < 3) console.error(`  diverge: nasc ${n}, hoje ${hojeISO}`)
        }
      }
    }
  }
}
igual(`paridade com a conta antiga (${comparados} combinações)`, divergentes, 0)

// ── ao vivo (opcional): o caminho inteiro contra o IXC e o banco reais, só leitura.
//   node scripts/testar-aniversariantes.mjs --ao-vivo
// Cobre o cache, a busca compartilhada e o SELECT das fotos, sem subir o servidor.
if (process.argv.includes('--ao-vivo')) {
  const { createRequire } = await import('node:module')
  const { fileURLToPath } = await import('node:url')
  createRequire(new URL('../backend/', import.meta.url))('dotenv').config({ path: fileURLToPath(new URL('../backend/.env', import.meta.url)) })
  const { ixcListar } = await import('../backend/services/ixc.js')
  const { cacheGet, cacheSet } = await import('../backend/cache.js')
  const { buscarAniversariantes } = await import('../backend/services/aniversariantes.js')
  const pool = (await import('../backend/db.js')).default

  let idas = 0
  const ixcContado = (...args) => { idas++; return ixcListar(...args) }
  const deps = { pool, ixcListar: ixcContado, cacheGet, cacheSet }
  try {
    const t0 = Date.now()
    const juntas = await Promise.all([1, 2, 3, 4, 5].map(() => buscarAniversariantes({ dias: 7, ...deps })))
    const frio = Date.now() - t0
    igual('5 acessos simultâneos viram 1 ida ao IXC', idas, 1)
    igual('os 5 recebem a mesma resposta', new Set(juntas.map((j) => JSON.stringify(j))).size, 1)

    const t1 = Date.now()
    await buscarAniversariantes({ dias: 7, ...deps })
    igual('acesso seguinte sai do cache (nenhuma ida nova ao IXC)', idas, 1)
    console.log(`    frio ${frio} ms, em cache ${Date.now() - t1} ms`)

    const r = juntas[0]
    const corpo = JSON.stringify({ sucesso: true, aniversariantes: r })
    igual('resposta sem data de nascimento nem e-mail', /@|data_nascimento/.test(corpo), false)
    igual('todos dentro da janela de 7 dias', r.every((a) => a.dias >= 0 && a.dias <= 7), true)
    console.log(`    ${r.length} aniversariante(s) hoje+7, resposta de ${Buffer.byteLength(corpo)} bytes`)

    const ate31 = await buscarAniversariantes({ dias: 999, ...deps })
    igual('dias acima de 31 é limitado a 31', ate31.every((a) => a.dias <= 31), true)
  } finally {
    await pool.end()
  }
}

if (falhas) { console.error(`\n${falhas} falha(s)`); process.exit(1) }
console.log('\ntudo certo')
