"use client";

import { memo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { animate } from "motion/react";

// ─── Rastreador de ponteiro compartilhado ─────────────────────────────────────
// Antes, cada instância registrava o próprio `pointermove` no document.body e o
// próprio `scroll` na window, e dentro do seu rAF lia getBoundingClientRect() e
// escrevia no style em sequência. Com 9 cards na mesma tela isso dava 18
// listeners e, pior, 9 reflows forçados por frame: a escrita da instância N
// sujava o layout que a instância N+1 ia ler (layout thrashing).
//
// Agora há UM listener de cada tipo e UM rAF por frame. Cada assinante faz só
// as leituras de layout e devolve uma função com as escritas; o flush executa
// todas as leituras primeiro e todas as escritas depois. O visual é idêntico.
type Point = { x: number; y: number };
type Subscriber = (e: Point | undefined) => (() => void) | void;

const subscribers = new Set<Subscriber>();
let rafId = 0;
let pendingEvent: Point | undefined;
let listenersAttached = false;

function flush() {
  rafId = 0;
  const ev = pendingEvent;
  pendingEvent = undefined;
  const writes: Array<() => void> = [];
  subscribers.forEach((read) => {
    const write = read(ev);
    if (write) writes.push(write);
  });
  writes.forEach((write) => write());
}

function schedule(e?: Point) {
  if (e) pendingEvent = e;
  if (!rafId) rafId = requestAnimationFrame(flush);
}

function onPointerMove(e: PointerEvent) {
  schedule({ x: e.clientX, y: e.clientY });
}

function onScroll() {
  schedule();
}

function subscribe(fn: Subscriber) {
  subscribers.add(fn);
  if (!listenersAttached) {
    listenersAttached = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    document.body.addEventListener("pointermove", onPointerMove, { passive: true });
  }
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0 && listenersAttached) {
      listenersAttached = false;
      window.removeEventListener("scroll", onScroll);
      document.body.removeEventListener("pointermove", onPointerMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }
  };
}

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}
const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.01,
    proximity = 64,
    spread = 40,
    variant = "default",
    glow = true,
    className,
    movementDuration = 2,
    borderWidth = 2,
    disabled = false,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    // Controles da animação em curso. Antes, cada pointermove disparava um
    // animate() novo de 2s e descartava o retorno — dezenas de animações
    // concorrentes por card durante um arrasto de mouse. Agora a anterior é
    // parada antes de começar a próxima.
    const animationRef = useRef<{ stop: () => void } | null>(null);

    useEffect(() => {
      if (disabled) return;

      // Fase de leitura: só getBoundingClientRect e aritmética. Devolve a
      // escrita para o flush executar depois que TODAS as instâncias leram.
      const read: Subscriber = (e) => {
        const element = containerRef.current;
        if (!element) return;

        const { left, top, width, height } = element.getBoundingClientRect();
        const mouseX = e?.x ?? lastPosition.current.x;
        const mouseY = e?.y ?? lastPosition.current.y;
        if (e) lastPosition.current = { x: mouseX, y: mouseY };

        const center = [left + width * 0.5, top + height * 0.5];
        const distanceFromCenter = Math.hypot(
          mouseX - center[0],
          mouseY - center[1]
        );
        const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

        const isActive =
          distanceFromCenter >= inactiveRadius &&
          mouseX > left - proximity &&
          mouseX < left + width + proximity &&
          mouseY > top - proximity &&
          mouseY < top + height + proximity;

        const targetAngle = isActive
          ? (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI +
            90
          : 0;

        return () => {
          element.style.setProperty("--active", isActive ? "1" : "0");
          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue("--start")) || 0;
          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animationRef.current?.stop();
          animationRef.current = animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty("--start", String(value));
            },
          });
        };
      };

      const unsubscribe = subscribe(read);
      return () => {
        unsubscribe();
        animationRef.current?.stop();
        animationRef.current = null;
      };
    }, [disabled, inactiveZone, proximity, movementDuration]);

    return (
      <>
        <div
          className={cn(
            "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
            glow && "opacity-100",
            variant === "white" && "border-white",
            disabled && "!block"
          )}
        />
        <div
          ref={containerRef}
          style={
            {
              "--blur": `${blur}px`,
              "--spread": spread,
              "--start": "0",
              "--active": "0",
              "--glowingeffect-border-width": `${borderWidth}px`,
              "--repeating-conic-gradient-times": "5",
              "--gradient":
                variant === "white"
                  ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--black, #000),
                  var(--black, #000) calc(25% / var(--repeating-conic-gradient-times))
                )`
                  : `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
                radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
                radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), 
                radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  #dd7bbb 0%,
                  #d79f1e calc(25% / var(--repeating-conic-gradient-times)),
                  #5a922c calc(50% / var(--repeating-conic-gradient-times)), 
                  #4c7894 calc(75% / var(--repeating-conic-gradient-times)),
                  #dd7bbb calc(100% / var(--repeating-conic-gradient-times))
                )`,
            } as React.CSSProperties
          }
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity z-0",
            glow && "opacity-100",
            blur > 0 && "blur-[var(--blur)]",
            className,
            disabled && "!hidden"
          )}
        >
          <div
            className={cn(
              "glow",
              "rounded-[inherit] h-full w-full",
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
              "after:[background:var(--gradient)] after:[background-attachment:fixed]",
              "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
              "after:[mask-clip:padding-box,border-box]",
              "after:[-webkit-mask-clip:padding-box,border-box]",
              "after:[mask-composite:intersect]",
              "after:[-webkit-mask-composite:source-in]",
              "after:[mask-image:linear-gradient(#000,#000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]",
              "after:[-webkit-mask-image:linear-gradient(#000,#000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
            )}
          />
        </div>
      </>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
