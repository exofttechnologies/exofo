import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ListChecks, 
  CheckCircle2, 
  CircleDot, 
  Calendar, 
  Plus, 
  Clock, 
  X 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Project } from '../../types';

export const ProjectMilestonesSectionPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Local milestones state
  const [milestones, setMilestones] = useState<{ id: string; title: string; completed: boolean; date: string }[]>([]);

  // New Milestone Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      setLoading(true);
      const data = await projectService.getProjectById(projectId);
      if (data) {
        setProject(data);
        // Synthesize milestones from phases steps if not present
        const steps = data.phases.flatMap((p) =>
          p.steps.map((s) => ({
            id: s.id,
            title: s.title,
            completed: s.completed,
            date: s.dueDate || 'Target Sprint',
          }))
        );
        setMilestones(steps.length > 0 ? steps : [
          { id: 'm-1', title: 'System Architecture & Database Schema Approval', completed: true, date: 'Nov 05, 2026' },
          { id: 'm-2', title: 'Payment Integration & Webhooks Testing', completed: false, date: 'Nov 20, 2026' },
          { id: 'm-3', title: 'End-to-End Stress Testing & User Acceptance Signoff', completed: false, date: 'Dec 15, 2026' },
          { id: 'm-4', title: 'Production Cloud Deployment & Domain Cutover', completed: false, date: 'Jan 10, 2027' },
        ]);
      }
      setLoading(false);
    }
    load();
  }, [projectId]);

  const toggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setMilestones((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        title: title.trim(),
        completed: false,
        date: date.trim() || 'Next Sprint',
      },
    ]);

    setTitle('');
    setDate('');
    setIsAddOpen(false);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold">Loading roadmap...</div>;
  if (!project) return null;

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = milestones.length > 0
    ? Math.round((completedCount / milestones.length) * 100)
    : 0;

  return (
    <div className="w-full pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Project Sections</span>
        </button>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Milestone</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center">
            <ListChecks className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Milestones & Delivery Roadmap
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Target deliverable deadlines and sprint checkpoints for {project.name}.
        </p>
      </div>

      {/* Progress Metric Card */}
      <div className="glass-surface rounded-[26px] p-6 mb-6">
        <div className="flex items-center justify-between text-sm font-bold mb-2">
          <span className="text-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            Milestones Completed ({completedCount} of {milestones.length})
          </span>
          <span className="text-blue-600 text-base">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Milestones Checklist */}
      <div className="space-y-3">
        {milestones.map((m) => (
          <div
            key={m.id}
            onClick={() => toggleMilestone(m.id)}
            role="button"
            tabIndex={0}
            className={`glass-surface stat-card-hover rounded-[22px] p-4.5 cursor-pointer select-none flex items-start gap-3.5 border transition-all ${
              m.completed ? 'opacity-70 bg-white/60' : 'bg-white border-white/80'
            }`}
          >
            <div className="mt-0.5">
              {m.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <CircleDot className="w-5 h-5 text-slate-300 hover:text-blue-600 flex-shrink-0" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className={`text-sm font-bold leading-tight ${
                  m.completed ? 'line-through text-slate-400' : 'text-slate-900'
                }`}>
                  {m.title}
                </h4>
                <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                  m.completed ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  <Clock className="w-3 h-3" />
                  {m.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-white/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFF]">
              <h3 className="font-extrabold text-slate-900 text-lg">Add Roadmap Milestone</h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Milestone Title</label>
                <input
                  type="text"
                  placeholder="e.g. Beta User Acceptance Testing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                <input
                  type="text"
                  placeholder="e.g. Jan 15, 2027"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

