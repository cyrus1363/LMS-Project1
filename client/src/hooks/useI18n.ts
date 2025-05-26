import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './useAuth';

// Language configurations
export const languages = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    dir: 'ltr'
  },
  fa: {
    code: 'fa',
    name: 'فارسی',
    flag: '🇮🇷',
    dir: 'rtl'
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl'
  },
  es: {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    dir: 'ltr'
  },
  zh: {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳',
    dir: 'ltr'
  }
} as const;

export type LanguageCode = keyof typeof languages;

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Load translations dynamically
const loadTranslations = async (lang: LanguageCode) => {
  try {
    const module = await import(`../locales/${lang}.json`);
    return module.default;
  } catch (error) {
    console.warn(`Failed to load translations for ${lang}, falling back to English`);
    const module = await import('../locales/en.json');
    return module.default;
  }
};

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useI18nSetup() {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [translations, setTranslations] = useState<any>({});

  // Auto-detect language from user settings or browser
  useEffect(() => {
    const detectLanguage = (): LanguageCode => {
      // 1. Use user's saved language preference
      if (user?.language && languages[user.language as LanguageCode]) {
        return user.language as LanguageCode;
      }
      
      // 2. Use browser language
      const browserLang = navigator.language.split('-')[0];
      if (languages[browserLang as LanguageCode]) {
        return browserLang as LanguageCode;
      }
      
      // 3. Default to English
      return 'en';
    };

    const detectedLang = detectLanguage();
    setLanguageState(detectedLang);
  }, [user]);

  // Load translations when language changes
  useEffect(() => {
    loadTranslations(language).then(setTranslations);
  }, [language]);

  // Update document direction and language
  useEffect(() => {
    const lang = languages[language];
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = lang.code;
    
    // Add/remove RTL class for styling
    if (lang.dir === 'rtl') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language]);

  const setLanguage = async (lang: LanguageCode) => {
    setLanguageState(lang);
    
    // Save to user preferences if authenticated
    if (user) {
      try {
        await fetch('/api/user/language', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ language: lang })
        });
      } catch (error) {
        console.warn('Failed to save language preference:', error);
      }
    }
  };

  // Translation function with nested key support
  const t = (key: string): string => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key as fallback
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const currentLang = languages[language];

  return {
    language,
    setLanguage,
    t,
    dir: currentLang.dir,
    isRTL: currentLang.dir === 'rtl',
    translations
  };
}