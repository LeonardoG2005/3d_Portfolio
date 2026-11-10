import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readStored, writeStored } from '../lib/storage.js';
import en from './en.js';
import es from './es.js';

const DICTIONARIES = { en, es };
const LanguageContext = createContext(null);

function initialLanguage() {
  const saved = readStored('lang');
  if (saved === 'en' || saved === 'es') return saved;
  // English is the default; Spanish-speaking browsers start in Spanish.
  return (navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en';
}

function lookup(dictionary, key) {
  return key.split('.').reduce((node, part) => (node == null ? node : node[part]), dictionary);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((current) => {
      const next = current === 'en' ? 'es' : 'en';
      writeStored('lang', next);
      return next;
    });
  }, []);

  // t('a.b') returns strings, arrays or objects from the active dictionary.
  // {name} placeholders in strings are replaced from vars.
  const t = useCallback(
    (key, vars) => {
      let value = lookup(DICTIONARIES[lang], key);
      if (value === undefined) value = lookup(DICTIONARIES.en, key);
      if (value === undefined) {
        if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`);
        return key;
      }
      if (typeof value === 'string' && vars) {
        return value.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
      }
      return value;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, toggle, t }), [lang, toggle, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
export const useT = () => useContext(LanguageContext).t;
