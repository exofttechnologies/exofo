import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Folder,
  Building,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';
import { projectService } from '../../services/projectService';

const CATEGORIES = [
  'Web Application',
  'Mobile Application',
  'Desktop Application',
  'E-Commerce Platform',
  'SaaS Platform',
  'API & Backend',
  'UI/UX Design',
  'Data Analytics',
  'IoT Solution',
  'Other',
];

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [projectCode, setProjectCode] = useState('PRJ003');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Application');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('2027-03-30');
  const [status, setStatus] = useState<'In Progress' | 'On Hold' | 'Completed'>('In Progress');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    projectService.getAllProjects().then((list) => {
      const nextNum = list.length + 1;
      setProjectCode(`PRJ${String(nextNum).padStart(3, '0')}`);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Project Name is required.');
      return;
    }
    if (!clientName.trim()) {
      setError('Client Name is required.');
      return;
    }

    setIsSubmitting(true);

    const newProject: Partial<Project> = {
      projectCode: projectCode.trim(),
      name: name.trim(),
      description: description.trim() || 'Custom enterprise solution architecture.',
      category,
      status,
      priority,
      progress: 0,
      iconName: 'Layout',
      startDate,
      expectedCompletionDate,
      client: {
        name: clientName.trim(),
        email: clientEmail.trim(),
        company: clientCompany.trim(),
        phone: '+971 50 123 4567',
        address: 'Enterprise Headquarters',
      },
      assignedEmployees: [],
      features: [],
      phases: [],
      documents: [],
      credentials: [],
      invoices: [],
      milestones: [],
    };

    try {
      await projectService.createProject(newProject);
      setSuccessToast(`Project "${name}" created successfully!`);
      setTimeout(() => {
        navigate('/projects');
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to create project.');
      setIsSubmitting(false);
    }
  };

  const priorityColors: Record<string, string> = {
    High: 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20',
    Medium: 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-500/20',
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20',
  };

  return (
    <div className="w-full pb-32 max-w-4xl mx-auto">
      {successToast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Projects</span>
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Folder className="w-7 h-7 text-blue-600" />
          <span>Create New Project</span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Set up a new project space to track features, team assignments, documents, and credentials.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="glass-surface rounded-[28px] p-6 sm:p-8 space-y-5 border border-white/80">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span>Project Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise HR Management Portal"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Project Code
              </label>
              <input
                type="text"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                placeholder="e.g. PRJ003"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive project overview..."
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['High', 'Medium', 'Low'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      priority === p ? priorityColors[p] : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Client & Timeline */}
        <div className="glass-surface rounded-[28px] p-6 sm:p-8 space-y-5 border border-white/80">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            <span>Client & Timeline</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Client Contact Person <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Client Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Completion Date
              </label>
              <input
                type="date"
                value={expectedCompletionDate}
                onChange={(e) => setExpectedCompletionDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/30 hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Project...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};
