import React from 'react';
import { 
  Calendar, 
  Folder, 
  User, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskProgressBar } from './TaskProgressBar';
import { taskService } from '../../services/taskService';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const navigate = useNavigate();
  const isOverdue = taskService.isOverdue(task.dueDate, task.status);

  // Format Due Date nicely
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return 'No due date';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onClick={() => navigate(`/tasks/${task.taskId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/tasks/${task.taskId}`);
        }
      }}
      className="group glass-surface stat-card-hover rounded-[24px] p-5 cursor-pointer border border-white/80 hover:border-blue-300 transition-all duration-200 select-none flex flex-col justify-between shadow-2xs hover:shadow-card-hover relative"
    >
      {/* Top Meta Row: Task ID & Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-100">
              {task.taskId}
            </span>
            <TaskPriorityBadge priority={task.priority} size="sm" />
          </div>

          <TaskStatusBadge status={task.status} size="sm" />
        </div>

        {/* Task Name */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
          {task.taskName}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {task.description || 'No additional description provided.'}
        </p>
      </div>

      {/* Middle: Project & Employee Info */}
      <div className="pt-3 border-t border-slate-100/80 space-y-2 mb-4">
        {/* Project association */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-400">Project:</span>
          {task.isIndependent || !task.projectName ? (
            <span className="inline-flex items-center gap-1 font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
              Independent Task
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[11px] truncate max-w-[160px]">
              <Folder className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{task.projectName}</span>
            </span>
          )}
        </div>

        {/* Assigned Employee */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400">Assignee:</span>
          {task.assignedEmployeeName ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-[10px] font-bold">
                {task.assignedEmployeeAvatar || task.assignedEmployeeName.substring(0, 2).toUpperCase()}
              </div>
              <span className="font-bold text-slate-800 text-xs">
                {task.assignedEmployeeName}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 italic text-[11px]">Unassigned</span>
          )}
        </div>

        {/* Due Date & Overdue Indicator */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400">Due Date:</span>
          <div className="flex items-center gap-1.5">
            {isOverdue && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-200">
                <AlertCircle className="w-2.5 h-2.5" />
                <span>Overdue</span>
              </span>
            )}
            <span className={`font-semibold text-xs ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
              {formatDueDate(task.dueDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: Progress Bar & Chevron */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <TaskProgressBar progress={task.progress} size="sm" />
          </div>

          <div className="w-7 h-7 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-all flex-shrink-0 shadow-2xs group-hover:translate-x-0.5">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

