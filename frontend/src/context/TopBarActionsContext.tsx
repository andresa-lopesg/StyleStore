import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface TopBarActionsContextValue {
  actions: ReactNode;
  setActions: (node: ReactNode) => void;
}

const TopBarActionsContext = createContext<TopBarActionsContextValue>({
  actions: null,
  setActions: () => {},
});

export function TopBarActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null);
  return (
    <TopBarActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </TopBarActionsContext.Provider>
  );
}

export function useTopBarActions() {
  return useContext(TopBarActionsContext);
}
