import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { employeeService } from '../../services/employeeService';
import { projectService } from '../../services/projectService';
import { TaskForm } from '../../components/tasks/TaskForm';
import { TaskHeader } from '../../components/tasks/TaskHeader';
import { NotificationsModal } from '../../components/NotificationsModal';
import { ProfileDrawer } from '../../components/ProfileDrawer';

export const EditTaskPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    employeeService.getEmployees().then(setEmployees).catch(() => {});
    projectService.getAllProjects().then(setProjects).catch(() => {});

    async function fetchTask() {
      if (!taskId) return;
      try {
        setLoading(true);
        const data = await taskService.getTaskById(taskId);
        if (!data) {
          setError(`Task "${taskId}" not found.`);
        } else {
          setTask(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load task.');
      } finally {
        setLoading(false);
      }
    }
    fetchTask();
  }, [taskId]);

  const handleUpdateTask = async (formData: any) => {
    if (!task) return;
    try {
      setIsSubmitting(true);
      const updated = await taskService.updateTask(task.taskId, formData);
      setSuccessToast(`Task "${updated.taskName}" updated successfully!`);

      setTimeout(() => {
        navigate(`/tasks/${updated.taskId}`);
      }, 900);
    } catch (err: any) {
      alert(`Error updating task: ${err.message || 'Please try again.'}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-32 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <TaskHeader
        title="Edit Task"
        subtitle={`Updating task ${taskId}`}
        showBack={true}
        backUrl={taskId ? `/tasks/${taskId}` : '/tasks'}
        showSearch={false}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {loading ? (
        <div className="glass-surface rounded-[24px] p-8 text-center text-slate-400 font-semibold text-xs sm:text-sm">
          Loading task details from database...
        </div>
      ) : error ? (
        <div className="glass-surface rounded-[24px] p-8 text-center text-rose-500 font-bold text-xs sm:text-sm flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
          <button
            onClick={() => navigate('/tasks')}
            className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Back to Tasks
          </button>
        </div>
      ) : task ? (
        <TaskForm
          initialData={task}
          employees={employees}
          projects={projects}
          onSubmit={handleUpdateTask}
          isSubmitting={isSubmitting}
          submitButtonText="Save Changes"
          cancelUrl={`/tasks/${task.taskId}`}
        />
      ) : null}

      {/* Modals */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};
