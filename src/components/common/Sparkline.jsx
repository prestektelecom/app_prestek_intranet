import { useId } from 'react'

export default function Sparkline({ data, color = '#EC7D23', height = 56, fill = true, highlightIndex = null }) {
  // ID único por instância: permite cores em var(--token) sem quebrar a referência do gradiente
  const gradientId = `spark-fill-${useId().replace(/:/g, '')}`
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
  if (!destaque) return svg;

  // O marcador fica em HTML, não em <circle>: com preserveAspectRatio="none" o eixo x é
  // esticado e qualquer círculo dentro do SVG sairia achatado em elipse.
  const [hx, hy] = destaque;

  return (
    <div className="relative" style={{ height }}>
      {svg}
      <span
        className="pointer-events-none absolute block h-2.5 w-2.5"
        style={{ left: `${hx}%`, top: `${(hy / height) * 100}%`, transform: 'translate(-50%, -50%)' }}
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
    </div>
  );
}
