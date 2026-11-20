import { useTranslation } from 'react-i18next';
import { changeLanguage, LANGUAGES } from '@/shared/i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="language-switcher">
      {LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          className={language === i18n.language ? 'language-switcher__item language-switcher__item--active' : 'language-switcher__item'}
          onClick={() => void changeLanguage(language)}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
