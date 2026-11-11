import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Share2, 
  Monitor, 
  GraduationCap, 
  Smartphone, 
  Database, 
  Layout, 
  BarChart3,
  ShieldCheck,
  CircleDot
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { currentProjects } from '../data/mockData';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const project = currentProjects.find((p) => p.id === id) || currentProjects[0];

  // Local state for interactive milestones
  const [milestones, setMilestones] = useState<{ id: string; title: string; completed: boolean; date: string }[]>(
    project.milestones || []
  );

  const toggleMilestone = (milestoneId: string) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      )
    );
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Monitor':
        return <Monitor className="w-8 h-8 text-white stroke-[2]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-8 h-8 text-white stroke-[2]" />;
      case 'Smartphone':
        return <Smartphone className="w-8 h-8 text-white stroke-[2]" />;
      case 'Database':
        return <Database className="w-8 h-8 text-white stroke-[2]" />;
      case 'Layout':
      default:
        return <Layout className="w-8 h-8 text-white stroke-[2]" />;
    }
  };

  const completedCount = milestones.filter((m) => m.completed).length;
  const currentProgress = milestones.length > 0
    ? Math.round((completedCount / milestones.length) * 100)
    : project.progress;

  return (
    <div className="w-full pb-28">
      {/* ------------------------------------------------------------------
          Top Navigation Bar & Breadcrumb
          ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert(`Project link copied to clipboard!`)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-2xs transition-colors"
            title="Share Project"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          Project Hero Overview Card
          ------------------------------------------------------------------ */}
      <div className="glass-surface rounded-[32px] p-6 sm:p-8 mb-8 border border-white/80 shadow-glass">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-[#1261E8] to-[#0645B5] flex items-center justify-center flex-shrink-0 shadow-blue-glow">
              {renderIcon(project.iconName)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">
                  {project.category || 'Enterprise Application'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-400">ID: {project.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {project.name}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {project.description}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xs ${
            project.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : project.status === 'On Hold'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-[#EBF3FF] text-[#1261E8] border border-[#DCEBFF]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              project.status === 'Completed'
                ? 'bg-emerald-600'
                : project.status === 'On Hold'
                ? 'bg-amber-500'
                : 'bg-[#1261E8]'
            }`} />
            <span>{project.status}</span>
          </span>
        </div>

        {/* Progress Bar & Metric */}
        <div className="bg-[#F8FAFF] rounded-[24px] p-5 border border-[#E6EFFD]">
          <div className="flex items-center justify-between text-sm font-bold mb-2">
            <span className="text-slate-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Delivery Progress
            </span>
            <span className="text-blue-600 text-base">{currentProgress}%</span>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className="h-full bg-[#1261E8] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          Metrics Row: Timeline, Budget, Team, Priority
          ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="glass-surface rounded-[22px] p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold">Timeline</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900">{project.timeline || 'Q4 2026'}</p>
        </div>

        <div className="glass-surface rounded-[22px] p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold">Budget (Spent)</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900">
            {project.spent || '$25,000'} / <span className="text-slate-400 text-xs">{project.budget || '$50,000'}</span>
          </p>
        </div>

        <div className="glass-surface rounded-[22px] p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold">Team Size</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900">{project.teamSize || 6} Engineers</p>
        </div>

        <div className="glass-surface rounded-[22px] p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold">Compliance</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900">SOC-2 Verified</p>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          Two Columns: Milestones Checklist & Team Directory
          ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: Interactive Milestones (7 cols) */}
        <div className="lg:col-span-7 glass-surface rounded-[28px] p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Milestones & Roadmap</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click to toggle milestone completion status</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {completedCount} of {milestones.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => toggleMilestone(m.id)}
                role="button"
                tabIndex={0}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  m.completed
                    ? 'bg-emerald-50/50 border-emerald-100/80 text-emerald-950'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="mt-0.5">
                  {m.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <CircleDot className="w-5 h-5 text-slate-300 hover:text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm font-semibold leading-tight ${
                    m.completed ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}>
                    {m.title}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Target: {m.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Assigned Team Directory (5 cols) */}
        <div className="lg:col-span-5 glass-surface rounded-[28px] p-6 sm:p-7">
          <h3 className="text-base font-bold text-slate-900 mb-1">Project Squad</h3>
          <p className="text-xs text-slate-500 mb-4">Core contributors assigned to this initiative</p>

          <div className="space-y-3">
            {project.assignedEmployees?.map((member, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                    {member.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{member.name}</h4>
                    <p className="text-[11px] font-medium text-slate-500">{member.projectRole}</p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
