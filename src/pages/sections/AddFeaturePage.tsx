import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Layers,
  Plus,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Project } from '../../types';

export const AddFeaturePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const [featureName, setFeatureName] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');
  const [featurePriority, setFeaturePriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [featureReqs, setFeatureReqs] = useState('');
  const [srsFileName, setSrsFileName] = useState('');

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSrsFileName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    if (!featureName.trim()) {
      setNameError('Feature Name is required.');
      return;
    }
    setNameError(null);
    setIsSubmitting(true);

    const requirements = featureReqs
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    await projectService.addFeature(project.id, {
      name: featureName.trim(),
      description: featureDesc.trim(),
      requirements: requirements.length > 0 ? requirements : ['Initial scope definition pending.'],
      srsDocName: srsFileName.trim() || undefined,
      status: 'Planned',
      priority: featurePriority,
    });

    setSuccessToast(`Feature "${featureName.trim()}" added successfully!`);
    setTimeout(() => {
      navigate(`/projects/${project.id}/features`);
    }, 900);
  };

  const priorityColors: Record<string, string> = {
    High: 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20',
    Medium: 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-500/20',
    Low: 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20',
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold">Loading project...</div>;
  if (!project) return null;

  return (
    <div className="w-full pb-28 max-w-3xl mx-auto">
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
          onClick={() => navigate(`/projects/${project.id}/features`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Features</span>
        </button>
      </div>

      {/* Page Title */}
      <div className="mb-7">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Add Project Feature
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Define a new feature or functional requirement for <span className="font-bold text-slate-700">{project.name}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── 1. Feature Details Card ── */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Feature Details</span>
          </h3>

          {/* Feature Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Feature Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={featureName}
              onChange={(e) => { setFeatureName(e.target.value); if (nameError) setNameError(null); }}
              placeholder="e.g. User Authentication & Multi-Tenant Roles"
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

          {/* Feature Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Feature Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={featureDesc}
              onChange={(e) => setFeatureDesc(e.target.value)}
              placeholder="Summary of feature purpose and business value..."
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Priority</label>
            <div className="flex gap-2">
              {(['High', 'Medium', 'Low'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFeaturePriority(p)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    featurePriority === p
                      ? priorityColors[p]
                      : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 2. Requirements Card ── */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Requirements & SRS Document</span>
          </h3>

          {/* Requirements */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Requirements <span className="text-slate-400 font-normal">(one per line, Optional)</span>
            </label>
            <textarea
              rows={5}
              value={featureReqs}
              onChange={(e) => setFeatureReqs(e.target.value)}
              placeholder={`Requirement 1\nRequirement 2\nRequirement 3`}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
            />
          </div>

          {/* SRS Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Upload SRS Document <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-5 rounded-2xl bg-white border-2 border-dashed border-slate-200 hover:border-blue-400 text-center cursor-pointer transition-all group"
            >
              <Upload className="w-6 h-6 text-slate-300 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
              {srsFileName ? (
                <p className="text-xs font-bold text-blue-600">{srsFileName}</p>
              ) : (
                <>
                  <p className="text-xs font-semibold text-slate-500">Click to upload SRS document</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PDF, DOCX, XLSX supported</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/projects/${project.id}/features`)}
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
            <span>{isSubmitting ? 'Saving...' : 'Save Feature'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

