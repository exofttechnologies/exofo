import React from 'react';
import { Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { ProjectEmployee, Project } from '../../types';

interface TaskFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  employeeFilter: string;
  onEmployeeChange: (employee: string) => void;
  projectFilter: string;
  onProjectChange: (project: string) => void;
  dueDateFilter: string;
  onDueDateChange: (dueDate: string) => void;
  employees: ProjectEmployee[];
  projects: Project[];
  onResetFilters: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  totalTasksCount: number;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  employeeFilter,
  onEmployeeChange,
  projectFilter,
  onProjectChange,
  dueDateFilter,
  onDueDateChange,
  employees,
  projects,
  onResetFilters,
  isExpanded,
  onToggleExpanded,
  totalTasksCount,
}) => {
  const statusTabs = [
    { id: 'All', label: 'All Tasks' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Pending', label: 'Pending' },
    { id: 'Completed', label: 'Completed' },
  ];

  const hasActiveSecondaryFilters =
    priorityFilter !== 'All' ||
    employeeFilter !== 'All' ||
    projectFilter !== 'All' ||
    dueDateFilter !== 'All';

  return (
    <div className="mb-6 space-y-3">
      {/* Primary Status Tabs Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/70 border border-slate-200/80 shadow-2xs overflow-x-auto max-w-full">
          {statusTabs.map((tab) => {
            const isActive = statusFilter.toLowerCase() === tab.id.toLowerCase();
            return (
              <button
                key={tab.id}
                onClick={() => onStatusChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1261E8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleExpanded}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
              isExpanded || hasActiveSecondaryFilters
                ? 'bg-blue-50 text-[#1261E8] border-blue-200 shadow-2xs'
                : 'bg-white/80 text-slate-700 border-slate-200/80 hover:bg-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveSecondaryFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {hasActiveSecondaryFilters && (
            <button
              onClick={onResetFilters}
              title="Reset all filters"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 bg-white/60 border border-slate-200/60 hover:bg-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Secondary Filters Drawer / Bar */}
      {isExpanded && (
        <div className="glass-surface rounded-[22px] p-4 border border-white/80 shadow-xs animate-fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Priority Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* 2. Assigned Employee */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Assigned Employee
            </label>
            <select
              value={employeeFilter}
              onChange={(e) => onEmployeeChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} ({emp.designation})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Project Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Project
            </label>
            <select
              value={projectFilter}
              onChange={(e) => onProjectChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Projects</option>
              <option value="independent">Independent Tasks (No Project)</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name} ({proj.projectCode})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Due Date Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <select
              value={dueDateFilter}
              onChange={(e) => onDueDateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">Any Due Date</option>
              <option value="overdue">Overdue</option>
              <option value="this-week">Due This Week</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

