import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Slot de ações do Header. Uma página pode registrar botões que aparecem ao
// lado do sino enquanto ela estiver montada; sem registro o slot não ocupa
// espaço. Nesta versão nenhuma página usa; o slot existe para o header ter
// papel além do sino (decisão 8 do programa Impeccable).

const HeaderActionsContext = createContext({ actions: null, setActions: () => {} });

export function HeaderActionsProvider({ children }) {
  const [actions, setActions] = useState(null);
  const value = useMemo(() => ({ actions, setActions }), [actions]);
  return <HeaderActionsContext.Provider value={value}>{children}</HeaderActionsContext.Provider>;
}

/** Página: `useHeaderActions(<Botoes/>, [deps])`. Limpa ao desmontar. */
export function useHeaderActions(node, deps = []) {
  const { setActions } = useContext(HeaderActionsContext);
  useEffect(() => {
    setActions(node);
    return () => setActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Header: lê o que a página registrou. */
export function useHeaderActionsSlot() {
  return useContext(HeaderActionsContext).actions;
}
