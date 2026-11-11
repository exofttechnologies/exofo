import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { allCompanyEmployees, currentProjects } from '../../data/mockData';
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

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="w-full pb-32 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-10 w-40 bg-white/70 rounded-full" />
        <div className="h-64 bg-white/70 rounded-[26px]" />
        <div className="h-44 bg-white/70 rounded-[26px]" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="w-full pb-32 pt-8 text-center">
        <div className="glass-surface rounded-[28px] p-8 max-w-md mx-auto border border-white/80">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-800">Task Not Found</h2>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/tasks')}
            className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

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
        subtitle={`Update task information and assignment for ${task.taskId}.`}
        showBack={true}
        backUrl={`/tasks/${task.taskId}`}
        showSearch={false}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Form Container */}
      <TaskForm
        initialData={task}
        employees={allCompanyEmployees}
        projects={currentProjects}
        onSubmit={handleUpdateTask}
        isSubmitting={isSubmitting}
        submitButtonText="Save Changes"
        cancelUrl={`/tasks/${task.taskId}`}
      />

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

