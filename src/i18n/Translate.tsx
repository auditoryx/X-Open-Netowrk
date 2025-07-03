'use client';

import { useLanguage } from '@/context/LanguageContext';
import en from '@/i18n/en.json';
import jp from '@/i18n/jp.json';
import kr from '@/i18n/kr.json';
import pl from '@/i18n/pl.json';

const translations: Record<string, Record<string, string>> = {
  en,
  jp,
  kr,
  pl,
};

export function Translate({ t }: { t: string }) {
  const { language } = useLanguage();
  return translations[language]?.[t] || t;
}

// Create a txt function that can be used outside React components
// This will default to English when language context is not available
export const txt = (key: string, lang: string = 'en'): string => {
  return translations[lang]?.[key] || key;
};

// For backward compatibility, attach txt to Translate
(Translate as any).txt = txt;
