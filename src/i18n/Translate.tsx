'use client';

import { useLanguage } from '@/context/LanguageContext';
import en from '@/i18n/en.json';
import jp from '@/i18n/jp.json';
import kr from '@/i18n/kr.json';

const translations: Record<string, Record<string, string>> = {
  en,
  jp,
  kr,
};

export function Translate({ t }: { t: string }) {
  const { language } = useLanguage();
  return translations[language]?.[t] || t;
}
