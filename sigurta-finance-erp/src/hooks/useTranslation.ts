import { useState, useEffect } from "react";
import { t as translate, setLanguage as setLang, getCurrentLanguage } from "../lib/i18n";

// Hook للاستخدام في React Components
export const useTranslation = () => {
  const [language, setLanguageState] = useState<string>(getCurrentLanguage());
  
  useEffect(() => {
    // تحديث اللغة عند تغييرها في localStorage
    const handleStorageChange = () => {
      setLanguageState(getCurrentLanguage());
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  
  const changeLanguage = (lang: string) => {
    setLang(lang);
    setLanguageState(lang);
    // إعادة تحميل الصفحة لتطبيق التغييرات
    window.location.reload();
  };
  
  return {
    t: (key: string, params?: Record<string, string | number>) => translate(key, params),
    language,
    changeLanguage,
  };
};
