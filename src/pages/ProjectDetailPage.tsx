import React, { useState, useEffect } from 'react';
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
import { projectService } from '../services/projectService';
import { Project } from '../types';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<{ id: string; title: string; completed: boolean; date: string }[]>([]);

  useEffect(() => {
    if (id) {
      projectService.getProjectById(id).then((p) => {
        if (p) {
          setProject(p);
          setMilestones(p.milestones || []);
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [id]);

  const toggleMilestone = (milestoneId: string) => {
    const updated = milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    setMilestones(updated);
    if (project) {
      projectService.updateProject(project.id, { milestones: updated }).catch(() => {});
    }
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

  if (loading) {
    return (
      <div className="w-full py-20 text-center text-slate-400 font-semibold text-sm">
        Loading project details from MongoDB...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Project Not Found</h2>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const completedCount = milestones.filter((m) => m.completed).length;
  const currentProgress = milestones.length > 0
    ? Math.round((completedCount / milestones.length) * 100)
    : project.progress;

  return (
    <div className="w-full pb-28">
      {/* Top Navigation Bar */}
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

      {/* Project Hero Overview Card */}
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
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="text-xs font-semibold text-slate-500">
                  {project.projectCode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {project.name}
              </h1>
            </div>
          </div>

          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
            project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
            project.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
            'bg-amber-50 text-amber-600'
          }`}>
            {project.status}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl mb-6">
          {project.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-500 font-bold">Overall Completion Progress</span>
            <span className="text-slate-900 font-extrabold">{currentProgress}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">TIMELINE</span>
            <p className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{project.startDate} — {project.expectedCompletionDate}</span>
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">CLIENT</span>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              {project.client?.company || project.client?.name || 'Internal'}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">TEAM SIZE</span>
            <p className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>{(project.assignedEmployees || []).length} Specialists</span>
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">BUDGET ALLOCATED</span>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              {project.budget || 'Custom SOW'}
            </p>
          </div>
        </div>
      </div>

      {/* Sections Hub Redirection Action */}
      <div className="glass-surface rounded-[24px] p-6 mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Open Full Project Management Hub</h3>
          <p className="text-xs text-blue-100 mt-1">
            Access dedicated sections for SRS Features, Assignees, Work Phases, Invoices, Documents, and Credentials.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors flex-shrink-0"
        >
          Open Sections Hub
        </button>
      </div>
    </div>
  );
};
