import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Archive, 
  Calendar, 
  Folder, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Layers, 
  FileText, 
  Receipt, 
  CheckCircle2, 
  Lock, 
  AlertCircle,
  Download
} from 'lucide-react';
import { Project } from '../../types';
import { projectHistoryService } from '../../services/projectHistoryService';

export const HistoricalProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      if (!projectId) return;
      try {
        setLoading(true);
        const data = await projectHistoryService.getHistoricalProjectById(projectId);
        if (!data) {
          setError(`Historical project "${projectId}" not found.`);
        } else {
          setProject(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load historical record.');
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="w-full pb-32 max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-10 w-40 bg-white/70 rounded-full" />
        <div className="h-44 bg-white/70 rounded-[28px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-56 bg-white/70 rounded-[26px]" />
          <div className="h-56 bg-white/70 rounded-[26px]" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-full pb-32 pt-8 text-center max-w-md mx-auto">
        <div className="glass-surface rounded-[28px] p-8 border border-white/80">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-800">Historical Record Not Found</h2>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/project-history')}
            className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs"
          >
            Return to Project History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-32 max-w-5xl mx-auto space-y-6">
      {/* Header & Back Action */}
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/project-history')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Project History</span>
          </button>

          {/* Read-only Lock Indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Read-Only Historical Record</span>
          </div>
        </div>

        {/* Project Meta Banner Card */}
        <div className="glass-surface rounded-[32px] p-6 sm:p-8 border border-white/80 shadow-glass">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-800 font-extrabold text-xs border border-slate-200">
                  {project.projectCode}
                </span>
                <span className="text-xs font-semibold text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  {project.category || 'Historical Initiative'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {project.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed max-w-2xl">
                {project.description}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border shadow-2xs ${
                  project.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    project.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}
                />
                <span>{project.status}</span>
              </span>

              <div className="text-[11px] font-semibold text-slate-400 text-right">
                100% Progress • Closed
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grid: Overview & Client Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Timeline & Budget Overview */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-6 border border-white/80 shadow-glass space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Timeline & Final Accounting</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Start Date</span>
              <span className="font-extrabold text-slate-800 text-sm">{project.startDate || '2025-01-01'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Final Completion</span>
              <span className="font-extrabold text-emerald-700 text-sm">{project.expectedCompletionDate || 'Completed'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Budget</span>
              <span className="font-extrabold text-slate-800 text-sm">{project.budget || '$50,000'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Final Spent</span>
              <span className="font-extrabold text-slate-800 text-sm">{project.spent || '$48,500'}</span>
            </div>
          </div>
        </div>

        {/* Client & Sponsor Info */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-6 border border-white/80 shadow-glass space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Client & Sponsor Information</span>
          </h2>

          <div className="p-4 rounded-2xl bg-white/90 border border-slate-100 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">{project.client.name}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px]">
                {project.client.company || 'Enterprise'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{project.client.email}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{project.client.phone}</span>
            </div>

            {project.client.address && (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{project.client.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assigned Employees Roster */}
      <section className="glass-surface rounded-[28px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Assigned Team Roster ({project.assignedEmployees.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Historic Contributors</span>
        </div>

        {project.assignedEmployees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {project.assignedEmployees.map((emp) => (
              <div
                key={emp.id}
                className="p-3.5 rounded-2xl bg-white/90 border border-slate-100 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {emp.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{emp.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{emp.designation}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No assigned employees recorded.</p>
        )}
      </section>

      {/* Completed Features */}
      {project.features && project.features.length > 0 && (
        <section className="glass-surface rounded-[28px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Delivered Features ({project.features.length})</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
              100% Signed Off
            </span>
          </div>

          <div className="space-y-3">
            {project.features.map((feat) => (
              <div
                key={feat.id}
                className="p-4 rounded-2xl bg-white/90 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">{feat.name}</h3>
                  <p className="text-slate-500">{feat.description}</p>
                  {feat.srsDocName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-1">
                      <FileText className="w-3 h-3" />
                      <span>{feat.srsDocName}</span>
                    </span>
                  )}
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 self-start sm:self-center flex-shrink-0">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Project Documents & Invoices Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Documents */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-6 border border-white/80 shadow-glass space-y-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Archived Documents ({project.documents.length})</span>
          </h2>

          {project.documents.length > 0 ? (
            <div className="space-y-2">
              {project.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-2xl bg-white/90 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="truncate">
                    <p className="font-bold text-slate-800 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-400">{doc.category} • {doc.size}</p>
                  </div>
                  <button
                    onClick={() => alert(`Downloading archived copy of ${doc.name}`)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-600"
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No archived documents.</p>
          )}
        </div>

        {/* Invoices */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-6 border border-white/80 shadow-glass space-y-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-600" />
            <span>Settled Invoices & Billing ({project.invoices.length})</span>
          </h2>

          {project.invoices.length > 0 ? (
            <div className="space-y-2">
              {project.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-2xl bg-white/90 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="truncate">
                    <p className="font-bold text-slate-800 truncate">{inv.invoiceNumber} - {inv.title}</p>
                    <p className="text-[10px] text-slate-400">Paid on {inv.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-extrabold text-slate-900 block">{inv.amount}</span>
                    <span className="text-[10px] font-bold text-emerald-600">Settled (Paid)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No historical invoices recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

