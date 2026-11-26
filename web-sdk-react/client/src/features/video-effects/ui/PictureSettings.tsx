import { Ban } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Carousel, OptionTile, Slider } from '@/shared/ui';
import { COLOR_FILTERS, useVideoEffectsStore } from '../model/store';

const ENHANCEMENTS = ['beautification', 'lowLight', 'colorCorrection', 'sharpness'] as const;

export function PictureSettings() {
  const { t } = useTranslation();
  const settings = useVideoEffectsStore((state) => state.draft);
  const update = useVideoEffectsStore((state) => state.update);

  return (
    <>
      {ENHANCEMENTS.map((id) => (
        <Slider
          key={id}
          label={t(`effects.picture.${id}`)}
          offLabel={t('effects.off')}
          value={settings[id]}
          onChange={(value) => update({ [id]: value })}
        />
      ))}
      <h3 className="settings-title">{t('effects.filter.title')}</h3>
      <Carousel label={t('effects.filter.title')}>
        <OptionTile label={t('effects.filter.none')} isSelected={!settings.colorFilter} onSelect={() => update({ colorFilter: undefined })}>
          <Ban size={20} />
        </OptionTile>
        {COLOR_FILTERS.map((id) => (
          <OptionTile
            key={id}
            label={t(`effects.filter.${id}`)}
            isSelected={settings.colorFilter === id}
            onSelect={() => update({ colorFilter: id })}
          >
            <span className={`option-tile__filter option-tile__filter--${id}`} />
          </OptionTile>
        ))}
      </Carousel>
      {settings.colorFilter && (
        <Slider
          label={t('effects.filter.power')}
          min={0.1}
          value={settings.colorFilterPower}
          onChange={(value) => update({ colorFilterPower: value })}
        />
      )}
    </>
  );
}
