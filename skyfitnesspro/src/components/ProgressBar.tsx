'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  percentage?: number;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressBar({
  current,
  total,
  percentage = Math.round((current / total) * 100),
  showLabel = true,
  height = 'md',
  className = '',
}: ProgressBarProps) {
  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[height];

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Прогресс</span>
          <span className="font-medium">
            {current} / {total}
          </span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClass}`}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: '#00C1FF',
          }}
        />
      </div>
      {showLabel && (
        <div className="text-right text-xs mt-1" style={{ color: '#00C1FF' }}>
          {percentage}%
        </div>
      )}
    </div>
  );
}
