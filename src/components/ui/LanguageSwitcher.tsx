'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2">
      <button onClick={() => setLanguage('en')} disabled={language === 'en'}>
        EN
      </button>
      <button onClick={() => setLanguage('jp')} disabled={language === 'jp'}>
        JP
      </button>
      <button onClick={() => setLanguage('kr')} disabled={language === 'kr'}>
        KR
      </button>
    </div>
  );
}
