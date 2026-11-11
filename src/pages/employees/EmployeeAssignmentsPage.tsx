import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Briefcase, 
  Folder, 
  CheckCircle2, 
  Calendar, 
  ExternalLink, 
  Clock, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { employeeService, EmployeeAssignmentsData } from '../../services/employeeService';
import { TaskStatusBadge } from '../../components/tasks/TaskStatusBadge';
import { TaskPriorityBadge } from '../../components/tasks/TaskPriorityBadge';
import { TaskProgressBar } from '../../components/tasks/TaskProgressBar';

export const EmployeeAssignmentsPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<EmployeeAssignmentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssignments() {
      if (!employeeId) return;
      try {
        setLoading(true);
        const res = await employeeService.getEmployeeAssignments(employeeId);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load employee assignments.');
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="w-full pb-32 max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-10 w-36 bg-white/70 rounded-full" />
        <div className="h-32 bg-white/70 rounded-[28px]" />
        <div className="h-56 bg-white/70 rounded-[26px]" />
        <div className="h-56 bg-white/70 rounded-[26px]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full pb-32 pt-8 text-center max-w-md mx-auto">
        <div className="glass-surface rounded-[28px] p-8 border border-white/80">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-800">Employee Not Found</h2>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/employees')}
            className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  const { employee, assignedProjects, assignedTasks } = data;

  return (
    <div className="w-full pb-32 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/employees/${employee.employeeId}`)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Employee Profile</span>
          </button>

          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            {employee.employeeId}
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Workload & Assignments: {employee.name}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Active project allocations and individual task responsibilities for {employee.designation}.
          </p>
        </div>
      </header>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-surface rounded-[22px] p-4 border border-white/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Allocated Projects</span>
          <span className="text-2xl font-extrabold text-slate-900">{assignedProjects.length}</span>
        </div>
        <div className="glass-surface rounded-[22px] p-4 border border-white/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Assigned Tasks</span>
          <span className="text-2xl font-extrabold text-slate-900">{assignedTasks.length}</span>
        </div>
        <div className="glass-surface rounded-[22px] p-4 border border-white/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">In Progress Tasks</span>
          <span className="text-2xl font-extrabold text-[#1261E8]">
            {assignedTasks.filter((t) => t.status === 'In Progress').length}
          </span>
        </div>
        <div className="glass-surface rounded-[22px] p-4 border border-white/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Completed Tasks</span>
          <span className="text-2xl font-extrabold text-emerald-600">
            {assignedTasks.filter((t) => t.status === 'Completed').length}
          </span>
        </div>
      </div>

      {/* ==================================================================
          SECTION 1: ASSIGNED PROJECTS
          ================================================================== */}
      <section className="glass-surface rounded-[28px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Folder className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Assigned Projects
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Projects where {employee.name} is a contributing squad member.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
            {assignedProjects.length} Projects
          </span>
        </div>

        {assignedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {assignedProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => navigate(`/projects/${proj.id}`)}
                className="group p-5 rounded-[22px] bg-white/90 border border-slate-200/80 hover:border-blue-300 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-card-hover flex flex-col justify-between select-none"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-100">
                      {proj.projectCode}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      proj.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : proj.status === 'On Hold'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors text-base mb-1">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-slate-500">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Start Date</span>
                      <span className="font-semibold text-slate-700">{proj.startDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Deadline</span>
                      <span className="font-semibold text-slate-700">{proj.expectedCompletionDate || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-blue-600 pt-1">
                    <span>Manage Project Sections</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
            No projects currently assigned to this employee.
          </div>
        )}
      </section>

      {/* ==================================================================
          SECTION 2: ASSIGNED TASKS
          ================================================================== */}
      <section className="glass-surface rounded-[28px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Assigned Tasks
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Sprint deliverables and action items owned by {employee.name}.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
            {assignedTasks.length} Tasks
          </span>
        </div>

        {assignedTasks.length > 0 ? (
          <div className="space-y-3 pt-1">
            {assignedTasks.map((t) => (
              <div
                key={t.id || t.taskId}
                onClick={() => navigate(`/tasks/${t.taskId}`)}
                className="group p-4 sm:p-5 rounded-2xl bg-white/90 border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-100">
                      {t.taskId}
                    </span>
                    <TaskPriorityBadge priority={t.priority} size="sm" />
                    {t.projectName && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">
                        {t.projectName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                    {t.taskName}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {t.description || 'No description provided.'}
                  </p>
                </div>

                {/* Right Status & Due Date */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0">
                  <TaskStatusBadge status={t.status} size="sm" />
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
            No tasks currently assigned to this employee.
          </div>
        )}
      </section>
    </div>
  );
};

