import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  ArrowRight, 
  Monitor, 
  GraduationCap, 
  Smartphone, 
  Database, 
  Layout, 
  Folder 
} from 'lucide-react';
import { Project } from '../../types';

interface EmployeeProjectsCardProps {
  projects: Project[];
}

export const EmployeeProjectsCard: React.FC<EmployeeProjectsCardProps> = ({ projects }) => {
  const navigate = useNavigate();

  const renderProjectIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Monitor':
        return <Monitor className="w-5 h-5 text-blue-600" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-indigo-600" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-violet-600" />;
      case 'Database':
        return <Database className="w-5 h-5 text-slate-700" />;
      case 'Layout':
      default:
        return <Layout className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <section className="relative pt-4 mb-8 select-none">
      {/* Folder Tab Header */}
      <div className="absolute top-0 left-4 z-10 flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/80 backdrop-blur-md border border-b-0 border-white/90 shadow-2xs">
        <Layers className="w-3.5 h-3.5 text-slate-800 stroke-[2.4]" />
        <span className="text-[11px] font-bold text-slate-900 tracking-tight">
          Assigned Projects
        </span>
        <span className="ml-1 text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full">
          {projects.length}
        </span>
      </div>

      {/* Main Frosted-Glass Card */}
      <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/70 backdrop-blur-xl border border-white/90 p-5 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.02)]">
        {/* Subtle Decorative Ambient Fluid Gradients */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-tr from-rose-400/8 via-slate-400/5 to-transparent blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 mb-4 border-b border-slate-100/80">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              My Projects
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Active company client initiatives assigned to your workspace
            </p>
          </div>

          <button
            onClick={() => navigate('/employee/projects')}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 px-3.5 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Projects Rows List */}
        <div className="relative z-10 space-y-3.5">
          {projects.length === 0 ? (
            <div className="py-10 text-center">
              <Folder className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Projects Currently Assigned</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                New initiatives assigned by management will appear here.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/employee/projects/${project.id}`)}
                role="button"
                tabIndex={0}
                className="group p-4 sm:p-5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/70 hover:border-blue-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    {renderProjectIcon(project.iconName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {project.name}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {project.projectCode}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Right: Progress & Status */}
                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Progress Bar Container */}
                  <div className="w-36 sm:w-44 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400 text-[11px] font-semibold">Progress</span>
                      <span className="text-slate-900">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          project.status === 'Completed'
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        project.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : project.status === 'On Hold'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          project.status === 'Completed'
                            ? 'bg-emerald-500'
                            : project.status === 'On Hold'
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                      />
                      <span>{project.status}</span>
                    </span>

                    <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-all shadow-2xs">
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

