import { tone } from '../../utils/tone';

export function BentoCard({ C, children, accent, glow = false, className = '', hoverBorder = true }) {
  return (
    <div
      className={`${className} ${hoverBorder ? 'bento-hover-border' : ''}`.trim()}
      style={{
        background: C.surface,
        borderRadius: 20,
        border: `1px solid ${C.line}`,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {glow && accent && (
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 130,
            height: 130,
            borderRadius: '50%',
            background: tone(C[accent], 0.10),
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </div>
  );
}

export default BentoCard;
