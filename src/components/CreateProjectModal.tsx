import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Folder, 
  Building, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Layers
} from 'lucide-react';
import { Project } from '../types';
import { currentProjects } from '../data/mockData';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProject: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [name, setName] = useState('');
  const [projectCode, setProjectCode] = useState(`PRJ00${currentProjects.length + 1}`);
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Project Name is required.');
      return;
    }
    if (!clientName.trim()) {
      setError('Client Name is required.');
      return;
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      projectCode: projectCode.trim() || `PRJ00${currentProjects.length + 1}`,
      name: name.trim(),
      description: description.trim() || 'Custom enterprise solution architecture.',
      category: category,
      status: status,
      priority: priority,
      progress: 0,
      iconName: 'Layout',
      startDate: startDate,
      expectedCompletionDate: expectedCompletionDate,
      budget: '$50,000',
      spent: '$0',
      client: {
        name: clientName.trim(),
        email: clientEmail.trim() || 'client@enterprise.com',
        phone: '+1 (555) 123-4567',
        address: 'Enterprise Headquarters',
        company: clientCompany.trim() || 'Client Partner LLC',
      },
      assignedEmployees: [],
      features: [],
      phases: [],
      documents: [],
      credentials: [],
      invoices: [],
    };

    // Save to currentProjects array and localStorage
    currentProjects.unshift(newProject);
    try {
      localStorage.setItem('exofo_projects', JSON.stringify(currentProjects));
    } catch (err) {
      console.error('Failed to cache project in localStorage:', err);
    }

    onProjectCreated(newProject);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-[28px] shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Create New Project"
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-[#F8FAFF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0645B5] to-[#1261E8] text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Create New Project
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Set up a new initiative, assign client, and initialize management hub.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all active:scale-95 shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto no-scrollbar">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Name & Project Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Orion Analytics Suite"
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Code
              </label>
              <input
                type="text"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                placeholder="PRJ007"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Project Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of project deliverables and goals..."
              className="w-full px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              >
                <option value="Web Application">Web Application</option>
                <option value="Mobile App">Mobile Application</option>
                <option value="E-commerce Platform">E-commerce Platform</option>
                <option value="Enterprise ERP">Enterprise ERP</option>
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                <option value="AI / ML Platform">AI / ML Platform</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3">
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span>Client Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Client Contact <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="john@partner.com"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="Apex Global Ltd"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Start & End Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-800 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expected Completion
              </label>
              <input
                type="date"
                value={expectedCompletionDate}
                onChange={(e) => setExpectedCompletionDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-800 shadow-2xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#1261E8] to-[#0645B5] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

