import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { taskService } from '../../services/taskService';
import { allCompanyEmployees, currentProjects } from '../../data/mockData';
import { TaskForm } from '../../components/tasks/TaskForm';
import { NotificationsModal } from '../../components/NotificationsModal';
import { ProfileDrawer } from '../../components/ProfileDrawer';
import { TaskHeader } from '../../components/tasks/TaskHeader';

export const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleCreateTask = async (formData: any) => {
    try {
      setIsSubmitting(true);
      const created = await taskService.createTask(formData);
      
      setSuccessToast(`Task "${created.taskName}" (${created.taskId}) created successfully!`);

      // Wait a moment so user sees toast, then navigate to /tasks
      setTimeout(() => {
        navigate('/tasks');
      }, 900);
    } catch (err: any) {
      alert(`Error creating task: ${err.message || 'Please try again.'}`);
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
        title="Create New Task"
        subtitle="Add a task and assign it to an employee."
        showBack={true}
        backUrl="/tasks"
        showSearch={false}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Form Container */}
      <TaskForm
        employees={allCompanyEmployees}
        projects={currentProjects}
        onSubmit={handleCreateTask}
        isSubmitting={isSubmitting}
        submitButtonText="Create Task"
        cancelUrl="/tasks"
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

