'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type TranslationLink = {
  language: string;
  slug: string;
};

type TranslationContextValue = {
  translations: TranslationLink[];
  setTranslations: (translations: TranslationLink[]) => void;
};

const TranslationContext = createContext<TranslationContextValue>({
  translations: [],
  setTranslations: () => {},
});

export function useTranslations() {
  return useContext(TranslationContext);
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [translations, setTranslationsState] = useState<TranslationLink[]>([]);

  const setTranslations = useCallback((t: TranslationLink[]) => {
    setTranslationsState(t);
  }, []);

  return (
    <TranslationContext value={{ translations, setTranslations }}>
      {children}
    </TranslationContext>
  );
}
