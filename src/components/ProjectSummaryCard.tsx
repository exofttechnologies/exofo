import React from 'react';
import { Monitor, GraduationCap, Smartphone, Database, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';

interface ProjectSummaryCardProps {
  project: Project;
  onClick?: (project: Project) => void;
}

export const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({
  project,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(project);
    } else {
      navigate(`/projects/${project.id}`);
    }
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Monitor':
        return <Monitor className="w-6 h-6 text-white stroke-[2]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6 text-white stroke-[2]" />;
      case 'Smartphone':
        return <Smartphone className="w-6 h-6 text-white stroke-[2]" />;
      case 'Database':
        return <Database className="w-6 h-6 text-white stroke-[2]" />;
      case 'Layout':
      default:
        return <Layout className="w-6 h-6 text-white stroke-[2]" />;
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group glass-surface stat-card-hover rounded-[24px] p-4 sm:p-4.5 cursor-pointer select-none transition-all duration-200"
    >
      {/* Top Details Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* Left: Icon + Titles */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Blue gradient square icon */}
          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#1261E8] to-[#0645B5] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
            {renderIcon(project.iconName)}
          </div>

          <div className="min-w-0">
            <h4 className="text-[15px] font-bold text-slate-900 tracking-tight truncate leading-tight group-hover:text-blue-600 transition-colors">
              {project.name}
            </h4>
            <p className="text-[12.5px] font-medium text-slate-500 truncate mt-0.5">
              {project.description}
            </p>
          </div>
        </div>

        {/* Right: Status Pill */}
        <div className="flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FF] border border-[#DCEBFF] text-[12px] font-semibold text-[#1261E8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1261E8]" />
            <span>{project.status}</span>
          </span>
        </div>
      </div>

      {/* Bottom Progress Row */}
      <div className="pt-0.5">
        <div className="flex items-center justify-between text-[12px] font-medium mb-1.5">
          <span className="text-slate-400 font-medium">Progress</span>
          <span className="text-slate-900 font-bold">{project.progress}%</span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-1.5 sm:h-2 bg-[#E6EFFD] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1261E8] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
