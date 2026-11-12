import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  Users, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { employeeService } from '../services/employeeService';

interface DashboardStatisticsProps {
  onSelectStat: (statId: string) => void;
}

export const DashboardStatistics: React.FC<DashboardStatisticsProps> = ({
  onSelectStat,
}) => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    upcomingDeadlines: 0,
    teamMembers: 0,
    completedTasks: 0,
  });

  useEffect(() => {
    Promise.all([
      projectService.getAllProjects(),
      taskService.getTasks(),
      employeeService.getEmployees(),
    ]).then(([projects, tasks, employees]) => {
      const activeProjects = projects.filter((p) => p.status !== 'Archived').length;
      const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
      const upcomingDeadlines = tasks.filter((t) => t.status !== 'Completed' && t.dueDate).length;
      const teamMembers = employees.filter((e) => e.accountStatus === 'Active').length;

      setStats({
        activeProjects,
        upcomingDeadlines,
        teamMembers,
        completedTasks,
      });
    }).catch(() => {});
  }, []);

  const statItems = [
    {
      id: 'assigned-projects',
      title: 'Assigned Projects',
      value: stats.activeProjects,
      icon: <ClipboardCheck className="w-5 h-5 text-slate-800 stroke-[2]" />,
      trend: 'Live updates',
    },
    {
      id: 'upcoming-deadlines',
      title: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines,
      icon: <Calendar className="w-5 h-5 text-slate-800 stroke-[2]" />,
      trend: 'Scheduled',
    },
    {
      id: 'active-members',
      title: 'Active Members',
      value: stats.teamMembers,
      icon: <Users className="w-5 h-5 text-slate-800 stroke-[2]" />,
      trend: 'In Team',
    },
    {
      id: 'completed-milestones',
      title: 'Tasks Finished',
      value: stats.completedTasks,
      icon: <CheckCircle2 className="w-5 h-5 text-slate-800 stroke-[2]" />,
      trend: 'Achieved',
    },
  ];

  return (
    <section className="pt-2 pb-5" aria-label="Work Statistics Overview">
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        {statItems.map((stat) => (
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
            <div>
              <div className="w-9 h-9 rounded-[14px] bg-slate-100 flex items-center justify-center mb-2.5 transition-colors group-hover:bg-blue-50">
                {stat.icon}
              </div>
              <p className="text-[12.5px] font-semibold text-slate-600 line-clamp-1 leading-snug">
                {stat.title}
              </p>
            </div>

            {/* Bottom row: Value + Indicator */}
            <div className="flex items-end justify-between mt-2">
              <span className="text-[26px] sm:text-[28px] font-extrabold text-slate-900 leading-none">
                {stat.value}
              </span>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
