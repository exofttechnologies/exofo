import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Folder,
  User,
  UserCheck,
  TrendingUp,
  History,
  FileText,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ListChecks,
} from 'lucide-react';
import { taskService } from '../../services/taskService';
import { EmployeeHeader } from '../../components/employee/EmployeeHeader';
import { EmployeeBottomNavigation } from '../../components/employee/EmployeeBottomNavigation';
import { NotificationsModal } from '../../components/NotificationsModal';
import { TaskStatusBadge } from '../../components/tasks/TaskStatusBadge';
import { TaskPriorityBadge } from '../../components/tasks/TaskPriorityBadge';
import { TaskProgressBar } from '../../components/tasks/TaskProgressBar';
import { TaskActivityTimeline } from '../../components/tasks/TaskActivityTimeline';
import { Employee, Project, Task } from '../../types';

export const EmployeeTaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [relatedProject, setRelatedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const loadTaskDetails = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      setError(null);
      const activeIdentifier =
        localStorage.getItem('exofo_employee_id') ||
        localStorage.getItem('exofo_user_email') ||
        'emp-ahmed';

      const res = await taskService.getEmployeeTaskById(activeIdentifier, taskId);
      setEmployee(res.employee);
      setTask(res.task);
      setRelatedProject(res.relatedProject);
    } catch (err: any) {
      setError(err.message || 'Unable to load task details.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTaskDetails();
  }, [loadTaskDetails]);

  const formatDate = (iso?: string) => {
    if (!iso) return 'Not specified';
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return iso;
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const overdue = task ? taskService.isOverdue(task.dueDate, task.status) : false;

  return (
    <div
      className="min-h-screen w-full bg-[#F7F9FC] text-slate-900 relative antialiased overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.08) 1.25px, transparent 1.25px)',
        backgroundSize: '22px 22px',
      }}
    >
      {/* Abstract Ambient Flowing Colour Textures */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute -top-32 -right-28 w-[520px] h-[520px] rounded-full bg-blue-500/10 blur-[125px]" />
        <div className="absolute top-1/3 -left-32 w-[460px] h-[460px] rounded-full bg-rose-500/8 blur-[130px]" />
        <div className="absolute bottom-12 right-1/4 w-[420px] h-[420px] rounded-full bg-slate-900/7 blur-[140px]" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Header */}
        <EmployeeHeader
          employee={employee}
          unreadCount={2}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => navigate('/employee/profile')}
        />

        {/* Back Navigation + Update Progress Button */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <button
            type="button"
            onClick={() => navigate('/employee/tasks')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/85 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to My Tasks</span>
          </button>

          {!loading && task && (
            <button
              type="button"
              onClick={() => navigate(`/employee/tasks/${task.id || task.taskId}/update`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95"
            >
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
              <span>Update Progress</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-24 w-2/3 bg-slate-200/60 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 h-72 bg-white/70 rounded-[28px]" />
              <div className="lg:col-span-5 h-72 bg-white/70 rounded-[28px]" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && (error || !task) && (
          <div className="rounded-[28px] bg-white/80 backdrop-blur-xl border border-rose-200 p-8 sm:p-12 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Task Unavailable</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 mb-6">
              {error || 'The requested task could not be found.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={loadTaskDetails}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/employee/tasks')}
                className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold"
              >
                Back to My Tasks
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && task && (
          <div className="space-y-7">
            {/* Page Title directly on dotted background */}
            <section className="select-none">
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white/90 text-blue-700 border border-blue-200/80 shadow-2xs">
                  {task.taskId}
                </span>
                <TaskStatusBadge status={task.status} size="md" />
                <TaskPriorityBadge priority={task.priority} size="md" />
                {overdue && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Overdue</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {task.taskName}
              </h1>
            </section>

            {/* Top Grid: Overview (7 cols) & Progress + Assignment (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Task Overview + Requirements */}
              <div className="lg:col-span-7 space-y-6">
                {/* A. Task Overview Folder Card */}
                <section className="relative pt-4">
                  <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                    <FileText className="w-3.5 h-3.5 text-blue-600 stroke-[2.2]" />
                    <span className="text-[11px] font-bold text-slate-800">Task Overview</span>
                  </div>

                  <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] space-y-5">
                    <div
                      className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/14 via-sky-300/5 to-transparent blur-2xl pointer-events-none"
                      aria-hidden="true"
                    />

                    <div className="relative z-10">
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2">
                        Task Summary & Schedule
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {task.description || 'No description provided for this task.'}
                      </p>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/60">
                      <div className="p-3 rounded-2xl bg-white/85 border border-slate-200/70">
                        <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>Start Date</span>
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                          {formatDate(task.startDate)}
                        </p>
                      </div>

                      <div
                        className={`p-3 rounded-2xl border ${
                          overdue
                            ? 'bg-rose-50/80 border-rose-200'
                            : 'bg-white/85 border-slate-200/70'
                        }`}
                      >
                        <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${overdue ? 'text-rose-600' : 'text-amber-600'}`} />
                          <span>Due Date</span>
                        </p>
                        <p
                          className={`text-xs sm:text-sm font-bold mt-1 ${
                            overdue ? 'text-rose-700' : 'text-slate-900'
                          }`}
                        >
                          {formatDate(task.dueDate)}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/85 border border-slate-200/70">
                        <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Created Date</span>
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                          {formatDate(task.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* C. Task Requirements & Attachments Card */}
                <section className="relative pt-4">
                  <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                    <ListChecks className="w-3.5 h-3.5 text-slate-800 stroke-[2.2]" />
                    <span className="text-[11px] font-bold text-slate-800">Requirements</span>
                  </div>

                  <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] space-y-4">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      Task Instructions & Attachments
                    </h2>

                    {task.requirements && task.requirements.length > 0 ? (
                      <ul className="space-y-2">
                        {task.requirements.map((req, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium p-3 rounded-2xl bg-white/85 border border-slate-200/70"
                          >
                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-white/85 border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
                        {task.description || 'Follow standard deliverable specifications and submit updates via Update Progress.'}
                      </div>
                    )}

                    {/* Available Attachments */}
                    <div className="pt-2 border-t border-slate-200/60">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Attachments ({task.attachments?.length || 0})</span>
                      </h3>

                      {!task.attachments || task.attachments.length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium">
                          No attachments uploaded for this task yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {task.attachments.map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center justify-between p-3 rounded-2xl bg-white/85 border border-slate-200/70"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                                  {att.fileType}
                                </div>
                                <div className="truncate">
                                  <p className="text-xs font-bold text-slate-900 truncate">{att.name}</p>
                                  <p className="text-[10px] text-slate-400">
                                    {att.size} • {att.uploadedAt}
                                    {att.uploadedBy ? ` • by ${att.uploadedBy}` : ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Task Progress & Assignment Info */}
              <div className="lg:col-span-5 space-y-6">
                {/* D. Task Progress Card */}
                <section className="relative pt-4">
                  <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600 stroke-[2.2]" />
                    <span className="text-[11px] font-bold text-slate-800">Progress Status</span>
                  </div>

                  <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] space-y-4">
                    <div
                      className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-rose-500/12 via-blue-400/5 to-transparent blur-2xl pointer-events-none"
                      aria-hidden="true"
                    />

                    <div className="relative z-10 flex items-center justify-between">
                      <h2 className="text-base font-extrabold text-slate-900">Task Progress</h2>
                      <TaskStatusBadge status={task.status} />
                    </div>

                    <div className="relative z-10">
                      <TaskProgressBar progress={task.progress} />
                    </div>

                    {task.progressNotes && (
                      <div className="relative z-10 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 leading-relaxed">
                        <span className="block text-[10px] font-extrabold text-blue-700 uppercase tracking-wider mb-1">
                          Latest Work Note
                        </span>
                        {task.progressNotes}
                      </div>
                    )}

                    <div className="relative z-10 flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-200/60">
                      <span>Last updated</span>
                      <span className="text-slate-800 font-bold">{formatDate(task.updatedAt)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/employee/tasks/${task.id || task.taskId}/update`)}
                      className="relative z-10 w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Update Progress</span>
                    </button>
                  </div>
                </section>

                {/* B. Assignment Information Card */}
                <section className="relative pt-4">
                  <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                    <UserCheck className="w-3.5 h-3.5 text-slate-800 stroke-[2.2]" />
                    <span className="text-[11px] font-bold text-slate-800">Assignment</span>
                  </div>

                  <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900">Assignment Information</h2>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/85 border border-slate-200/70">
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Assigned To</span>
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {task.assignedEmployeeName || employee?.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/85 border border-slate-200/70">
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                          <Folder className="w-3.5 h-3.5 text-slate-400" />
                          <span>Related Project</span>
                        </span>
                        {relatedProject || task.projectName ? (
                          <button
                            type="button"
                            onClick={() => {
                              const targetProjId = relatedProject?.id || task.projectId || task.projectCode;
                              if (targetProjId) {
                                navigate(`/employee/projects/${targetProjId}`);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <span>{relatedProject?.name || task.projectName}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-500">Independent Task</span>
                        )}
                      </div>

                      {task.createdBy && (
                        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/85 border border-slate-200/70">
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>Assigned By</span>
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {task.createdBy}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* E. Task Activity Timeline Card */}
            <section className="relative pt-4">
              <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                <History className="w-3.5 h-3.5 text-blue-600 stroke-[2.2]" />
                <span className="text-[11px] font-bold text-slate-800">Activity Timeline</span>
              </div>

              <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-7 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      Task Activity
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Recorded assignment, status, progress, and work update events
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    {task.activityHistory?.length || 0} Events
                  </span>
                </div>

                <TaskActivityTimeline activities={task.activityHistory} />
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Floating Bottom Navigation (Tasks Active) */}
      <EmployeeBottomNavigation />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};
