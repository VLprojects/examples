import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';

export const LANGUAGES = ['ru', 'en'] as const;
export type Language = typeof LANGUAGES[number];

const STORAGE_KEY = 'sdk-demo:language';

const isLanguage = (value: string | null | undefined): value is Language => (
  LANGUAGES.includes(value as Language)
);

const detectLanguage = (): Language => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (isLanguage(stored)) {
    return stored;
  }

  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
};

export const initI18n = () => i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ru: { translation: ru } },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export const changeLanguage = async (language: Language) => {
  localStorage.setItem(STORAGE_KEY, language);
  document.documentElement.lang = language;
  await i18n.changeLanguage(language);
};
