import type { CSSProperties, ReactNode } from 'react';

interface OptionTileProps {
  label: string;
  isSelected: boolean;
  thumbnail?: CSSProperties;
  children?: ReactNode;
  onSelect: () => void;
}

export function OptionTile({ label, isSelected, thumbnail, children, onSelect }: OptionTileProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      className="option-tile"
      onClick={onSelect}
      onFocus={({ currentTarget }) => currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })}
    >
      <span className="option-tile__thumbnail" style={thumbnail}>{children}</span>
      <span className="option-tile__label">{label}</span>
    </button>
  );
}
