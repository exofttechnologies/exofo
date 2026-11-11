import React from 'react';
import { 
  PlusCircle, 
  UserCheck, 
  Play, 
  TrendingUp, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Edit3 
} from 'lucide-react';
import { TaskActivity } from '../../types';

interface TaskActivityTimelineProps {
  activities?: TaskActivity[];
}

export const TaskActivityTimeline: React.FC<TaskActivityTimelineProps> = ({
  activities = [],
}) => {
  if (activities.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400">
        No recorded activity history for this task yet.
      </div>
    );
  }

  const getActivityIcon = (type: TaskActivity['type']) => {
    switch (type) {
      case 'created':
        return { icon: PlusCircle, bg: 'bg-blue-50 text-blue-600 border-blue-200' };
      case 'assigned':
      case 'reassigned':
        return { icon: UserCheck, bg: 'bg-purple-50 text-purple-600 border-purple-200' };
      case 'started':
        return { icon: Play, bg: 'bg-amber-50 text-amber-600 border-amber-200' };
      case 'progress_updated':
        return { icon: TrendingUp, bg: 'bg-sky-50 text-sky-600 border-sky-200' };
      case 'status_changed':
        return { icon: RefreshCw, bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
      case 'completed':
        return { icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'edited':
      default:
        return { icon: Edit3, bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {activities.map((act) => {
        const { icon: Icon, bg } = getActivityIcon(act.type);

        return (
          <div key={act.id} className="relative group">
            {/* Dot / Icon Node */}
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full ${bg} border flex items-center justify-center shadow-xs transition-transform group-hover:scale-110`}
            >
              <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>

            {/* Content Card */}
            <div className="bg-white/90 p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {act.description}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  <span>{act.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <span>Updated by:</span>
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {act.updatedBy}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

