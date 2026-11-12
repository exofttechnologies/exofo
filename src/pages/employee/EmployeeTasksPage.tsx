import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckSquare,
  Clock,
  Circle,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  Layers,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  X,
} from 'lucide-react';
import { taskService, EmployeeTasksSummary } from '../../services/taskService';
import { EmployeeHeader } from '../../components/employee/EmployeeHeader';
import { EmployeeBottomNavigation } from '../../components/employee/EmployeeBottomNavigation';
import { NotificationsModal } from '../../components/NotificationsModal';
import { TaskStatusBadge } from '../../components/tasks/TaskStatusBadge';
import { TaskPriorityBadge } from '../../components/tasks/TaskPriorityBadge';
import { TaskProgressBar } from '../../components/tasks/TaskProgressBar';
import { Employee, Task } from '../../types';

const STATUS_FILTERS = ['All', 'Pending', 'In Progress', 'Completed'] as const;

const TASK_CARD_TEXTURES = [
  { glow: 'from-blue-500/16 via-sky-400/6 to-transparent', tabDot: 'bg-blue-600' },
  { glow: 'from-rose-500/14 via-red-400/6 to-transparent', tabDot: 'bg-rose-500' },
  { glow: 'from-slate-900/14 via-slate-500/6 to-transparent', tabDot: 'bg-slate-900' },
  { glow: 'from-slate-500/16 via-zinc-300/10 to-transparent', tabDot: 'bg-slate-500' },
];

export const EmployeeTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allProjectOptions, setAllProjectOptions] = useState<{ key: string; label: string }[]>([]);
  const [summary, setSummary] = useState<EmployeeTasksSummary>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [dueDateMode, setDueDateMode] = useState<'All' | 'overdue' | 'date'>('All');
  const [customDueDate, setCustomDueDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const s = searchParams.get('status');
    if (s && s !== statusFilter) {
      setStatusFilter(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const activeDueDateFilter =
    dueDateMode === 'overdue'
      ? 'overdue'
      : dueDateMode === 'date' && customDueDate
      ? customDueDate
      : 'All';

  const fetchAssignedTasks = useCallback(
    async (isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setIsFiltering(true);
        }
        setError(null);

        const activeIdentifier =
          localStorage.getItem('exofo_employee_id') ||
          localStorage.getItem('exofo_user_email') ||
          'emp-ahmed';

        const response = await taskService.getEmployeeTasks(activeIdentifier, {
          status: statusFilter,
          priority: priorityFilter,
          project: projectFilter,
          dueDate: activeDueDateFilter,
          search: debouncedSearch,
        });

        setEmployee(response.employee);
        setSummary(response.summary);
        setTasks(response.tasks);

        // Collect unique project options on unfiltered/initial load so dropdown stays stable
        if (projectFilter === 'All' && statusFilter === 'All' && priorityFilter === 'All' && !debouncedSearch && activeDueDateFilter === 'All') {
          const seen = new Map<string, string>();
          response.tasks.forEach((t) => {
            if (!t.isIndependent && t.projectName) {
              const key = t.projectCode || t.projectId || t.projectName;
              seen.set(key, t.projectName);
            }
          });
          setAllProjectOptions(
            Array.from(seen.entries()).map(([key, label]) => ({ key, label }))
          );
        }
      } catch (err: any) {
        setError(err.message || 'Unable to load your assigned tasks.');
      } finally {
        setLoading(false);
        setIsFiltering(false);
      }
    },
    [statusFilter, priorityFilter, projectFilter, activeDueDateFilter, debouncedSearch]
  );

  useEffect(() => {
    fetchAssignedTasks(tasks.length === 0 && loading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, projectFilter, activeDueDateFilter, debouncedSearch]);

  const handleStatusFilterChange = (nextStatus: string) => {
    setStatusFilter(nextStatus);
    if (nextStatus === 'All') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ status: nextStatus });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setPriorityFilter('All');
    setProjectFilter('All');
    setDueDateMode('All');
    setCustomDueDate('');
    handleStatusFilterChange('All');
  };

  const hasActiveFilters =
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    projectFilter !== 'All' ||
    dueDateMode !== 'All' ||
    debouncedSearch.trim() !== '';

  const summaryCards = [
    {
      id: 'total',
      label: 'Total Tasks',
      count: summary.total,
      filterValue: 'All',
      icon: CheckSquare,
      tabDot: 'bg-blue-600',
      iconColor: 'text-blue-600',
      glow: 'from-blue-500/18 via-blue-400/5 to-transparent',
    },
    {
      id: 'pending',
      label: 'Pending',
      count: summary.pending,
      filterValue: 'Pending',
      icon: Circle,
      tabDot: 'bg-slate-600',
      iconColor: 'text-slate-600',
      glow: 'from-slate-500/16 via-slate-300/6 to-transparent',
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      count: summary.inProgress,
      filterValue: 'In Progress',
      icon: Clock,
      tabDot: 'bg-rose-500',
      iconColor: 'text-rose-600',
      glow: 'from-rose-500/16 via-amber-400/5 to-transparent',
    },
    {
      id: 'completed',
      label: 'Completed',
      count: summary.completed,
      filterValue: 'Completed',
      icon: CheckCircle2,
      tabDot: 'bg-slate-900',
      iconColor: 'text-emerald-600',
      glow: 'from-slate-900/14 via-emerald-400/8 to-transparent',
    },
  ];

  return (
    <div
      className="min-h-screen w-full bg-[#F7F9FC] text-slate-900 relative antialiased overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.08) 1.25px, transparent 1.25px)',
        backgroundSize: '22px 22px',
      }}
    >
      {/* Abstract Ambient Flowing Colour Textures */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute -top-32 -right-28 w-[520px] h-[520px] rounded-full bg-blue-500/10 blur-[125px]" />
        <div className="absolute top-1/3 -left-32 w-[460px] h-[460px] rounded-full bg-rose-500/8 blur-[130px]" />
        <div className="absolute bottom-12 right-1/4 w-[420px] h-[420px] rounded-full bg-slate-900/7 blur-[140px]" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Top Bar */}
        <EmployeeHeader
          employee={employee}
          unreadCount={2}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => navigate('/employee/profile')}
        />

        {/* Page Title directly on dotted background (not inside a card) */}
        <section className="mb-7 select-none">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            My Tasks
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-500 mt-1">
            Manage and track your assigned tasks.
          </p>
        </section>

        {/* 4 Summary Folder Cards (4 in 1 row desktop, 2 per row mobile) */}
        <section aria-label="Task Summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-7">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            const isSelected = statusFilter === card.filterValue;

            return (
              <div
                key={card.id}
                onClick={() => handleStatusFilterChange(card.filterValue)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleStatusFilterChange(card.filterValue);
                  }
                }}
                role="button"
                tabIndex={0}
                className="group relative pt-3.5 cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="absolute top-0 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-t-[12px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${card.tabDot}`} />
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 tracking-tight whitespace-nowrap">
                    {card.label}
                  </span>
                </div>

                <div
                  className={`relative overflow-hidden rounded-[22px] rounded-tl-[6px] bg-white/75 backdrop-blur-xl p-4 sm:p-5 transition-all ${
                    isSelected
                      ? 'border border-slate-900/20 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/10'
                      : 'border border-white/95 shadow-[0_8px_28px_rgba(0,0,0,0.03)] group-hover:border-white'
                  }`}
                >
                  <div
                    className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.glow} blur-xl pointer-events-none`}
                  />
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                        {loading ? '—' : card.count}
                      </div>
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1.5">
                        {card.label}
                      </p>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/90 border border-slate-200/70 flex items-center justify-center flex-shrink-0 shadow-2xs">
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.iconColor} stroke-[2]`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Search & Filters Card */}
        <section
          aria-label="Task Search and Filters"
          className="rounded-[26px] bg-white/70 backdrop-blur-xl border border-white/90 p-4 sm:p-5 shadow-[0_10px_32px_rgba(0,0,0,0.03)] mb-7 space-y-3.5"
        >
          {/* Full-width Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by task name, task ID (e.g. TSK001), or project name..."
              aria-label="Search assigned tasks"
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/85 border border-slate-200/80 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900/30 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontally Scrollable Status Filter Pills */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 flex-1">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusFilterChange(s)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                    statusFilter === s
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white/85 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {isFiltering && (
              <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                Updating...
              </span>
            )}
          </div>

          {/* Additional Filters: Priority, Project, Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/85 border border-slate-200/80 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {/* Project */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              aria-label="Filter by project"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/85 border border-slate-200/80 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Projects</option>
              {allProjectOptions.map((proj) => (
                <option key={proj.key} value={proj.key}>
                  {proj.label}
                </option>
              ))}
              <option value="independent">Independent Tasks</option>
            </select>

            {/* Due Date */}
            <div className="flex items-center gap-2">
              <select
                value={dueDateMode}
                onChange={(e) => {
                  const val = e.target.value as 'All' | 'overdue' | 'date';
                  setDueDateMode(val);
                  if (val !== 'date') setCustomDueDate('');
                }}
                aria-label="Filter by due date"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/85 border border-slate-200/80 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">All Due Dates</option>
                <option value="overdue">Overdue Only</option>
                <option value="date">Specific Date</option>
              </select>

              {dueDateMode === 'date' && (
                <input
                  type="date"
                  value={customDueDate}
                  onChange={(e) => setCustomDueDate(e.target.value)}
                  aria-label="Select due date"
                  className="px-2.5 py-2 rounded-xl bg-white/90 border border-slate-200/80 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              )}
            </div>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="mb-7 p-5 rounded-[24px] bg-white/80 backdrop-blur-xl border border-rose-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Could not load tasks</p>
                <p className="text-xs font-medium text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchAssignedTasks(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading State: Skeleton Folder Cards */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="relative pt-4">
                <div className="absolute top-0 left-4 w-24 h-6 rounded-t-[12px] bg-white/70 border border-b-0 border-white/80" />
                <div className="rounded-[26px] rounded-tl-[8px] bg-white/65 border border-white/80 p-5 space-y-4 h-52">
                  <div className="h-5 w-2/3 bg-slate-200/70 rounded-lg" />
                  <div className="h-10 w-full bg-slate-200/50 rounded-xl" />
                  <div className="h-2.5 w-full bg-slate-200/60 rounded-full" />
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-slate-200/60 rounded-lg" />
                    <div className="h-4 w-20 bg-slate-200/60 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tasks.length === 0 && (
          <div className="relative pt-4">
            <div className="absolute top-0 left-5 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/90">
              <FolderOpen className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[11px] font-bold text-slate-700">Tasks Folder</span>
            </div>

            <div className="rounded-[28px] rounded-tl-[8px] bg-white/70 backdrop-blur-xl border border-white/90 p-10 sm:p-14 text-center shadow-[0_12px_36px_rgba(0,0,0,0.03)]">
              <div className="w-14 h-14 rounded-2xl bg-slate-100/90 border border-slate-200/70 flex items-center justify-center mx-auto mb-4 text-slate-500">
                <CheckSquare className="w-7 h-7 stroke-[1.7]" />
              </div>

              {summary.total === 0 || !hasActiveFilters ? (
                <>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    No tasks assigned yet
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1.5">
                    Your assigned tasks will appear here.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    No matching tasks found
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1.5 mb-5">
                    Try adjusting your search keywords or active filters.
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Task Cards Responsive Grid */}
        {!loading && !error && tasks.length > 0 && (
          <section
            aria-label="Assigned Tasks Listing"
            className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
          >
            {tasks.map((task, idx) => {
              const texture = TASK_CARD_TEXTURES[idx % TASK_CARD_TEXTURES.length];
              const isCompleted = task.status === 'Completed';
              const overdue = taskService.isOverdue(task.dueDate, task.status);

              return (
                <article
                  key={task.id}
                  onClick={() => navigate(`/employee/tasks/${task.id || task.taskId}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/employee/tasks/${task.id || task.taskId}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View task ${task.taskName}`}
                  className="group relative pt-4 cursor-pointer select-none flex flex-col transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
                >
                  {/* Folder Top Tab: Task ID + Overdue Warning Badge if applicable */}
                  <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-t-[14px] bg-white/90 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                    <span className={`w-1.5 h-1.5 rounded-full ${texture.tabDot}`} />
                    <span className="text-[11px] font-extrabold text-slate-800 tracking-wide">
                      {task.taskId}
                    </span>
                    {overdue && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.2 rounded-full border border-rose-200">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Overdue</span>
                      </span>
                    )}
                  </div>

                  {/* Frosted-Glass Front Card */}
                  <div
                    className={`relative overflow-hidden rounded-[26px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border p-5 sm:p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] group-hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] group-hover:bg-white/90 transition-all flex-1 flex flex-col justify-between ${
                      overdue ? 'border-rose-200/80' : 'border-white/95'
                    }`}
                  >
                    <div
                      className={`absolute -top-12 -right-10 w-44 h-44 rounded-full bg-gradient-to-br ${texture.glow} blur-2xl pointer-events-none opacity-85`}
                      aria-hidden="true"
                    />

                    {/* Top Content */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <h3
                          className={`text-base sm:text-lg font-extrabold tracking-tight group-hover:text-[#1261E8] transition-colors ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.taskName}
                        </h3>

                        <div className="w-7 h-7 rounded-full bg-white/90 border border-slate-200/70 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all flex-shrink-0 shadow-2xs">
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.3]" />
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed mb-4 min-h-[2.25rem]">
                        {task.description || 'No additional instructions provided.'}
                      </p>

                      {/* Badges Row: Status + Priority + Overdue indicator */}
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <TaskStatusBadge status={task.status} />
                        <TaskPriorityBadge priority={task.priority} />
                        {overdue && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Due Passed</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Progress Bar & Meta */}
                    <div className="relative z-10 pt-3.5 border-t border-slate-200/60 space-y-3">
                      <TaskProgressBar progress={task.progress} size="sm" />

                      <div className="flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-500 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100/80 px-2.5 py-0.5 rounded-full">
                          <Layers className="w-3 h-3 text-blue-600" />
                          <span>{task.projectName || 'Independent Task'}</span>
                        </span>

                        {task.dueDate && (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              overdue ? 'text-rose-600 font-bold' : 'text-slate-500'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Due {task.dueDate}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {/* Floating Bottom Navigation (Tasks Active) */}
      <EmployeeBottomNavigation />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};
