import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  CheckSquare, 
  Layers, 
  User, 
  ArrowRight 
} from 'lucide-react';

export const EmployeeQuickActionsCard: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'tasks',
      name: 'My Tasks',
      description: 'Review deadlines & update progress status',
      icon: CheckSquare,
      path: '/employee/tasks',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      id: 'projects',
      name: 'My Projects',
      description: 'Access assigned specs, SRS & deliverables',
      icon: Layers,
      path: '/employee/projects',
      color: 'text-slate-800 bg-slate-100 border-slate-200',
    },
    {
      id: 'profile',
      name: 'My Profile',
      description: 'Manage personal details & credentials',
      icon: User,
      path: '/employee/profile',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
  ];

  return (
    <div className="relative pt-4 select-none h-full flex flex-col">
      {/* Folder Tab Header */}
      <div className="absolute top-0 left-4 z-10 flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/80 backdrop-blur-md border border-b-0 border-white/90 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-slate-800 stroke-[2.4]" />
        <span className="text-[11px] font-bold text-slate-900 tracking-tight">
          Direct Shortcuts
        </span>
      </div>

      {/* Main Frosted-Glass Card */}
      <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/70 backdrop-blur-xl border border-white/90 p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.02)] flex-1 flex flex-col justify-between">
        {/* Subtle Decorative Ambient Fluid Gradient */}
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-tr from-rose-400/10 via-amber-400/5 to-transparent blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 pb-3.5 mb-3.5 border-b border-slate-100/80">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Quick Actions
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Instant navigation to your key employee hubs
          </p>
        </div>

        {/* Action Rows */}
        <div className="relative z-10 space-y-3 flex-1 flex flex-col justify-center">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <div
                key={action.id}
                onClick={() => navigate(action.path)}
                role="button"
                tabIndex={0}
                className="group p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-2xs group-hover:scale-105 transition-transform ${action.color}`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {action.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                      {action.description}
                    </p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-all shadow-2xs group-hover:translate-x-0.5">
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
