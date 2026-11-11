import React from 'react';

interface TaskProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({
  progress,
  showLabel = true,
  size = 'md',
}) => {
  const clamped = Math.min(100, Math.max(0, progress));
  const height = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className="text-slate-500">Progress</span>
          <span className="text-slate-800 font-bold">{clamped}%</span>
        </div>
      )}
      <div className={`w-full ${height} rounded-full bg-slate-100 overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            clamped === 100
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-[#1261E8] to-[#0645B5]'
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

