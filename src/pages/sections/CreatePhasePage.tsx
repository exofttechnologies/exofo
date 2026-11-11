import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Workflow,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Project, ProjectPhase } from '../../types';

export const CreatePhasePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const [phaseName, setPhaseName] = useState('');
  const [phaseDesc, setPhaseDesc] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    if (!phaseName.trim()) {
      setNameError('Phase Title is required.');
      return;
    }
    setNameError(null);
    setIsSubmitting(true);

    const newPhase: ProjectPhase = {
      id: `phase-${Date.now()}`,
      name: phaseName.trim(),
      description: phaseDesc.trim() || 'Phase description and deliverables.',
      order: project.phases.length + 1,
      completionPercentage: 0,
      status: 'Not Started',
      steps: [],
    };

    const updatedPhases = [...project.phases, newPhase];
    await projectService.updateProject(project.id, { phases: updatedPhases });

    setSuccessToast(`Phase "${phaseName.trim()}" created successfully!`);
    setTimeout(() => {
      navigate(`/projects/${project.id}/phases`);
    }, 900);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold">Loading project...</div>;
  if (!project) return null;

  return (
    <div className="w-full pb-28 max-w-2xl mx-auto">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/projects/${project.id}/phases`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Phases</span>
        </button>
      </div>

      {/* Page Title */}
      <div className="mb-7">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center">
            <Workflow className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Project Phase
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Add a new phase to structure progress for <span className="font-bold text-slate-700">{project.name}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Phase Info Card ── */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Workflow className="w-4 h-4 text-blue-600" />
            <span>Phase Information</span>
          </h3>

          {/* Phase Number Badge */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white font-black text-sm flex items-center justify-center flex-shrink-0">
              {String(project.phases.length + 1).padStart(2, '0')}
            </div>
            <div>
              <p className="text-xs font-bold text-blue-700">Phase {project.phases.length + 1}</p>
              <p className="text-[11px] text-blue-500">Will be added after existing {project.phases.length} phase(s)</p>
            </div>
          </div>

          {/* Phase Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Phase Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={phaseName}
              onChange={(e) => { setPhaseName(e.target.value); if (nameError) setNameError(null); }}
              placeholder="e.g. Phase 4: Staging Deployment & Beta"
              className={`w-full px-4 py-3 rounded-2xl bg-white border text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 transition-all ${
                nameError ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200/90 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {nameError && (
              <p className="mt-1.5 text-xs text-rose-500 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{nameError}</span>
              </p>
            )}
          </div>

          {/* Phase Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Phase Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={4}
              value={phaseDesc}
              onChange={(e) => setPhaseDesc(e.target.value)}
              placeholder="Summarize the objectives, key deliverables, and success criteria for this phase..."
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
            />
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/projects/${project.id}/phases`)}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#1261E8] to-[#0645B5] hover:opacity-95 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? 'Creating...' : 'Create Phase'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

