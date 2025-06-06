'use client';

import { useLanguage } from '@/context/LanguageContext';
import en from '@/i18n/en.json';
import jp from '@/i18n/jp.json';
import kr from '@/i18n/kr.json';

const translations: Record<string, Record<string, string>> = {
  en: en as Record<string, string>,
  jp: jp as Record<string, string>,
  kr: kr as Record<string, string>,
};

export function Translate({ t }: { t: string }) {
  const { language } = useLanguage();
  return translations[language]?.[t] || t;
}
