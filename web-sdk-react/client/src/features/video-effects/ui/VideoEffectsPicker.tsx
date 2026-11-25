import { Ban, ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BACKGROUNDS, ENHANCEMENTS, useVideoEffectsStore } from '../model/store';
import type { BackgroundId, EnhancementId } from '../model/store';

const BACKGROUND_IDS = Object.keys(BACKGROUNDS) as (keyof typeof BACKGROUNDS)[];
const ENHANCEMENT_IDS = Object.keys(ENHANCEMENTS) as EnhancementId[];

export function VideoEffectsPicker() {
  const { t } = useTranslation();
  const { status, background, imageUrl, enhancements, setBackground, setImage, toggleEnhancement } = useVideoEffectsStore();
  const swatchClass = (id: BackgroundId) => `swatch swatch--${id}`;

  return (
    <div className="effects-picker">
      <p className="effects-picker__title">{t('effects.background')}</p>
      <div className="effects-picker__swatches" role="radiogroup" aria-label={t('effects.background')}>
        {BACKGROUND_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={background === id}
            aria-label={t(`effects.backgrounds.${id}`)}
            title={t(`effects.backgrounds.${id}`)}
            className={swatchClass(id)}
            onClick={() => setBackground(id)}
          >
            {id === 'none' && <Ban size={18} />}
          </button>
        ))}
        <label
          className={swatchClass('image')}
          title={t('effects.backgrounds.image')}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
          data-checked={background === 'image'}
        >
          {!imageUrl && <ImagePlus size={18} />}
          <input
            type="file"
            accept="image/*"
            aria-label={t('effects.backgrounds.image')}
            onChange={({ target }) => {
              if (target.files?.[0]) {
                setImage(target.files[0]);
              }
            }}
          />
        </label>
      </div>
      <p className="effects-picker__title">{t('effects.enhancements')}</p>
      {ENHANCEMENT_IDS.map((id) => (
        <label key={id} className="switch">
          <input type="checkbox" checked={enhancements.includes(id)} onChange={() => toggleEnhancement(id)} />
          <span>{t(`effects.enhancement.${id}`)}</span>
        </label>
      ))}
      {status === 'loading' && <p className="effects-picker__status">{t('effects.loading')}</p>}
    </div>
  );
}
