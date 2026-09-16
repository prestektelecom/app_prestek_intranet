import { tone } from '../../utils/tone';
import { GlowingEffect } from '../ui/glowing-effect';
import { useTouchOnly } from '../../hooks/useTouchOnly';

export function BentoCard({ C, children, accent, glow = false, className = '', hoverBorder = true }) {
  const isTouchOnly = useTouchOnly();

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
      <GlowingEffect
        variant="brand"
        spread={40}
        glow={true}
        disabled={isTouchOnly}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
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
      <div className="relative z-10 flex flex-1 flex-col gap-3.5">
        {children}
      </div>
    </div>
  );
}

export default BentoCard;
