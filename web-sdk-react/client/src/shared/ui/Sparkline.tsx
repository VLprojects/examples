interface SparklineProps {
  values: number[];
  label: string;
}

const WIDTH = 96;
const HEIGHT = 20;

export function Sparkline({ values, label }: SparklineProps) {
  if (values.length < 2) {
    return null;
  }

  const max = Math.max(...values, 1);
  const step = WIDTH / (values.length - 1);
  const points = values
    .map((value, index) => `${(index * step).toFixed(1)},${(HEIGHT - 1 - (value / max) * (HEIGHT - 2)).toFixed(1)}`)
    .join(' ');

  return (
    <svg className="sparkline" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} role="img" aria-label={label}>
      <polyline points={points} />
    </svg>
  );
}
