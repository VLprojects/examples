import { useTranslation } from 'react-i18next';
import { useToastStore } from './store';

export function Toaster() {
  const { t } = useTranslation();
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="toaster" role="status">
      {toasts.map(({ id, messageKey, params, tone }) => (
        <div key={id} className={`toast toast--${tone}`}>{t(messageKey, params)}</div>
      ))}
    </div>
  );
}
