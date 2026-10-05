// Testa as regras de validação da caixa de sugestões e a paridade das
// listas com o front. Uso:
//   node scripts/testar-sugestoes.mjs
import assert from 'node:assert/strict'
import { TIPOS, STATUS, LIMITES, validarEnvio, validarGestao, filtroValido } from '../backend/services/sugestoes.js'
import { CAPACIDADES as CAP_BACK } from '../backend/middleware/permissoes.js'
import { CAPACIDADES as CAP_FRONT } from '../src/constants/permissoes.js'
import { TIPOS as TIPOS_FRONT, STATUS as STATUS_FRONT, LIMITES as LIMITES_FRONT } from '../src/constants/sugestoes.js'

let falhas = 0
const caso = (nome, fn) => {
  try { fn(); console.log(`ok   ${nome}`) } catch (e) { falhas++; console.log(`FALHA ${nome}\n     ${e.message}`) }
}

const valido = { tipo: 'melhoria', titulo: 'Tema escuro', descricao: 'Deixar o tema escuro mais legível.' }

caso('envio válido é aparado', () => {
  const r = validarEnvio({ ...valido, titulo: '  Tema escuro  ' })
  assert.equal(r.dados.titulo, 'Tema escuro')
})
caso('tipo fora da lista', () => assert.equal(validarEnvio({ ...valido, tipo: 'x' }).campo, 'tipo'))
caso('título curto demais', () => assert.equal(validarEnvio({ ...valido, titulo: 'ab' }).campo, 'titulo'))
caso('título só com espaços', () => assert.equal(validarEnvio({ ...valido, titulo: '    ' }).campo, 'titulo'))
caso('título longo demais', () => assert.equal(validarEnvio({ ...valido, titulo: 'a'.repeat(LIMITES.titulo.max + 1) }).campo, 'titulo'))
caso('descrição curta demais', () => assert.equal(validarEnvio({ ...valido, descricao: 'curta' }).campo, 'descricao'))
caso('descrição no limite passa', () => assert.ok(validarEnvio({ ...valido, descricao: 'a'.repeat(LIMITES.descricao.max) }).dados))
caso('descrição acima do limite', () => assert.equal(validarEnvio({ ...valido, descricao: 'a'.repeat(LIMITES.descricao.max + 1) }).campo, 'descricao'))
caso('corpo ausente e tipos errados não quebram', () => {
  assert.ok(validarEnvio(undefined).erro)
  assert.ok(validarEnvio({ tipo: 1, titulo: {}, descricao: [] }).erro)
})
caso('autoria do corpo é ignorada', () => {
  const r = validarEnvio({ ...valido, usuario_id: '999', status: 'concluida' })
  assert.deepEqual(Object.keys(r.dados).sort(), ['descricao', 'tipo', 'titulo'])
})

caso('gestão: nada informado', () => assert.ok(validarGestao({}).erro))
caso('gestão: status inválido', () => assert.equal(validarGestao({ status: 'aprovada' }).campo, 'status'))
caso('gestão: só status', () => assert.deepEqual(validarGestao({ status: 'planejada' }).dados, { status: 'planejada' }))
caso('gestão: resposta vazia limpa', () => assert.deepEqual(validarGestao({ resposta: '   ' }).dados, { resposta: null }))
caso('gestão: resposta acima do limite', () => assert.equal(validarGestao({ resposta: 'a'.repeat(LIMITES.resposta.max + 1) }).campo, 'resposta'))

caso('filtro desconhecido é ignorado', () => {
  assert.equal(filtroValido('nova', STATUS), 'nova')
  assert.equal(filtroValido("x'; DROP TABLE", STATUS), null)
  assert.equal(filtroValido(undefined, TIPOS), null)
})

caso('listas e limites iguais no front', () => {
  assert.deepEqual(TIPOS_FRONT.map((t) => t.id), TIPOS)
  assert.deepEqual(STATUS_FRONT.map((s) => s.id), STATUS)
  assert.deepEqual(LIMITES_FRONT, LIMITES)
})
caso('capacidade sugestoes existe nos dois lados', () => {
  assert.ok(CAP_BACK.includes('sugestoes'))
  assert.deepEqual(CAP_FRONT.map((c) => c.id), CAP_BACK)
})

if (falhas) { console.log(`\n${falhas} falha(s)`); process.exit(1) }
console.log('\ntudo certo')
