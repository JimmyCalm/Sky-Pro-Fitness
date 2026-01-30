'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  percentage?: number;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string; // добавили пропс для цвета
}

export default function ProgressBar({
  current,
  total,
  percentage = total > 0 ? Math.round((current / total) * 100) : 0,
  showLabel = true,
  height = 'md',
  className = '',
  color = '#00C1FF', // по умолчанию твой цвет
}: ProgressBarProps) {
  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[height];

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Прогресс</span>
          <span className="font-medium">{percentage}%</span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClass}`}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
