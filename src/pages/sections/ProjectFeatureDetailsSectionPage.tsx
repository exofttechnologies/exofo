import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  CheckCircle2, 
  Clock, 
  Download, 
  Trash2,
  Check
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Project, ProjectFeature } from '../../types';

export const ProjectFeatureDetailsSectionPage: React.FC = () => {
  const { projectId, featureId } = useParams<{ projectId: string; featureId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [feature, setFeature] = useState<ProjectFeature | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Editable Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectFeature['status']>('Planned');
  const [priority, setPriority] = useState<ProjectFeature['priority']>('High');
  const [requirementsText, setRequirementsText] = useState('');
  const [srsDocName, setSrsDocName] = useState('');

  useEffect(() => {
    async function load() {
      if (!projectId || !featureId) return;
      setLoading(true);
      const data = await projectService.getProjectById(projectId);
      if (data) {
        setProject(data);
        const f = data.features.find((item) => item.id === featureId);
        if (f) {
          setFeature(f);
          setName(f.name);
          setDescription(f.description);
          setStatus(f.status);
          setPriority(f.priority);
          setRequirementsText(f.requirements.join('\n'));
          setSrsDocName(f.srsDocName || '');
        }
      }
      setLoading(false);
    }
    load();
  }, [projectId, featureId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !feature) return;
    setSaving(true);

    const updatedRequirements = requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const updatedFeatures = project.features.map((item) => {
      if (item.id === feature.id) {
        return {
          ...item,
          name,
          description,
          status,
          priority,
          requirements: updatedRequirements,
          srsDocName: srsDocName.trim() || undefined,
          lastUpdated: 'Just now',
        };
      }
      return item;
    });

    await projectService.updateProject(project.id, { features: updatedFeatures });
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold">Loading feature specifications...</div>;
  if (!project || !feature) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 mb-4">Feature not found.</p>
        <button onClick={() => navigate(`/projects/${projectId}/features`)} className="text-blue-600 font-bold">
          Return to Features
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-28">
      {/* Back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/projects/${project.id}/features`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Features List</span>
        </button>

        <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
          Project: {project.name}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Feature Details & Specifications
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          View, edit, and track status for feature "{feature.name}".
        </p>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Feature specifications updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Specs Card */}
        <div className="glass-surface rounded-[26px] p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Feature Information</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Feature Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description & Scope</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="Planned">Planned</option>
                <option value="In Development">In Development</option>
                <option value="Testing">Testing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Related SRS Document</label>
              <input
                type="text"
                value={srsDocName}
                onChange={(e) => setSrsDocName(e.target.value)}
                placeholder="e.g. SRS-Spec-v2.pdf"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Requirements Card */}
        <div className="glass-surface rounded-[26px] p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Functional Acceptance Criteria & Requirements</h3>
          <p className="text-xs text-slate-500">Edit individual acceptance lines (separated by newline):</p>
          <textarea
            rows={5}
            value={requirementsText}
            onChange={(e) => setRequirementsText(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-mono"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/projects/${project.id}/features`)}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Feature Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

