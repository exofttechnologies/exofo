import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Calendar, 
  FileText, 
  AlertCircle, 
  Layers, 
  Flag 
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, ProjectEmployee, Project } from '../../types';
import { EmployeeDropdown } from './EmployeeDropdown';
import { ProjectDropdown } from './ProjectDropdown';

interface TaskFormData {
  taskName: string;
  description: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedEmployeeAvatar?: string;
  assignedEmployeeDesignation?: string;
  assignedEmployeeEmail?: string;
  assignedEmployeePhone?: string;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  isIndependent: boolean;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  startDate?: string;
  dueDate?: string;
}

interface TaskFormProps {
  initialData?: Partial<Task>;
  employees: ProjectEmployee[];
  projects: Project[];
  onSubmit: (formData: TaskFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  cancelUrl?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  employees,
  projects,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Create Task',
  cancelUrl = '/tasks',
}) => {
  const navigate = useNavigate();

  // Form State
  const [taskName, setTaskName] = useState(initialData?.taskName || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string | undefined>(
    initialData?.assignedEmployeeId
  );
  const [assignedEmployee, setAssignedEmployee] = useState<ProjectEmployee | null>(
    employees.find((e) => e.id === initialData?.assignedEmployeeId) || null
  );

  const [projectId, setProjectId] = useState<string | undefined>(
    initialData?.isIndependent ? undefined : initialData?.projectId
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    projects.find((p) => p.id === initialData?.projectId) || null
  );

  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || 'Medium');
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || 'Pending');
  const [progress, setProgress] = useState<number>(initialData?.progress ?? 0);
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');

  // Validation
  const [nameError, setNameError] = useState<string | null>(null);

  const handleEmployeeSelect = (emp: ProjectEmployee | null) => {
    setAssignedEmployee(emp);
    setAssignedEmployeeId(emp ? emp.id : undefined);
  };

  const handleProjectSelect = (proj: Project | null) => {
    setSelectedProject(proj);
    setProjectId(proj ? proj.id : undefined);
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    if (newStatus === 'Completed') {
      setProgress(100);
    } else if (newStatus === 'In Progress' && progress === 0) {
      setProgress(25);
    } else if (newStatus === 'Pending' && progress === 100) {
      setProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim()) {
      setNameError('Task Name is required');
      const el = document.getElementById('taskNameInput');
      el?.focus();
      return;
    }

    setNameError(null);

    const isIndependent = !projectId || projectId === 'independent';

    const formData: TaskFormData = {
      taskName: taskName.trim(),
      description: description.trim(),
      assignedEmployeeId: assignedEmployee ? assignedEmployee.id : undefined,
      assignedEmployeeName: assignedEmployee ? assignedEmployee.name : '',
      assignedEmployeeAvatar: assignedEmployee ? assignedEmployee.initials : '',
      assignedEmployeeDesignation: assignedEmployee ? assignedEmployee.designation : '',
      assignedEmployeeEmail: assignedEmployee ? assignedEmployee.email : '',
      assignedEmployeePhone: assignedEmployee ? assignedEmployee.phone : '',
      projectId: isIndependent ? undefined : projectId,
      projectName: isIndependent ? undefined : (selectedProject?.name || ''),
      projectCode: isIndependent ? undefined : (selectedProject?.projectCode || ''),
      isIndependent,
      priority,
      status,
      progress: status === 'Completed' ? 100 : progress,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
    };

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Basic Info Card */}
      <div className="glass-surface rounded-[26px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Task Information</span>
        </h3>

        {/* Task Name (Required) */}
        <div>
          <label htmlFor="taskNameInput" className="block text-xs font-bold text-slate-700 mb-1.5">
            Task Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="taskNameInput"
            type="text"
            value={taskName}
            onChange={(e) => {
              setTaskName(e.target.value);
              if (nameError) setNameError(null);
            }}
            placeholder="e.g. Develop Product Listing"
            className={`w-full px-4 py-3 rounded-2xl bg-white border text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 transition-all ${
              nameError
                ? 'border-rose-400 focus:ring-rose-500/20'
                : 'border-slate-200/90 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
          />
          {nameError && (
            <p className="mt-1.5 text-xs text-rose-500 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{nameError}</span>
            </p>
          )}
        </div>

        {/* Task Description (Optional) */}
        <div>
          <label htmlFor="descriptionInput" className="block text-xs font-bold text-slate-700 mb-1.5">
            Task Description <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="descriptionInput"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide short requirements, deliverable specifications, or acceptance criteria..."
            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
          />
        </div>
      </div>

      {/* 2. Assignment & Project Association Card */}
      <div className="glass-surface rounded-[26px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Assignment & Project</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Assign Employee (Optional) */}
          <EmployeeDropdown
            employees={employees}
            selectedEmployeeId={assignedEmployeeId}
            onSelect={handleEmployeeSelect}
          />

          {/* Select Project (Optional - includes Independent Task) */}
          <ProjectDropdown
            projects={projects}
            selectedProjectId={projectId}
            onSelect={handleProjectSelect}
          />
        </div>
      </div>

      {/* 3. Status, Priority & Timeline Card */}
      <div className="glass-surface rounded-[26px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Flag className="w-4 h-4 text-blue-600" />
          <span>Status, Priority & Timeline</span>
        </h3>

        {/* Priority & Status Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['High', 'Medium', 'Low'] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? p === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs ring-2 ring-rose-500/20'
                          : p === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-2xs ring-2 ring-amber-500/20'
                          : 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs ring-2 ring-blue-500/20'
                        : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Task Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map((s) => {
                const isSelected = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? s === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs ring-2 ring-emerald-500/20'
                          : s === 'In Progress'
                          ? 'bg-blue-50 text-[#1261E8] border-blue-300 shadow-2xs ring-2 ring-blue-500/20'
                          : 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs ring-2 ring-slate-400/20'
                        : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress Slider (Only if In Progress or Editing) */}
        {status === 'In Progress' && (
          <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Progress Percentage</span>
              <span className="text-blue-600 text-sm">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-[#1261E8] cursor-pointer"
            />
          </div>
        )}

        {/* Date Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* Start Date */}
          <div>
            <label htmlFor="startDateInput" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Start Date (Optional)</span>
            </label>
            <input
              id="startDateInput"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDateInput" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Due Date (Optional)</span>
            </label>
            <input
              id="dueDateInput"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={() => navigate(cancelUrl)}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#1261E8] to-[#0645B5] hover:opacity-95 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{isSubmitting ? 'Saving...' : submitButtonText}</span>
        </button>
      </div>
    </form>
  );
};

