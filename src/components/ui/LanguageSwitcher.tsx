'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const LANGS = [
    { code: 'en', label: 'EN' },
    { code: 'jp', label: 'JP' },
    { code: 'kr', label: 'KR' },
    { code: 'pl', label: 'PL' },
  ];

  return (
    <div className="flex gap-2">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          disabled={language === code}
          aria-label={`Switch to ${label}`}
          aria-pressed={language === code}
          className={`btn text-sm px-3 py-1 ${
            language === code
              ? 'bg-black text-white border border-black'
              : 'bg-white text-black border border-gray-300 hover:bg-gray-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
