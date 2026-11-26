import { Ban, ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Carousel, OptionTile, Segmented, Slider } from '@/shared/ui';
import { BACKGROUND_COLORS, BACKGROUND_IMAGES, LAYOUTS, useVideoEffectsStore } from '../model/store';

const imageUrlOf = (name: string) => `/backgrounds/${name}.jpg`;

export function BackgroundSettings() {
  const { t } = useTranslation();
  const { background, blur, color, imageUrl, layout } = useVideoEffectsStore((state) => state.draft);
  const uploadedImageUrl = useVideoEffectsStore((state) => state.uploadedImageUrl);
  const update = useVideoEffectsStore((state) => state.update);
  const uploadImage = useVideoEffectsStore((state) => state.uploadImage);
  const isImage = (url: string) => background === 'image' && imageUrl === url;

  return (
    <>
      <Carousel label={t('effects.background.title')}>
        <OptionTile label={t('effects.background.none')} isSelected={background === 'none'} onSelect={() => update({ background: 'none' })}>
          <Ban size={20} />
        </OptionTile>
        <OptionTile label={t('effects.background.blur')} isSelected={background === 'blur'} onSelect={() => update({ background: 'blur' })}>
          <span className="option-tile__blur" />
        </OptionTile>
        <OptionTile
          label={t('effects.background.color')}
          isSelected={background === 'color'}
          thumbnail={{ background: color }}
          onSelect={() => update({ background: 'color' })}
        />
        {BACKGROUND_IMAGES.map((name) => (
          <OptionTile
            key={name}
            label={t(`effects.background.images.${name}`)}
            isSelected={isImage(imageUrlOf(name))}
            thumbnail={{ backgroundImage: `url(${imageUrlOf(name)})` }}
            onSelect={() => update({ background: 'image', imageUrl: imageUrlOf(name) })}
          />
        ))}
        {uploadedImageUrl && (
          <OptionTile
            label={t('effects.background.uploaded')}
            isSelected={isImage(uploadedImageUrl)}
            thumbnail={{ backgroundImage: `url(${uploadedImageUrl})` }}
            onSelect={() => update({ background: 'image', imageUrl: uploadedImageUrl })}
          />
        )}
        <label className="option-tile option-tile--upload">
          <span className="option-tile__thumbnail"><ImagePlus size={20} /></span>
          <span className="option-tile__label">{t('effects.background.upload')}</span>
          <input
            type="file"
            accept="image/*"
            onChange={({ target }) => {
              if (target.files?.[0]) {
                uploadImage(target.files[0]);
              }
            }}
          />
        </label>
      </Carousel>
      {background === 'blur' && (
        <Slider label={t('effects.background.blurStrength')} min={0.1} value={blur} onChange={(value) => update({ blur: value })} />
      )}
      {background === 'color' && (
        <div className="palette" role="radiogroup" aria-label={t('effects.background.color')}>
          {BACKGROUND_COLORS.map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={item === color}
              aria-label={item}
              className="palette__item"
              style={{ background: item }}
              onClick={() => update({ color: item })}
            />
          ))}
          <input
            type="color"
            className="palette__custom"
            aria-label={t('effects.background.customColor')}
            title={t('effects.background.customColor')}
            value={color}
            onChange={({ target }) => update({ color: target.value })}
          />
        </div>
      )}
      {background === 'none'
        ? <p className="hint">{t('effects.background.layoutHint')}</p>
        : (
          <Segmented
            label={t('effects.layout.title')}
            value={layout}
            options={LAYOUTS.map((value) => ({ value, label: t(`effects.layout.${value}`) }))}
            onChange={(value) => update({ layout: value })}
          />
        )}
    </>
  );
}
