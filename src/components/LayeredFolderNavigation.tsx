import React from 'react';
import { FileText, CheckSquare, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainProjectCard } from './MainProjectCard';

interface LayeredFolderNavigationProps {
  onFilterStatus?: (status: string) => void;
}

export const LayeredFolderNavigation: React.FC<LayeredFolderNavigationProps> = ({
  onFilterStatus,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative pt-10 pb-3 select-none">
      {/* ------------------------------------------------------------------
          Folder Tabs Bar - Positioned neatly along the top of the blue card
          ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between px-2 sm:px-3 mb-[-1px] relative z-20">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Tab 1: Team */}
          <button 
            type="button"
            onClick={() => navigate('/team')}
            aria-label="View Team"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-t-[14px] glass-folder-tab cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Users className="w-3.5 h-3.5 text-slate-700 stroke-[2.2]" />
            <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-800">
              Team
            </span>
          </button>

          {/* Tab 2: Tasks */}
          <button 
            type="button"
            onClick={() => navigate('/tasks')}
            aria-label="View Tasks"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-t-[14px] glass-folder-tab cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <CheckSquare className="w-3.5 h-3.5 text-slate-700 stroke-[2.2]" />
            <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-800">
              Tasks
            </span>
          </button>
        </div>

        {/* Tab 3: Documents */}
        <button 
          type="button"
          onClick={() => navigate('/documents')}
          aria-label="View Documents"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-t-[14px] glass-folder-tab cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <FileText className="w-3.5 h-3.5 text-slate-700 stroke-[2.2]" />
          <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-800">
            Documents
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------------
          Front Layer: Main Electric Blue "Projects" Card
          ------------------------------------------------------------------ */}
      <div className="relative z-30">
        <MainProjectCard 
          onFilterStatus={onFilterStatus} 
        />
      </div>
    </div>
  );
};
