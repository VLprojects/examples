import { ChevronDown, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStoredFlag } from '@/shared/lib';
import { ApiNote } from '@/shared/ui';
import { TAB_GUIDES } from '../model/tabs';
import type { DevTab } from '../model/tabs';

interface TabGuideProps {
  tab: DevTab;
}

export function TabGuide({ tab }: TabGuideProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useStoredFlag('dev-guide-open', true);

  return (
    <section className="tab-guide">
      <button type="button" className="tab-guide__toggle" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <Info size={14} aria-hidden />
        <span>{t('dev.guide.title')}</span>
        <ChevronDown size={14} aria-hidden />
      </button>
      {isOpen && <ApiNote text={t(`dev.guide.${tab}`)} {...TAB_GUIDES[tab]} />}
    </section>
  );
}
