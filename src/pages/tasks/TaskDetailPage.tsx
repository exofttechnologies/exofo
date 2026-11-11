import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  Folder, 
  User, 
  Mail, 
  Phone, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  History, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, ProjectEmployee } from '../../types';
import { taskService } from '../../services/taskService';
import { allCompanyEmployees, currentProjects } from '../../data/mockData';
import { TaskStatusBadge } from '../../components/tasks/TaskStatusBadge';
import { TaskPriorityBadge } from '../../components/tasks/TaskPriorityBadge';
import { TaskProgressBar } from '../../components/tasks/TaskProgressBar';
import { TaskActivityTimeline } from '../../components/tasks/TaskActivityTimeline';
import { DeleteConfirmationModal } from '../../components/tasks/DeleteConfirmationModal';
import { EmployeeDropdown } from '../../components/tasks/EmployeeDropdown';

export const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Action States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReassigning, setIsReassigning] = useState(false);

  const loadTask = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTaskById(taskId);
      if (!data) {
        setError(`Task with ID "${taskId}" could not be found.`);
      } else {
        setTask(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick Status Change
  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    try {
      const updated = await taskService.updateStatus(task.taskId, newStatus);
      setTask(updated);
      showToast(`Status updated to ${newStatus}`);
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Quick Priority Change
  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (!task) return;
    try {
      const updated = await taskService.updateTask(task.taskId, { priority: newPriority });
      setTask(updated);
      showToast(`Priority changed to ${newPriority}`);
    } catch (err: any) {
      alert(`Error updating priority: ${err.message}`);
    }
  };

  // Quick Reassign Employee
  const handleReassign = async (emp: ProjectEmployee | null) => {
    if (!task) return;
    try {
      const updated = await taskService.updateTask(task.taskId, {
        assignedEmployeeId: emp ? emp.id : undefined,
        assignedEmployeeName: emp ? emp.name : '',
        assignedEmployeeAvatar: emp ? emp.initials : '',
        assignedEmployeeDesignation: emp ? emp.designation : '',
        assignedEmployeeEmail: emp ? emp.email : '',
        assignedEmployeePhone: emp ? emp.phone : '',
      });
      setTask(updated);
      setIsReassigning(false);
      showToast(emp ? `Reassigned to ${emp.name}` : 'Employee assignment removed');
    } catch (err: any) {
      alert(`Error reassigning: ${err.message}`);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!task) return;
    try {
      setIsDeleting(true);
      await taskService.deleteTask(task.taskId);
      navigate('/tasks');
    } catch (err: any) {
      alert(`Error deleting task: ${err.message}`);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full pb-32 animate-pulse space-y-5">
        <div className="h-10 w-32 bg-white/70 rounded-full" />
        <div className="h-28 bg-white/70 rounded-[28px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-52 bg-white/70 rounded-[24px]" />
          <div className="h-52 bg-white/70 rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="w-full pb-32 pt-8">
        <div className="glass-surface rounded-[28px] p-8 sm:p-12 text-center max-w-lg mx-auto border border-white/80">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Task Not Found</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {error || 'The requested task could not be loaded.'}
          </p>
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1261E8] text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Return to Tasks</span>
          </button>
        </div>
      </div>
    );
  }

  const isOverdue = taskService.isOverdue(task.dueDate, task.status);

  // Find related project details if present
  const projectObj = currentProjects.find(
    (p) => p.id === task.projectId || p.projectCode === task.projectCode
  );

  return (
    <div className="w-full pb-32 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-900 text-white shadow-xl font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------
          A. Page Header
          ------------------------------------------------------------------ */}
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Tasks</span>
          </button>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/tasks/${task.taskId}/edit`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs hover:border-blue-300 hover:text-blue-600 transition-all active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Task</span>
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Task Title & Status Meta Card */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-6 border border-white/80 shadow-glass">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-100">
                  {task.taskId}
                </span>
                <TaskPriorityBadge priority={task.priority} size="sm" />
                {isOverdue && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                    <AlertCircle className="w-3 h-3" />
                    <span>Overdue</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {task.taskName}
              </h1>
            </div>

            <div>
              <TaskStatusBadge status={task.status} size="md" />
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------
          Main Information Layout Grid
          ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-5">
          {/* B. Task Information Card */}
          <div className="glass-surface rounded-[24px] p-5 sm:p-6 border border-white/80 shadow-glass space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Task Information</span>
            </h2>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white/70 p-4 rounded-2xl border border-slate-100">
                {task.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/80 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Created Date</span>
                <span className="text-xs font-bold text-slate-800">
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Start Date</span>
                <span className="text-xs font-bold text-slate-800">
                  {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Not set'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Due Date</span>
                <span className={`text-xs font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Last Updated</span>
                <span className="text-xs font-bold text-slate-800">
                  {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Just now'}
                </span>
              </div>
            </div>
          </div>

          {/* E. Task Progress Card */}
          <div className="glass-surface rounded-[24px] p-5 sm:p-6 border border-white/80 shadow-glass space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Task Progress</span>
            </h2>

            <div className="p-4 rounded-2xl bg-white/90 border border-slate-100 space-y-3">
              <TaskProgressBar progress={task.progress} size="md" />

              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
                <span>Current Status: <strong className="text-slate-800">{task.status}</strong></span>
                <span>Last progress update: <strong className="text-slate-700">{task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Today'}</strong></span>
              </div>

              {task.progressNotes && (
                <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <span className="font-bold text-slate-700">Remarks: </span>
                  {task.progressNotes}
                </div>
              )}
            </div>
          </div>

          {/* F. Activity History (Vertical Timeline) */}
          <div className="glass-surface rounded-[24px] p-5 sm:p-6 border border-white/80 shadow-glass space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Activity History</span>
            </h2>

            <TaskActivityTimeline activities={task.activityHistory} />
          </div>
        </div>

        {/* Right Column (Cards for Assignee, Project, & Admin Actions) */}
        <div className="space-y-5">
          {/* C. Assigned Employee Card */}
          <div className="glass-surface rounded-[24px] p-5 border border-white/80 shadow-glass space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Assigned Employee</span>
              </h2>

              <button
                onClick={() => setIsReassigning(!isReassigning)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
              >
                {isReassigning ? 'Cancel' : 'Change'}
              </button>
            </div>

            {isReassigning ? (
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <EmployeeDropdown
                  employees={allCompanyEmployees}
                  selectedEmployeeId={task.assignedEmployeeId}
                  onSelect={handleReassign}
                  label="Select new assignee:"
                />
              </div>
            ) : task.assignedEmployeeName ? (
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-sm font-extrabold shadow-sm">
                    {task.assignedEmployeeAvatar || task.assignedEmployeeName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {task.assignedEmployeeName}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {task.assignedEmployeeDesignation || 'Project Contributor'}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {task.assignedEmployeeId || 'ID: Assigned'}
                    </span>
                  </div>
                </div>

                {(task.assignedEmployeeEmail || task.assignedEmployeePhone) && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    {task.assignedEmployeeEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{task.assignedEmployeeEmail}</span>
                      </div>
                    )}
                    {task.assignedEmployeePhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.assignedEmployeePhone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                <User className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                <p className="font-semibold">No employee assigned</p>
                <button
                  onClick={() => setIsReassigning(true)}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  Assign talent now
                </button>
              </div>
            )}
          </div>

          {/* D. Related Project Card */}
          <div className="glass-surface rounded-[24px] p-5 border border-white/80 shadow-glass space-y-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-600" />
              <span>Related Project</span>
            </h2>

            {!task.isIndependent && task.projectName ? (
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-100 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100">
                      {task.projectCode || 'PRJ'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {task.projectName}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Status: {projectObj?.status || 'In Progress'}
                    </p>
                  </div>
                </div>

                {projectObj && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => navigate(`/projects/${projectObj.id}`)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                    >
                      <span>View Project Sections</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center text-xs text-slate-600">
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <p className="font-bold text-slate-800">Independent Task</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Not associated with any project.
                </p>
              </div>
            )}
          </div>

          {/* G. Admin Quick Actions Card */}
          <div className="glass-surface rounded-[24px] p-5 border border-white/80 shadow-glass space-y-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Admin Quick Actions
            </h2>

            {/* Quick Status */}
            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Quick Change Status
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={task.status === s}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      task.status === s
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Priority */}
            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Quick Change Priority
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['High', 'Medium', 'Low'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePriorityChange(p)}
                    disabled={task.priority === p}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      task.priority === p
                        ? p === 'High'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : p === 'Medium'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Edit / Delete actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => navigate(`/tasks/${task.taskId}/edit`)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Full Edit</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center transition-colors border border-rose-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        taskTitle={task.taskName}
        taskId={task.taskId}
        isDeleting={isDeleting}
      />
    </div>
  );
};

