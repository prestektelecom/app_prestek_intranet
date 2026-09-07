import { useId, useRef, useState } from 'react'

export default function Sparkline({
  data,
  color = '#EC7D23',
  height = 56,
  fill = true,
  highlightIndex = null,
  ariaLabel = null,
  // Opt-in de interatividade: uma descrição por ponto ("300M · 32 vendas").
  // Com ela, passar o mouse/dedo ou usar as setas revela o valor de cada
  // ponto. Sem ela o gráfico continua puramente ilustrativo (caso do KpiCard).
  descricaoPontos = null,
  onIndiceAtivo = null,
}) {
  // ID único por instância: permite cores em var(--token) sem quebrar a referência do gradiente
  const gradientId = `spark-fill-${useId().replace(/:/g, '')}`
  const [ativo, setAtivo] = useState(null);
  const areaRef = useRef(null);
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = ((max - v) / range) * (height - 4) + 2;
    return [x, y];
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const fillPath = `${linePath} L ${points[points.length - 1][0]} ${height} L 0 ${height} Z`;

  const svg = (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      style={{ display: 'block', overflow: 'visible' }}
      // Sem ariaLabel o gráfico é decorativo (caso do KpiCard, onde o número já
      // está ao lado em texto) e some do leitor de tela em vez de virar ruído.
      {...(ariaLabel ? { role: 'img', 'aria-label': ariaLabel } : { 'aria-hidden': 'true' })}
    >
      {fill && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {fill && (
        <path
          d={fillPath}
          fill={`url(#${gradientId})`}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );

  const destaque = highlightIndex != null ? points[highlightIndex] : null;
  const interativo = Array.isArray(descricaoPontos) && descricaoPontos.length === data.length;
  if (!destaque && !interativo) return svg;

  // Os marcadores ficam em HTML, não em <circle>: com preserveAspectRatio="none" o eixo x é
  // esticado e qualquer círculo dentro do SVG sairia achatado em elipse.
  const posicao = ([x, y]) => ({ left: `${x}%`, top: `${(y / height) * 100}%` });

  const definirAtivo = (idx) => {
    setAtivo(idx);
    if (onIndiceAtivo) onIndiceAtivo(idx);
  };

  // Pontos são discretos: o marcador SALTA para o mais próximo do cursor em
  // vez de deslizar. Interpolar sugeriria valores que não existem.
  const indicePorX = (clientX) => {
    const el = areaRef.current;
    if (!el) return null;
    const { left, width } = el.getBoundingClientRect();
    if (!width) return null;
    const frac = Math.min(1, Math.max(0, (clientX - left) / width));
    return Math.round(frac * (data.length - 1));
  };

  const indiceInicial = () => (ativo ?? highlightIndex ?? 0);

  const aoTeclar = (e) => {
    const n = data.length;
    const atual = indiceInicial();
    let proximo = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') proximo = Math.min(n - 1, atual + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') proximo = Math.max(0, atual - 1);
    else if (e.key === 'Home') proximo = 0;
    else if (e.key === 'End') proximo = n - 1;
    else if (e.key === 'Escape') { definirAtivo(null); return; }
    if (proximo == null) return;
    e.preventDefault();
    definirAtivo(proximo);
  };

  const ponto = interativo && ativo != null ? points[ativo] : null;
  // Perto das bordas a etiqueta ancora no lado de dentro; perto do topo ela
  // desce para não cobrir o texto que fica acima do gráfico.
  const ancoraX = ponto ? (ponto[0] < 15 ? '0%' : ponto[0] > 85 ? '-100%' : '-50%') : '-50%';
  const abaixo = ponto ? ponto[1] < height * 0.35 : false;

  return (
    <div className="relative" style={{ height }}>
      {svg}

      {destaque && (
        <span
          className="pointer-events-none absolute block h-2.5 w-2.5"
          style={{ ...posicao(destaque), transform: 'translate(-50%, -50%)' }}
        >
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: color, opacity: 0.55 }}
          />
          <span
            className="absolute inset-0 rounded-full border-2 bg-surface"
            style={{ borderColor: color }}
          />
        </span>
      )}

      {ponto && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 top-0 w-px"
            style={{ left: `${ponto[0]}%`, backgroundColor: color, opacity: 0.35 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute block h-2 w-2 rounded-full border-2 bg-surface"
            style={{ ...posicao(ponto), transform: 'translate(-50%, -50%)', borderColor: color }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 font-mono text-[10.5px] font-bold tabular-nums text-foreground shadow-[0_4px_12px_-4px_rgba(0,0,0,0.35)]"
            style={{
              ...posicao(ponto),
              transform: `translate(${ancoraX}, ${abaixo ? '10px' : 'calc(-100% - 10px)'})`,
            }}
          >
            {descricaoPontos[ativo]}
          </span>
        </>
      )}

      {interativo && (
        // Camada de captura por cima do SVG. Semântica de slider: leitor de
        // tela ganha o valor de cada ponto via aria-valuetext, coisa que o
        // aria-label resumido do SVG não dá. touch-action: pan-y preserva o
        // scroll vertical no celular; o arrasto horizontal explora a curva.
        <div
          ref={areaRef}
          role="slider"
          tabIndex={0}
          aria-label="Explorar pontos do gráfico"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={data.length - 1}
          aria-valuenow={indiceInicial()}
          aria-valuetext={descricaoPontos[indiceInicial()]}
          className="absolute inset-0 cursor-crosshair rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{ touchAction: 'pan-y' }}
          onPointerMove={(e) => { const i = indicePorX(e.clientX); if (i != null && i !== ativo) definirAtivo(i); }}
          onPointerDown={(e) => { const i = indicePorX(e.clientX); if (i != null) definirAtivo(i); }}
          onPointerLeave={() => definirAtivo(null)}
          onFocus={() => definirAtivo(indiceInicial())}
          onBlur={() => definirAtivo(null)}
          onKeyDown={aoTeclar}
        />
      )}
    </div>
  );
}
