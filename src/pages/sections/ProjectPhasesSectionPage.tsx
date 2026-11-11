import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Workflow, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  BarChart3, 
  ListChecks,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Project, ProjectPhase } from '../../types';

export const ProjectPhasesSectionPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      setLoading(true);
      const data = await projectService.getProjectById(projectId);
      if (data) setProject(data);
      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold">Loading project phases...</div>;
  if (!project) return null;

  return (
    <div className="w-full pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Project Sections</span>
        </button>

        <button
          onClick={() => navigate(`/projects/${project.id}/phases/create`)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Phase</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center">
            <Workflow className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Project Phases & Progress
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Monitor milestone execution and phase progression for {project.name}.
        </p>
      </div>

      {/* Phases List */}
      <div className="space-y-4">
        {project.phases.length === 0 ? (
          <div className="glass-surface rounded-[26px] p-10 text-center">
            <Workflow className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Phases Defined</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click "New Phase" to structure project stages.</p>
          </div>
        ) : (
          project.phases.map((phase, index) => (
            <div
              key={phase.id}
              onClick={() => navigate(`/projects/${project.id}/phases/${phase.id}`)}
              role="button"
              tabIndex={0}
              className="group glass-surface stat-card-hover rounded-[26px] p-6 cursor-pointer select-none border border-white/80 hover:border-blue-200 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center border border-blue-100 flex-shrink-0">
                    0{index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {phase.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {phase.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    phase.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-600'
                      : phase.status === 'In Progress'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {phase.status}
                  </span>

                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5" />
                    {phase.steps.filter((s) => s.completed).length} of {phase.steps.length} Steps Completed
                  </span>
                  <span className="text-slate-900 font-bold">{phase.completionPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${phase.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

