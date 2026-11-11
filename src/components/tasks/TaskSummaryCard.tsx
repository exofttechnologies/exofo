import React from 'react';
import { 
  ClipboardList, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  LucideIcon 
} from 'lucide-react';

interface SummaryData {
  totalRunning: number;
  pending: number;
  inProgress: number;
  completed: number;
}

interface TaskSummaryCardProps {
  data: SummaryData;
  activeFilter?: string;
  onFilterSelect?: (status: string) => void;
}

export const TaskSummaryCard: React.FC<TaskSummaryCardProps> = ({
  data,
  activeFilter,
  onFilterSelect,
}) => {
  const cards: {
    id: string;
    label: string;
    count: number;
    icon: LucideIcon;
    color: string;
    filterValue: string;
    bgAccent: string;
  }[] = [
    {
      id: 'running',
      label: 'Total Running Tasks',
      count: data.totalRunning,
      icon: ClipboardList,
      color: 'text-[#1261E8]',
      bgAccent: 'from-[#1261E8]/10 to-[#0645B5]/10',
      filterValue: 'All',
    },
    {
      id: 'pending',
      label: 'Pending Tasks',
      count: data.pending,
      icon: Clock,
      color: 'text-slate-600',
      bgAccent: 'from-slate-500/10 to-slate-700/10',
      filterValue: 'Pending',
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      count: data.inProgress,
      icon: PlayCircle,
      color: 'text-[#1261E8]',
      bgAccent: 'from-blue-500/10 to-blue-700/10',
      filterValue: 'In Progress',
    },
    {
      id: 'completed',
      label: 'Completed Tasks',
      count: data.completed,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgAccent: 'from-emerald-500/10 to-emerald-700/10',
      filterValue: 'Completed',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.filterValue;

        return (
          <div
            key={card.id}
            onClick={() => onFilterSelect && onFilterSelect(card.filterValue)}
            role="button"
            tabIndex={0}
            className={`glass-surface rounded-[22px] p-4 sm:p-5 transition-all duration-200 cursor-pointer border select-none ${
              isActive
                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                : 'border-white/80 hover:border-blue-200 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-500 truncate">
                {card.label}
              </span>
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.bgAccent} flex items-center justify-center ${card.color} flex-shrink-0`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.count}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

