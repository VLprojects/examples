interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  offLabel?: string;
  onChange: (value: number) => void;
}

export function Slider({ label, value, min = 0, max = 1, offLabel, onChange }: SliderProps) {
  const percent = `${Math.round(value * 100)}%`;

  return (
    <label className="slider">
      <span className="slider__label">{label}</span>
      <output className="slider__value">{value === 0 && offLabel ? offLabel : percent}</output>
      <input
        type="range"
        min={min}
        max={max}
        step={0.05}
        value={value}
        onChange={({ target }) => onChange(Number(target.value))}
      />
    </label>
  );
}
