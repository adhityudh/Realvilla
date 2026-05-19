'use client';

import { createContext, useContext, useCallback, useRef } from 'react';

interface ModalRegistryContextValue {
  registerModal: (id: string, open: () => void) => void;
  unregisterModal: (id: string) => void;
  openModal: (id: string) => void;
}

export const ModalRegistryContext = createContext<ModalRegistryContextValue>({
  registerModal: () => {},
  unregisterModal: () => {},
  openModal: () => {},
});

export function useModalRegistry() {
  return useContext(ModalRegistryContext);
}

export function ModalRegistryProvider({ children }: { children: React.ReactNode }) {
  const registry = useRef<Map<string, () => void>>(new Map());

  const registerModal = useCallback((id: string, open: () => void) => {
    registry.current.set(id, open);
  }, []);

  const unregisterModal = useCallback((id: string) => {
    registry.current.delete(id);
  }, []);

  const openModal = useCallback((id: string) => {
    const opener = registry.current.get(id);
    if (opener) {
      opener();
    } else {
      console.warn(`[PageComponents] No modal registered with id: "${id}"`);
    }
  }, []);

  return (
    <ModalRegistryContext.Provider value={{ registerModal, unregisterModal, openModal }}>
      {children}
    </ModalRegistryContext.Provider>
  );
}
