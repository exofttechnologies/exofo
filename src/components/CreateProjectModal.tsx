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
import { projectService } from '../services/projectService';

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
      const created = await projectService.createProject(newProject);
      onProjectCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-[28px] shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Folder className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">New Project</h3>
              <p className="text-[11px] text-slate-500">Initialize a dedicated project workspace</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile Application Architecture"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Web Application">Web Application</option>
                <option value="Mobile Application">Mobile Application</option>
                <option value="Desktop Application">Desktop Application</option>
                <option value="SaaS Platform">SaaS Platform</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Client Name *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. ACME Global"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
