import { useTranslation } from 'react-i18next';
import { useNoiseSuppressionStore } from '../model/store';

interface NoiseSuppressionToggleProps {
  isPublishing: boolean;
}

export function NoiseSuppressionToggle({ isPublishing }: NoiseSuppressionToggleProps) {
  const { t } = useTranslation();
  const { isEnabled, isInitializing, engine, toggle } = useNoiseSuppressionStore();

  const status = () => {
    if (!isEnabled) {
      return undefined;
    }

    if (!isPublishing) {
      return t('noiseSuppression.afterJoin');
    }

    if (isInitializing) {
      return t('noiseSuppression.loading');
    }

    return engine && t('noiseSuppression.engine', { engine: t(`noiseSuppression.engines.${engine}`, engine) });
  };

  return (
    <div className="noise-suppression">
      <label className="switch">
        <input type="checkbox" checked={isEnabled} onChange={toggle} />
        <span>{t('noiseSuppression.title')}</span>
      </label>
      <p className="hint" role="status">{status()}</p>
    </div>
  );
}
