// O IXC entrega nomes em CAIXA ALTA, às vezes com prefixo de situação
// ("(FÉRIAS) ANDRESSA ..."). O chrome mostra "Primeiro Último" em caixa de
// nome próprio, com as partículas do português em minúsculo.

const PARTICULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

export function capitalizarNome(nome = '') {
  return String(nome)
    .replace(/\([^)]*\)/g, ' ')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((p, i) => (i > 0 && PARTICULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ');
}

// "BRUNO FERNANDO PEREIRA SILVA" → "Bruno Silva"; "ANA E SILVA" → "Ana Silva".
export function nomeCurto(nome = '') {
  const partes = capitalizarNome(nome).split(' ').filter((p) => !PARTICULAS.has(p.toLowerCase()));
  if (partes.length <= 2) return partes.join(' ');
  return `${partes[0]} ${partes[partes.length - 1]}`;
}
