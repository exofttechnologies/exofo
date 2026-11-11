import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { ProjectSummaryCard } from './ProjectSummaryCard';

interface CurrentProjectsProps {
  projects: Project[];
  onViewAll?: () => void;
  onSelectProject?: (project: Project) => void;
}

export const CurrentProjects: React.FC<CurrentProjectsProps> = ({
  projects,
  onViewAll,
  onSelectProject,
}) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate('/projects');
    }
  };

  return (
    <section className="pt-2 pb-24" aria-label="Current Projects">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5 px-0.5">
        <h3 className="text-[17px] font-bold tracking-tight text-slate-900">
          Current Projects
        </h3>

        <button
          onClick={handleViewAll}
          className="group inline-flex items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Projects List */}
      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <ProjectSummaryCard
            key={project.id}
            project={project}
            onClick={onSelectProject}
          />
        ))}
      </div>
    </section>
  );
};
