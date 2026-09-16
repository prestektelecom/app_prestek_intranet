import { useEffect, useRef } from 'react';

const INITIAL_FOCUSABLE =
  '[data-autofocus], button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// Seletor usado pelo trap de Tab (sem `[data-autofocus]`, que não é
// necessariamente um item tabulável). Exportado porque vários modais
// (Comunicados, AdminComunicados, AdminUsuarios, TiSupportModal,
// ManagePlantaoModal, OrgChartEditor, ModalShell, ServiceDetailModal,
// Offices, ServicesDirectory, BottomSheet) definiam essa mesma string
// localmente antes desta extração.
export const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Fábrica do handler de `onKeyDown` que prende o Tab dentro de um container
 * (Shift+Tab do primeiro item vai para o último e vice-versa). Combinar com
 * `useDismissable` no mesmo container cobre o ciclo de diálogo inteiro.
 */
export function makeTrapTab(containerRef) {
  return (e) => {
    if (e.key !== 'Tab' || !containerRef.current) return;
    const items = Array.from(containerRef.current.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
}

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

    // Escape em fase de CAPTURA: um `stopPropagation` de página (os pontos do
    // carrossel do Dashboard têm um) não pode deixar um overlay aberto.
    document.addEventListener('keydown', onKey, true);
    if (closeOnOutside) document.addEventListener('mousedown', onDown);

    const prevOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = 'hidden';

    // Foco entra no primeiro controle do overlay que não seja o próprio
    // gatilho (em dropdowns ancorados o gatilho mora no mesmo container).
    const raf = requestAnimationFrame(() => {
      if (!container) return;
      const first = Array.from(container.querySelectorAll(INITIAL_FOCUSABLE)).find((el) => el !== opener);
      first?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey, true);
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
