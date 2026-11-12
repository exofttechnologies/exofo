import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  TrendingUp,
  MessageSquare,
  Upload,
  Paperclip,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { taskService } from '../../services/taskService';
import { EmployeeHeader } from '../../components/employee/EmployeeHeader';
import { EmployeeBottomNavigation } from '../../components/employee/EmployeeBottomNavigation';
import { NotificationsModal } from '../../components/NotificationsModal';
import { TaskProgressBar } from '../../components/tasks/TaskProgressBar';
import { Employee, Task, TaskAttachment, TaskStatus } from '../../types';

export const EmployeeTaskUpdatePage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [task, setTask] = useState<Task | null>(null);

  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [progress, setProgress] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [attachment, setAttachment] = useState<TaskAttachment | undefined>(undefined);

  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
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
        setStatus(res.task.status);
        setProgress(res.task.progress);
      } catch (err: any) {
        setError(err.message || 'Unable to load task for update.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [taskId]);

  const handleStatusSelect = (nextStatus: TaskStatus) => {
    setStatus(nextStatus);
    setError(null);
    if (nextStatus === 'Pending') {
      setProgress(0);
    } else if (nextStatus === 'Completed') {
      setProgress(100);
    } else if (nextStatus === 'In Progress') {
      if (progress === 0 || progress === 100) {
        setProgress(progress === 0 ? 25 : 90);
      }
    }
  };

  const getConsistencyError = (currentStatus: TaskStatus, currentProgress: number): string | null => {
    if (currentStatus === 'Pending' && currentProgress !== 0) {
      return 'Pending tasks must have 0% progress.';
    }
    if (currentStatus === 'In Progress' && (currentProgress < 1 || currentProgress > 99)) {
      return 'In Progress tasks must have progress between 1% and 99%.';
    }
    if (currentStatus === 'Completed' && currentProgress !== 100) {
      return 'Completed tasks must have 100% progress.';
    }
    return null;
  };

  const consistencyWarning = getConsistencyError(status, progress);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';

    setAttachment({
      id: `att-${Date.now()}`,
      name: file.name,
      size: sizeFormatted,
      fileType: extension,
      uploadedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      uploadedBy: employee?.name || 'Employee',
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    const validationMsg = getConsistencyError(status, progress);
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const activeIdentifier =
        localStorage.getItem('exofo_employee_id') ||
        localStorage.getItem('exofo_user_email') ||
        'emp-ahmed';

      await taskService.updateEmployeeTaskProgress(activeIdentifier, task.id || task.taskId, {
        status,
        progress,
        comment: comment.trim() || undefined,
        attachment,
      });

      setSuccessToast(`Progress for "${task.taskName}" updated successfully!`);
      setTimeout(() => {
        navigate(`/employee/tasks/${task.id || task.taskId}`);
      }, 950);
    } catch (err: any) {
      setError(err.message || 'Failed to update task progress.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#F7F9FC] text-slate-900 relative antialiased overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.08) 1.25px, transparent 1.25px)',
        backgroundSize: '22px 22px',
      }}
    >
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* Abstract Ambient Flowing Colour Textures */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute -top-32 -right-28 w-[520px] h-[520px] rounded-full bg-blue-500/10 blur-[125px]" />
        <div className="absolute bottom-12 -left-32 w-[460px] h-[460px] rounded-full bg-rose-500/8 blur-[130px]" />
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Header */}
        <EmployeeHeader
          employee={employee}
          unreadCount={2}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => navigate('/employee/profile')}
        />

        {/* Back Navigation */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(`/employee/tasks/${task?.id || taskId}`)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/85 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Task Details</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-5 animate-pulse">
            <div className="h-14 w-64 bg-slate-200/60 rounded-2xl" />
            <div className="h-80 bg-white/70 rounded-[28px]" />
          </div>
        )}

        {/* Unavailable / Auth Error State */}
        {!loading && !task && (
          <div className="rounded-[28px] bg-white/80 backdrop-blur-xl border border-rose-200 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-extrabold text-slate-900">Task Unavailable</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
              {error || 'Task not found or not assigned to your account.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/employee/tasks')}
              className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold"
            >
              Back to My Tasks
            </button>
          </div>
        )}

        {!loading && task && (
          <>
            {/* Page Title directly on dotted background */}
            <section className="mb-7 select-none">
              <span className="inline-block text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2">
                {task.taskId} {task.projectName ? `• ${task.projectName}` : ''}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Update Task Progress
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Updating progress for <span className="font-bold text-slate-700">{task.taskName}</span>
              </p>
            </section>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 flex items-start gap-3 text-xs sm:text-sm text-rose-700 font-semibold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative pt-4">
                <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600 stroke-[2.2]" />
                  <span className="text-[11px] font-bold text-slate-800">Status & Progress</span>
                </div>

                <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-7 shadow-[0_12px_34px_rgba(15,23,42,0.04)] space-y-6">
                  <div
                    className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/14 via-sky-300/5 to-transparent blur-2xl pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* 1. Task Status Buttons */}
                  <div className="relative z-10">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Task Status
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map((option) => {
                        const isSelected = status === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleStatusSelect(option)}
                            className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-bold border transition-all text-center ${
                              isSelected
                                ? option === 'Completed'
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : option === 'In Progress'
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-white'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Progress Percentage Slider */}
                  <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-white/90 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="progressSlider" className="text-xs font-bold text-slate-700">
                        Progress Percentage
                      </label>
                      <span className="text-lg font-black text-blue-600">{progress}%</span>
                    </div>

                    <input
                      id="progressSlider"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={progress}
                      onChange={(e) => {
                        setProgress(Number(e.target.value));
                        if (error) setError(null);
                      }}
                      className="w-full accent-[#1261E8] cursor-pointer"
                    />

                    <TaskProgressBar progress={progress} showLabel={false} size="sm" />

                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span>Pending: 0%</span>
                      <span>In Progress: 1% – 99%</span>
                      <span>Completed: 100%</span>
                    </div>

                    {consistencyWarning && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>{consistencyWarning}</span>
                      </div>
                    )}
                  </div>

                  {/* 3. Work Update / Comment */}
                  <div className="relative z-10">
                    <label htmlFor="workUpdateInput" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Work Update / Comment{' '}
                        <span className="text-slate-400 font-normal">(Optional)</span>
                      </span>
                    </label>
                    <textarea
                      id="workUpdateInput"
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Describe completed work, blockers, or verification notes..."
                      className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-2xs transition-all resize-y"
                    />
                  </div>

                  {/* 4. Optional Attachment */}
                  <div className="relative z-10">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Attachment{' '}
                        <span className="text-slate-400 font-normal">(Optional)</span>
                      </span>
                    </label>

                    {!attachment ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        className="w-full p-5 rounded-2xl bg-white/80 border-2 border-dashed border-slate-200 hover:border-blue-400 text-center cursor-pointer transition-all group"
                      >
                        <Upload className="w-6 h-6 text-slate-300 group-hover:text-blue-500 mx-auto mb-1.5 transition-colors" />
                        <p className="text-xs font-bold text-slate-600">
                          Click to attach a deliverable or screenshot
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          PDF, PNG, JPG, DOCX, ZIP supported
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-blue-200 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                            {attachment.fileType}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">{attachment.name}</p>
                            <p className="text-[11px] text-slate-400">{attachment.size}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setAttachment(undefined)}
                          aria-label="Remove attachment"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xlsx,.zip"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate(`/employee/tasks/${task.id || task.taskId}`)}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-full bg-white/85 hover:bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || Boolean(consistencyWarning)}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSubmitting ? 'Saving Update...' : 'Save Update'}</span>
                </button>
              </div>
            </form>
          </>
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
