import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FloatingAddButtonProps {
  label?: string;
  onClick?: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ 
  label = 'Add Task',
  onClick 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/tasks/create');
    }
  };

  return (
    <div className="hidden lg:block fixed bottom-8 right-8 z-40">
      <button
        onClick={handleClick}
        aria-label={label}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#0645B5] to-[#1261E8] text-white shadow-xl shadow-blue-500/35 border-2 border-white/60 hover:scale-108 active:scale-95 transition-all duration-200"
      >
        <Plus className="w-7 h-7 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
        
        {/* Tooltip on desktop */}
        <span className="hidden sm:block absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
          {label}
        </span>
      </button>
    </div>
  );
};
