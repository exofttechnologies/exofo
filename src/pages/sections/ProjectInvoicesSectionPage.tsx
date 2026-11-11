import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Receipt, 
  Plus, 
  Download, 
  Trash2, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Project, ProjectInvoice } from '../../types';

export const ProjectInvoicesSectionPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // New Invoice Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [invNumber, setInvNumber] = useState('');
  const [invTitle, setInvTitle] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invDate, setInvDate] = useState('');
  const [invDueDate, setInvDueDate] = useState('');
  const [invStatus, setInvStatus] = useState<ProjectInvoice['paymentStatus']>('Pending');

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

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !invNumber.trim() || !invAmount.trim()) return;

    await projectService.addInvoice(project.id, {
      invoiceNumber: invNumber.trim(),
      title: invTitle.trim() || 'Milestone Deliverable Bill',
      amount: invAmount.startsWith('$') ? invAmount : `$${invAmount}`,
      date: invDate || new Date().toISOString().split('T')[0],
      dueDate: invDueDate || '2026-12-31',
      paymentStatus: invStatus,
      fileSize: '320 KB',
      clientName: project.client.name,
    });

    const updated = await projectService.getProjectById(project.id);
    if (updated) setProject(updated);

    setInvNumber('');
    setInvTitle('');
    setInvAmount('');
    setInvDate('');
    setInvDueDate('');
    setIsAddOpen(false);
  };

  const handleDelete = async (invId: string, num: string) => {
    if (!project) return;
    if (window.confirm(`Delete invoice ${num}?`)) {
      const updated = project.invoices.filter((i) => i.id !== invId);
      await projectService.updateProject(project.id, { invoices: updated });
      setProject({ ...project, invoices: updated });
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold">Loading invoices & bills...</div>;
  if (!project) return null;

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
          <span>Generate Invoice</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Invoices & Client Billing
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Payment statements, milestone receipts, and client balances for {project.name}.
        </p>
      </div>

      {/* Summary Financial Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="glass-surface rounded-[22px] p-4">
          <p className="text-xs font-semibold text-slate-500">Total Contract Value</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{project.budget || '$45,000'}</p>
        </div>

        <div className="glass-surface rounded-[22px] p-4">
          <p className="text-xs font-semibold text-slate-500">Billed to Date</p>
          <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">{project.spent || '$29,250'}</p>
        </div>

        <div className="glass-surface rounded-[22px] p-4 col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-slate-500">Client Contact</p>
          <p className="text-xs font-bold text-slate-800 mt-1 truncate">{project.client.name}</p>
          <p className="text-[11px] text-slate-400 font-medium truncate">{project.client.email}</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-3.5">
        {project.invoices.length === 0 ? (
          <div className="glass-surface rounded-[26px] p-10 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Invoices Issued</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click "Generate Invoice" above to create billing records.</p>
          </div>
        ) : (
          project.invoices.map((inv) => (
            <div
              key={inv.id}
              className="glass-surface stat-card-hover rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/80"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-[16px] bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100 flex-shrink-0">
                  <Receipt className="w-6 h-6 stroke-[1.8]" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {inv.invoiceNumber}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      inv.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-600'
                        : inv.paymentStatus === 'Pending'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {inv.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Issued: {inv.date} • Due: {inv.dueDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                <span className="text-lg font-black text-slate-900">{inv.amount}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Downloading PDF for invoice ${inv.invoiceNumber}...`)}
                    title="Download Invoice PDF"
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                    title="Delete Record"
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 transition-colors shadow-2xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Invoice Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-white/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFF]">
              <h3 className="font-extrabold text-slate-900 text-lg">Generate Project Invoice</h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-0085"
                  value={invNumber}
                  onChange={(e) => setInvNumber(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Milestone 3: Production Deployment"
                  value={invTitle}
                  onChange={(e) => setInvTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($ USD)</label>
                  <input
                    type="text"
                    placeholder="12,500.00"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={invStatus}
                    onChange={(e) => setInvStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
                  />
                </div>
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
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

