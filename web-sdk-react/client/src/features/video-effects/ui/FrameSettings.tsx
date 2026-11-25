import { useTranslation } from 'react-i18next';
import { Carousel, OptionTile, Segmented, Slider } from '@/shared/ui';
import { LOWER_THIRD_PLACEMENTS, LOWER_THIRD_TYPES, useVideoEffectsStore } from '../model/store';

interface FrameSettingsProps {
  displayName?: string;
}

export function FrameSettings({ displayName }: FrameSettingsProps) {
  const { t } = useTranslation();
  const settings = useVideoEffectsStore((state) => state.settings);
  const update = useVideoEffectsStore((state) => state.update);

  const toggleLowerThird = (isLowerThirdOn: boolean) => update({
    isLowerThirdOn,
    lowerThirdTitle: settings.lowerThirdTitle || displayName || t('effects.lowerThird.defaultTitle'),
  });

  return (
    <>
      <Slider
        label={t('effects.smartZoom.title')}
        offLabel={t('effects.off')}
        value={settings.smartZoom}
        onChange={(value) => update({ smartZoom: value })}
      />
      <p className="hint">{t('effects.smartZoom.hint')}</p>
      <label className="switch settings-title">
        <input type="checkbox" checked={settings.isLowerThirdOn} onChange={({ target }) => toggleLowerThird(target.checked)} />
        <span>{t('effects.lowerThird.title')}</span>
      </label>
      {settings.isLowerThirdOn ? (
        <>
          <Carousel label={t('effects.lowerThird.template')}>
            {LOWER_THIRD_TYPES.map((type, index) => (
              <OptionTile
                key={type}
                label={t('effects.lowerThird.templateNumber', { number: index + 1 })}
                isSelected={settings.lowerThirdType === type}
                onSelect={() => update({ lowerThirdType: type })}
              >
                <span className={`option-tile__plate option-tile__plate--${index + 1}`} style={{ background: settings.lowerThirdColor }} />
              </OptionTile>
            ))}
          </Carousel>
          <label className="field">
            <span>{t('effects.lowerThird.heading')}</span>
            <input
              value={settings.lowerThirdTitle}
              maxLength={40}
              onChange={({ target }) => update({ lowerThirdTitle: target.value })}
            />
          </label>
          <label className="field">
            <span>{t('effects.lowerThird.subtitle')}</span>
            <input
              value={settings.lowerThirdSubtitle}
              maxLength={60}
              placeholder={t('effects.lowerThird.subtitlePlaceholder')}
              onChange={({ target }) => update({ lowerThirdSubtitle: target.value })}
            />
          </label>
          <Segmented
            label={t('effects.lowerThird.placement')}
            value={settings.lowerThirdPlacement}
            options={LOWER_THIRD_PLACEMENTS.map((value) => ({ value, label: t(`effects.lowerThird.placements.${value}`) }))}
            onChange={(value) => update({ lowerThirdPlacement: value })}
          />
          <label className="color-field">
            <span>{t('effects.lowerThird.color')}</span>
            <input
              type="color"
              value={settings.lowerThirdColor}
              onChange={({ target }) => update({ lowerThirdColor: target.value })}
            />
          </label>
        </>
      ) : <p className="hint">{t('effects.lowerThird.hint')}</p>}
    </>
  );
}
