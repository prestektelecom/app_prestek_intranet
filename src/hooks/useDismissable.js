import { useEffect, useRef } from 'react';

const FOCUSABLE =
  '[data-autofocus], button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Ciclo de vida de um overlay do chrome (dropdown do sino, menu do perfil,
 * sheets): Escape fecha, clique fora fecha, o foco entra no primeiro controle
 * ao abrir e volta ao gatilho ao fechar, e sheets travam o scroll do fundo.
 *
 * `ref` aponta para o container do overlay. Para dropdowns ancorados, deixe o
 * gatilho dentro do mesmo container (o clique nele não conta como "fora").
 * Para sheets com backdrop próprio, passe `closeOnOutside: false` e deixe o
 * backdrop chamar `onClose`, senão o mousedown no gatilho fecha e o click
 * reabre.
 */
export function useDismissable(ref, { open, onClose, lockScroll = false, closeOnOutside = true } = {}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    const opener = document.activeElement;
    const container = ref.current;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
      }
    };
    const onDown = (e) => {
      if (container && !container.contains(e.target)) onCloseRef.current?.();
    };

    document.addEventListener('keydown', onKey);
    if (closeOnOutside) document.addEventListener('mousedown', onDown);

    const prevOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = 'hidden';

    // Foco entra no primeiro controle do overlay que não seja o próprio
    // gatilho (em dropdowns ancorados o gatilho mora no mesmo container).
    const raf = requestAnimationFrame(() => {
      if (!container) return;
      const first = Array.from(container.querySelectorAll(FOCUSABLE)).find((el) => el !== opener);
      first?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      if (closeOnOutside) document.removeEventListener('mousedown', onDown);
      if (lockScroll) document.body.style.overflow = prevOverflow;

      // Devolve o foco ao gatilho só se ele ficou órfão (Escape, clique no
      // backdrop). Quem clicou em outro controle mantém o foco onde clicou.
      const active = document.activeElement;
      const orphan = !active || active === document.body || (container && container.contains(active));
      if (orphan && opener instanceof HTMLElement && document.contains(opener)) opener.focus();
    };
  }, [open, lockScroll, closeOnOutside, ref]);
}

export default useDismissable;
