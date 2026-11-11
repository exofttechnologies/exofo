import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Workflow, 
  CheckCircle2, 
  CircleDot, 
  Plus, 
  User, 
  Calendar, 
  FileText, 
  X 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Project, ProjectPhase, PhaseStep } from '../../types';

export const ProjectPhaseDetailsSectionPage: React.FC = () => {
  const { projectId, phaseId } = useParams<{ projectId: string; phaseId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [phase, setPhase] = useState<ProjectPhase | null>(null);
  const [loading, setLoading] = useState(true);

  // New Step Modal
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [stepTitle, setStepTitle] = useState('');
  const [stepAssignedTo, setStepAssignedTo] = useState('');
  const [stepDueDate, setStepDueDate] = useState('');
  const [stepNotes, setStepNotes] = useState('');

  useEffect(() => {
    async function load() {
      if (!projectId || !phaseId) return;
      setLoading(true);
      const data = await projectService.getProjectById(projectId);
      if (data) {
        setProject(data);
        const p = data.phases.find((item) => item.id === phaseId);
        if (p) setPhase(p);
      }
      setLoading(false);
    }
    load();
  }, [projectId, phaseId]);

  const toggleStep = async (stepId: string) => {
    if (!project || !phase) return;

    const updatedSteps = phase.steps.map((s) => {
      if (s.id === stepId) {
        const nextCompleted = !s.completed;
        return {
          ...s,
          completed: nextCompleted,
          status: nextCompleted ? ('Completed' as const) : ('In Progress' as const),
        };
      }
      return s;
    });

    const completedCount = updatedSteps.filter((s) => s.completed).length;
    const completionPercentage = Math.round((completedCount / updatedSteps.length) * 100);
    const phaseStatus = completionPercentage === 100 ? 'Completed' : 'In Progress';

    const updatedPhases = project.phases.map((p) => {
      if (p.id === phase.id) {
        return {
          ...p,
          steps: updatedSteps,
          completionPercentage,
          status: phaseStatus as any,
        };
      }
      return p;
    });

    await projectService.updateProject(project.id, { phases: updatedPhases });
    setPhase({
      ...phase,
      steps: updatedSteps,
      completionPercentage,
      status: phaseStatus as any,
    });
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !phase || !stepTitle.trim()) return;

    const newStep: PhaseStep = {
      id: `step-${Date.now()}`,
      title: stepTitle.trim(),
      assignedTo: stepAssignedTo || undefined,
      dueDate: stepDueDate || undefined,
      notes: stepNotes.trim() || undefined,
      completed: false,
      status: 'Pending',
    };

    const updatedSteps = [...phase.steps, newStep];
    const completedCount = updatedSteps.filter((s) => s.completed).length;
    const completionPercentage = Math.round((completedCount / updatedSteps.length) * 100);

    const updatedPhases = project.phases.map((p) => {
      if (p.id === phase.id) {
        return {
          ...p,
          steps: updatedSteps,
          completionPercentage,
        };
      }
      return p;
    });

    await projectService.updateProject(project.id, { phases: updatedPhases });
    setPhase({
      ...phase,
      steps: updatedSteps,
      completionPercentage,
    });

    setStepTitle('');
    setStepAssignedTo('');
    setStepDueDate('');
    setStepNotes('');
    setIsAddStepOpen(false);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold">Loading phase steps...</div>;
  if (!project || !phase) return null;

  return (
    <div className="w-full pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/projects/${project.id}/phases`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Project Phases</span>
        </button>

        <button
          onClick={() => setIsAddStepOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Step</span>
        </button>
      </div>

      {/* Phase Banner */}
      <div className="glass-surface rounded-[26px] p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {project.name}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
              {phase.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{phase.description}</p>
          </div>

          <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full self-start sm:self-center ${
            phase.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-blue-50 text-blue-600'
          }`}>
            {phase.status} ({phase.completionPercentage}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-700"
            style={{ width: `${phase.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 px-1 mb-2">
          Milestone Steps & Deliverables ({phase.steps.length})
        </h3>

        {phase.steps.length === 0 ? (
          <div className="glass-surface rounded-[24px] p-8 text-center text-slate-400 text-xs">
            No steps recorded yet. Click "Add Step" above.
          </div>
        ) : (
          phase.steps.map((step) => (
            <div
              key={step.id}
              onClick={() => toggleStep(step.id)}
              role="button"
              tabIndex={0}
              className={`glass-surface stat-card-hover rounded-[22px] p-4.5 cursor-pointer select-none flex items-start gap-3.5 border transition-all ${
                step.completed ? 'opacity-70 bg-white/60' : 'bg-white border-white/80'
              }`}
            >
              <div className="mt-0.5">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <CircleDot className="w-5 h-5 text-slate-300 hover:text-blue-600 flex-shrink-0" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`text-sm font-bold leading-tight ${
                    step.completed ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}>
                    {step.title}
                  </h4>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    step.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {step.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  {step.assignedTo && (
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      {step.assignedTo}
                    </span>
                  )}
                  {step.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Due {step.dueDate}
                    </span>
                  )}
                </div>

                {step.notes && (
                  <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {step.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Step Modal */}
      {isAddStepOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-white/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFF]">
              <h3 className="font-extrabold text-slate-900 text-lg">Add Phase Step</h3>
              <button 
                onClick={() => setIsAddStepOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStep} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Step Title</label>
                <input
                  type="text"
                  placeholder="e.g. Implement webhook retry logic"
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign to Employee</label>
                <select
                  value={stepAssignedTo}
                  onChange={(e) => setStepAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="">-- Select Team Member --</option>
                  {project.assignedEmployees.map((emp) => (
                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.projectRole})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Due Date</label>
                <input
                  type="text"
                  placeholder="e.g. Dec 10, 2026"
                  value={stepDueDate}
                  onChange={(e) => setStepDueDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or requirements..."
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddStepOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm"
                >
                  Add Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

