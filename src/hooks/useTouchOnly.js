import { useState, useEffect } from 'react';

/**
 * Detecta se o dispositivo primário de entrada é touchscreen (sem hover fino).
 * Útil para decidir se ações devem ficar sempre visíveis em cards.
 */
export function useTouchOnly() {
  const [touchOnly, setTouchOnly] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    const update = () => setTouchOnly(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return touchOnly;
}

export default useTouchOnly;
