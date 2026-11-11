import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Power, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Briefcase, 
  Folder, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Employee, Project, Task } from '../../types';
import { employeeService, EmployeeAssignmentsData } from '../../services/employeeService';

export const EmployeeDetailPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const [assignmentsData, setAssignmentsData] = useState<EmployeeAssignmentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Toggle Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getEmployeeAssignments(employeeId);
      setAssignmentsData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = async () => {
    if (!assignmentsData) return;
    try {
      setIsTogglingStatus(true);
      const updated = await employeeService.toggleAccountStatus(assignmentsData.employee.id);
      setAssignmentsData({
        ...assignmentsData,
        employee: updated,
      });
      setIsConfirmModalOpen(false);
      showToast(`Account status updated to ${updated.accountStatus}`);
    } catch (err: any) {
      alert(`Error updating account status: ${err.message}`);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full pb-32 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-10 w-36 bg-white/70 rounded-full" />
        <div className="h-44 bg-white/70 rounded-[28px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-48 bg-white/70 rounded-[24px]" />
          <div className="h-48 bg-white/70 rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (error || !assignmentsData) {
    return (
      <div className="w-full pb-32 pt-8 text-center max-w-md mx-auto">
        <div className="glass-surface rounded-[28px] p-8 border border-white/80">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-800">Employee Not Found</h2>
          <p className="text-xs text-slate-500 mb-4">{error || 'Could not find employee record.'}</p>
          <button
            onClick={() => navigate('/employees')}
            className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs"
          >
            Return to Employee Listing
          </button>
        </div>
      </div>
    );
  }

  const { employee, assignedProjects, assignedTasks } = assignmentsData;
  const pendingTasks = assignedTasks.filter((t) => t.status === 'Pending').length;
  const inProgressTasks = assignedTasks.filter((t) => t.status === 'In Progress').length;
  const completedTasks = assignedTasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="w-full pb-32 max-w-4xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-900 text-white shadow-xl font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Employees</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/employees/${employee.employeeId}/assignments`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:text-blue-600 font-bold text-xs shadow-2xs transition-all active:scale-95"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>View Assignments</span>
          </button>

          <button
            onClick={() => navigate(`/employees/${employee.employeeId}/edit`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs shadow-2xs hover:bg-blue-100 transition-all active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Employee</span>
          </button>

          <button
            onClick={() => setIsConfirmModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs transition-all active:scale-95 border ${
              employee.accountStatus === 'Active'
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{employee.accountStatus === 'Active' ? 'Deactivate' : 'Activate'}</span>
          </button>
        </div>
      </div>

      {/* Hero Employee Profile Banner */}
      <div className="glass-surface rounded-[32px] p-6 sm:p-8 border border-white/80 shadow-glass">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center font-black text-2xl shadow-md ring-4 ring-white flex-shrink-0">
            {employee.initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-100">
                {employee.employeeId}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border ${
                employee.accountStatus === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${employee.accountStatus === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span>{employee.accountStatus} Account</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {employee.name}
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">
              {employee.designation} • <span className="text-blue-600 font-bold">{employee.department}</span>
            </p>

            {/* Joining Date & Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-center sm:justify-start gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{employee.phone}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Joined {new Date(employee.joiningDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Project Allocation & Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Assigned Projects Card */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-6 border border-white/80 shadow-glass space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-600" />
              <span>Assigned Projects ({assignedProjects.length})</span>
            </h2>
            <button
              onClick={() => navigate(`/employees/${employee.employeeId}/assignments`)}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          {assignedProjects.length > 0 ? (
            <div className="space-y-2.5">
              {assignedProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  className="p-3.5 rounded-2xl bg-white/90 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {proj.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {proj.projectCode} • {proj.status}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
              Not currently allocated to any project.
            </div>
          )}
        </div>

        {/* Current Task Summary Card */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-6 border border-white/80 shadow-glass space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Current Task Summary</span>
            </h2>
            <button
              onClick={() => navigate(`/employees/${employee.employeeId}/assignments`)}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              Task Details
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-white border border-slate-100">
              <span className="text-lg font-extrabold text-slate-900 block">{assignedTasks.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Tasks</span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-lg font-extrabold text-blue-700 block">{inProgressTasks}</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase">In Progress</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-lg font-extrabold text-slate-700 block">{pendingTasks}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Pending</span>
            </div>
          </div>

          {/* Latest assigned tasks */}
          {assignedTasks.length > 0 ? (
            <div className="space-y-2">
              {assignedTasks.slice(0, 2).map((t) => (
                <div
                  key={t.id || t.taskId}
                  onClick={() => navigate(`/tasks/${t.taskId}`)}
                  className="p-3 rounded-xl bg-white/80 border border-slate-100 text-xs flex items-center justify-between cursor-pointer hover:border-blue-200 transition-colors"
                >
                  <span className="font-bold text-slate-800 truncate pr-2">{t.taskName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 flex-shrink-0">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
              No tasks currently assigned.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Account Activation / Deactivation */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-white/80">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {employee.accountStatus === 'Active' ? 'Deactivate Account?' : 'Activate Account?'}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {employee.accountStatus === 'Active'
                ? `Deactivating ${employee.name}'s account will suspend their system login access immediately.`
                : `Activating ${employee.name}'s account will grant them full access according to their role.`}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isTogglingStatus}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={isTogglingStatus}
                className={`px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-sm transition-all ${
                  employee.accountStatus === 'Active'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isTogglingStatus
                  ? 'Updating...'
                  : employee.accountStatus === 'Active'
                  ? 'Confirm Deactivation'
                  : 'Confirm Activation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

