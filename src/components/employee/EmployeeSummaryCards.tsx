import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';

interface SummaryCounts {
  myTasks: number;
  myProjects: number;
  inProgress: number;
  completed: number;
}

interface EmployeeSummaryCardsProps {
  counts: SummaryCounts;
}

export const EmployeeSummaryCards: React.FC<EmployeeSummaryCardsProps> = ({ counts }) => {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'my-tasks',
      title: 'My Tasks',
      count: counts.myTasks,
      subtitle: 'Assigned Deliverables',
      icon: CheckSquare,
      path: '/employee/tasks',
      // Abstract subtle flowing color accent
      accentGlow: 'bg-radial from-blue-500/15 via-blue-500/5 to-transparent',
      tabColor: 'text-blue-600',
      tabBorder: 'border-blue-200/60',
      pillBg: 'bg-blue-50 text-blue-700',
      tabWidth: 'w-28 sm:w-32',
    },
    {
      id: 'my-projects',
      title: 'My Projects',
      count: counts.myProjects,
      subtitle: 'Active Initiatives',
      icon: Layers,
      path: '/employee/projects',
      accentGlow: 'bg-radial from-slate-800/15 via-slate-800/5 to-transparent',
      tabColor: 'text-slate-800',
      tabBorder: 'border-slate-300/60',
      pillBg: 'bg-slate-100 text-slate-800',
      tabWidth: 'w-30 sm:w-34',
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      count: counts.inProgress,
      subtitle: 'Under Execution',
      icon: Clock,
      path: '/employee/tasks?status=In Progress',
      accentGlow: 'bg-radial from-rose-500/15 via-amber-500/5 to-transparent',
      tabColor: 'text-rose-600',
      tabBorder: 'border-rose-200/60',
      pillBg: 'bg-rose-50 text-rose-700',
      tabWidth: 'w-30 sm:w-34',
    },
    {
      id: 'completed',
      title: 'Completed',
      count: counts.completed,
      subtitle: 'Finished Scope',
      icon: CheckCircle2,
      path: '/employee/tasks?status=Completed',
      accentGlow: 'bg-radial from-emerald-500/15 via-teal-500/5 to-transparent',
      tabColor: 'text-emerald-600',
      tabBorder: 'border-emerald-200/60',
      pillBg: 'bg-emerald-50 text-emerald-700',
      tabWidth: 'w-28 sm:w-32',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            onClick={() => navigate(card.path)}
            role="button"
            tabIndex={0}
            className="group relative pt-4 cursor-pointer select-none stat-card-hover transition-all"
          >
            {/* Curved Folder Top Tab */}
            <div
              className={`absolute top-0 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-t-[12px] bg-white/80 backdrop-blur-md border border-b-0 border-white/90 shadow-2xs ${card.tabBorder}`}
            >
              <Icon className={`w-3.5 h-3.5 ${card.tabColor} stroke-[2.4]`} />
              <span className="text-[11px] font-bold text-slate-800 tracking-tight whitespace-nowrap">
                {card.title}
              </span>
            </div>

            {/* Folder Main Card Container */}
            <div className="relative overflow-hidden rounded-[24px] rounded-tl-[6px] bg-white/70 backdrop-blur-xl border border-white/90 p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] group-hover:border-white transition-all">
              {/* Subtle Decorative Abstract Flowing Texture */}
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none blur-2xl opacity-70 group-hover:opacity-100 transition-opacity ${card.accentGlow}`}
              />

              <div className="relative z-10 flex flex-col justify-between h-full">
                {/* Top Row: Mini Icon & Arrow */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.pillBg}`}>
                    {card.subtitle}
                  </span>

                  <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-all shadow-2xs">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>

                {/* Main Prominent Count */}
                <div className="mt-1">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {card.count}
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {card.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

