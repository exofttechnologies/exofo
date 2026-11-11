import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowRight, 
  Calendar 
} from 'lucide-react';
import { Task } from '../../types';

interface EmployeeTodayTasksCardProps {
  tasks: Task[];
}

export const EmployeeTodayTasksCard: React.FC<EmployeeTodayTasksCardProps> = ({ tasks }) => {
  const navigate = useNavigate();

  const displayTasks = tasks.slice(0, 5);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="relative pt-4 select-none h-full flex flex-col">
      {/* Folder Tab Header */}
      <div className="absolute top-0 left-4 z-10 flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/80 backdrop-blur-md border border-b-0 border-white/90 shadow-2xs">
        <CheckSquare className="w-3.5 h-3.5 text-slate-800 stroke-[2.4]" />
        <span className="text-[11px] font-bold text-slate-900 tracking-tight">
          Today's Schedule
        </span>
        <span className="ml-1 text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full">
          {displayTasks.length}
        </span>
      </div>

      {/* Main Frosted-Glass Card */}
      <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/70 backdrop-blur-xl border border-white/90 p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.02)] flex-1 flex flex-col justify-between">
        {/* Subtle Decorative Ambient Fluid Gradient */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-blue-400/10 via-indigo-400/5 to-transparent blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100/80">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Today's Tasks
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Priority actions due or ongoing for today
            </p>
          </div>

          <button
            onClick={() => navigate('/employee/tasks')}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Task Items */}
        <div className="relative z-10 space-y-2.5 flex-1">
          {displayTasks.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-700">All Caught Up for Today!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No immediate overdue items scheduled.</p>
            </div>
          ) : (
            displayTasks.map((task) => {
              const isCompleted = task.status === 'Completed';

              return (
                <div
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id || task.taskId}`)}
                  role="button"
                  tabIndex={0}
                  className={`group p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCompleted
                      ? 'bg-slate-50/60 border-slate-200/50 opacity-80'
                      : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {/* Left: Status Icon & Title */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Status Indicator (Purely informative - not quick toggle without workflow) */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-600'
                          : task.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                      title={`Status: ${task.status}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[2.6]" />
                      ) : task.status === 'In Progress' ? (
                        <Clock className="w-3.5 h-3.5 stroke-[2.4]" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 stroke-[2.2]" />
                      )}
                    </div>

                    {/* Task Title & Project Tag */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.taskName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-medium">
                        <span>{task.projectName || 'Independent Task'}</span>
                        {task.dueDate && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {task.dueDate}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Priority Badge & Arrow */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>

                    <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-all shadow-2xs">
                      <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

