import { useTranslation } from 'react-i18next';
import { useNoiseSuppressionStore } from '../model/store';

export function NoiseSuppressionToggle() {
  const { t } = useTranslation();
  const isEnabled = useNoiseSuppressionStore((state) => state.isEnabled);
  const toggle = useNoiseSuppressionStore((state) => state.toggle);

  return (
    <label className="switch">
      <input type="checkbox" checked={isEnabled} onChange={toggle} />
      <span>{t('effects.noiseSuppression')}</span>
    </label>
  );
}
