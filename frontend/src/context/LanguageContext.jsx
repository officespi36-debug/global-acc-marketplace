import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith('km') ? 'km' : 'en';

  const setLang = (lang) => {
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('i18nextLng', lang);
      localStorage.setItem('accglobal_lang', lang);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  };

  const toggleLanguage = () => {
    const next = currentLang === 'en' ? 'km' : 'en';
    setLang(next);
  };

  return (
    <LanguageContext.Provider value={{
      lang: currentLang,
      setLang,
      toggleLanguage,
      t,
      i18n,
      isKhmer: currentLang === 'km'
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
