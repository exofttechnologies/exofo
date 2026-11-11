import React from 'react';
import { 
  Folder, 
  ArrowRight, 
  PlayCircle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectStats } from '../data/mockData';

interface MainProjectCardProps {
  onFilterStatus?: (status: string) => void;
}

export const MainProjectCard: React.FC<MainProjectCardProps> = ({
  onFilterStatus,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/projects');
  };

  const handleStatusClick = (e: React.MouseEvent, status: string) => {
    e.stopPropagation();
    if (onFilterStatus) {
      onFilterStatus(status);
    } else {
      navigate(`/projects?status=${encodeURIComponent(status)}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="group relative w-full rounded-[28px] p-5 sm:p-6 text-white cursor-pointer select-none transition-all duration-300 transform active:scale-[0.985] glass-blue-project"
    >
      {/* Ambient glass reflections and wave curves */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/20 pointer-events-none rounded-[28px]" />

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Folder className="w-6 h-6 text-white stroke-[2.2]" />
          <h3 className="text-[18px] font-bold tracking-tight text-white">
            Projects
          </h3>
        </div>

        {/* Circular Action Navigation Button */}
        <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all duration-200 group-hover:bg-white group-hover:text-blue-600 group-hover:scale-105 shadow-sm">
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Main Metric Stat Row */}
      <div className="relative z-10 flex items-baseline gap-3 mb-5">
        <span className="text-[40px] sm:text-[44px] font-black tracking-tight leading-none text-white drop-shadow-sm">
          {projectStats.totalActive}
        </span>
        <span className="text-[14px] sm:text-[15px] font-semibold text-white/95 tracking-normal">
          Active Projects
        </span>
      </div>

      {/* Bottom Status Pills */}
      <div className="relative z-10 flex items-center gap-2 flex-wrap">
        {/* In Progress Pill */}
        <button
          type="button"
          onClick={(e) => handleStatusClick(e, 'In Progress')}
          className="glass-blue-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-white transition-all duration-150 active:scale-95"
        >
          <PlayCircle className="w-3.5 h-3.5 text-white/90 stroke-[2.2]" />
          <span>{projectStats.inProgress} In Progress</span>
        </button>

        {/* Completed Pill */}
        <button
          type="button"
          onClick={(e) => handleStatusClick(e, 'Completed')}
          className="glass-blue-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-white transition-all duration-150 active:scale-95"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-white/90 stroke-[2.2]" />
          <span>{projectStats.completed} Completed</span>
        </button>

        {/* On Hold Pill */}
        <button
          type="button"
          onClick={(e) => handleStatusClick(e, 'On Hold')}
          className="glass-blue-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-white transition-all duration-150 active:scale-95"
        >
          <Clock className="w-3.5 h-3.5 text-white/90 stroke-[2.2]" />
          <span>{projectStats.onHold} On Hold</span>
        </button>
      </div>
    </div>
  );
};
