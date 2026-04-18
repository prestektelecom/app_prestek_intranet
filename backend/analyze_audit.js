import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./audit_results.json', 'utf-8'));

// Contar por estado
const byEstado = {};
data.forEach(d => {
    const key = d.estado || 'VAZIO';
    if (!byEstado[key]) byEstado[key] = { count: 0, cidades: new Set(), bairros: new Set() };
    byEstado[key].count++;
    byEstado[key].cidades.add(d.cidade);
    byEstado[key].bairros.add(d.bairro);
});

console.log('\n=== RESUMO POR ESTADO INVÁLIDO ===');
Object.entries(byEstado)
    .sort((a,b) => b[1].count - a[1].count)
    .forEach(([estado, info]) => {
        console.log(`Estado "${estado}": ${info.count} contratos | ${info.cidades.size} cidades | ${info.bairros.size} bairros`);
        console.log(`  Cidades: ${[...info.cidades].join(', ')}`);
    });

// Detectar os estados numéricos (código IXC em vez de UF)
console.log('\n=== PRIMEIROS 10 CONTRATOS ===');
data.slice(0, 10).forEach(d => console.log(JSON.stringify(d)));
