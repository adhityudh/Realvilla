'use client';

import { useEffect } from 'react';
import { useTranslations, TranslationLink } from './TranslationProvider';

/**
 * Invisible component rendered by pages to register their translation links.
 * When this component mounts, it pushes the page's `_translations` data
 * into the shared TranslationContext so the LanguageSwitcher can use it.
 */
export default function TranslationSetter({
  translations,
}: {
  translations: TranslationLink[];
}) {
  const { setTranslations } = useTranslations();

  useEffect(() => {
    setTranslations(translations ?? []);
  }, [translations, setTranslations]);

  return null;
}
