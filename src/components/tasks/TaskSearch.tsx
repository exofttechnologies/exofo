import React from 'react';
import { Search, X } from 'lucide-react';

interface TaskSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const TaskSearch: React.FC<TaskSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search tasks by name, ID, or employee...',
}) => {
  return (
    <div className="relative flex-1 min-w-[220px]">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4 stroke-[2]" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white/90 border border-slate-200/80 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs backdrop-blur-sm"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

