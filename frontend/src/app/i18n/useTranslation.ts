import { useLanguage } from "../contexts/LanguageContext";
import { translations, TranslationKey } from "./translations";

export function useTranslation() {
  const { language, setLanguage } = useLanguage();
  
  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.ru[key] || key;
  };
  
  return { t, language, setLanguage };
}
