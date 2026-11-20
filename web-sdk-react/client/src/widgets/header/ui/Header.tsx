import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { LanguageSwitcher } from '@/features/switch-language';
import { DOCS_URL, SOURCE_URL } from '@/shared/config';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="header">
      <Link to="/" className="header__title">{t('app.title')}</Link>
      <nav className="header__nav">
        <a href={DOCS_URL} target="_blank" rel="noreferrer">{t('app.docs')}</a>
        <a href={SOURCE_URL} target="_blank" rel="noreferrer">{t('app.source')}</a>
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
