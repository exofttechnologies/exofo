import React from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  Users, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { dashboardStatistics } from '../data/mockData';

interface DashboardStatisticsProps {
  onSelectStat: (statId: string) => void;
}

export const DashboardStatistics: React.FC<DashboardStatisticsProps> = ({
  onSelectStat,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'ClipboardCheck':
        return <ClipboardCheck className="w-5 h-5 text-slate-800 stroke-[2]" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-slate-800 stroke-[2]" />;
      case 'Users':
        return <Users className="w-5 h-5 text-slate-800 stroke-[2]" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-5 h-5 text-slate-800 stroke-[2]" />;
      default:
        return <ClipboardCheck className="w-5 h-5 text-slate-800 stroke-[2]" />;
    }
  };

  return (
    <section className="pt-2 pb-5" aria-label="Work Statistics Overview">
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        {dashboardStatistics.map((stat) => (
          <div
            key={stat.id}
            onClick={() => onSelectStat(stat.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectStat(stat.id);
              }
            }}
            className="group glass-surface stat-card-hover rounded-[22px] p-4 flex flex-col justify-between cursor-pointer select-none min-h-[114px]"
          >
            {/* Top row: Icon + Title */}
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0">
                {getIcon(stat.iconName)}
              </div>
              <span className="text-[13px] font-semibold text-slate-800 leading-tight">
                {stat.title}
              </span>
            </div>

            {/* Bottom row: Value + Arrow Button */}
            <div className="flex items-end justify-between mt-3">
              <span className="text-[26px] sm:text-[28px] font-bold text-slate-900 tracking-tight leading-none">
                {stat.value}
              </span>

              <div className="w-7 h-7 rounded-full bg-slate-100/90 flex items-center justify-center text-slate-700 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105 shadow-2xs">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

