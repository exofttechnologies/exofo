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
    <div className="relative pt-12 pb-3 select-none">
      {/* ------------------------------------------------------------------
          Layer 3: Topmost / Furthest Back Folder - "Documents"
          ------------------------------------------------------------------ */}
      <div 
        onClick={() => navigate('/documents')}
        role="button"
        tabIndex={0}
        aria-label="View Documents"
        className="absolute top-0 right-3 z-0 flex items-center gap-1.5 px-3.5 py-2 rounded-t-[14px] glass-folder-tab cursor-pointer transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
      >
        <FileText className="w-3.5 h-3.5 text-slate-700 stroke-[2.2]" />
        <span className="text-[12.5px] font-semibold text-slate-800">
          Documents
        </span>
      </div>
      {/* Background folder body for Layer 3 */}
      <div 
        className="absolute top-2.5 inset-x-2 h-24 rounded-t-[24px] bg-white/40 backdrop-blur-sm border border-white/60 pointer-events-none -z-10"
        style={{ transform: 'scale(0.96)' }} 
      />

      {/* ------------------------------------------------------------------
          Layer 2: Middle Folder - "Tasks"
          ------------------------------------------------------------------ */}
      <div 
        onClick={() => navigate('/tasks')}
        role="button"
        tabIndex={0}
        aria-label="View Tasks"
        className="absolute top-4 left-[24%] z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-t-[14px] glass-folder-tab cursor-pointer transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
      >
        <CheckSquare className="w-3.5 h-3.5 text-slate-700 stroke-[2.2]" />
        <span className="text-[12.5px] font-semibold text-slate-800">
          Tasks
        </span>
      </div>
      {/* Background folder body for Layer 2 */}
      <div 
        className="absolute top-6 inset-x-1 h-20 rounded-t-[26px] bg-white/50 backdrop-blur-md border border-white/70 pointer-events-none z-10"
        style={{ transform: 'scale(0.98)' }} 
      />

      {/* ------------------------------------------------------------------
          Layer 1: Front Folder Tab - "Team"
          ------------------------------------------------------------------ */}
      <div 
        onClick={() => navigate('/team')}
        role="button"
        tabIndex={0}
        aria-label="View Team"
        className="absolute top-8 left-4 z-20 flex items-center gap-1.5 px-3.5 py-2 rounded-t-[14px] glass-folder-tab cursor-pointer transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
      >
        <Users className="w-3.5 h-3.5 text-slate-700 stroke-[2.2]" />
        <span className="text-[12.5px] font-semibold text-slate-800">
          Team
        </span>
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
