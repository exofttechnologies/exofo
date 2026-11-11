import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Plus, 
  RotateCcw, 
  Sparkles,
  Inbox
} from 'lucide-react';
import { Task, ProjectEmployee, Project } from '../types';
import { taskService } from '../services/taskService';
import { allCompanyEmployees, currentProjects } from '../data/mockData';
import { TaskHeader } from '../components/tasks/TaskHeader';
import { TaskSummaryCard } from '../components/tasks/TaskSummaryCard';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskCard } from '../components/tasks/TaskCard';
import { FloatingAddButton } from '../components/tasks/FloatingAddButton';
import { NotificationsModal } from '../components/NotificationsModal';
import { ProfileDrawer } from '../components/ProfileDrawer';

export const TasksPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [employeeFilter, setEmployeeFilter] = useState<string>('All');
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [dueDateFilter, setDueDateFilter] = useState<string>('All');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState<boolean>(false);

  // Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Load Tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks({
        status: statusFilter,
        priority: priorityFilter,
        employee: employeeFilter,
        project: projectFilter,
        dueDate: dueDateFilter,
        search: search,
      });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter, employeeFilter, projectFilter, dueDateFilter, search]);

  // Overall counts for Summary Cards (based on full dataset)
  const [summaryData, setSummaryData] = useState({
    totalRunning: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    async function calculateSummaries() {
      const all = await taskService.getTasks();
      const pendingCount = all.filter((t) => t.status === 'Pending').length;
      const inProgressCount = all.filter((t) => t.status === 'In Progress').length;
      const completedCount = all.filter((t) => t.status === 'Completed').length;
      const runningCount = pendingCount + inProgressCount;

      setSummaryData({
        totalRunning: runningCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
      });
    }
    calculateSummaries();
  }, [tasks]);

  const handleResetFilters = () => {
    setStatusFilter('All');
    setPriorityFilter('All');
    setEmployeeFilter('All');
    setProjectFilter('All');
    setDueDateFilter('All');
    setSearch('');
  };

  return (
    <div className="w-full pb-32">
      {/* ------------------------------------------------------------------
          A. Header Section (Page Title, Search, Notifications, Avatar)
          ------------------------------------------------------------------ */}
      <TaskHeader
        title="Tasks"
        subtitle="Manage and monitor your ongoing tasks."
        searchValue={search}
        onSearchChange={setSearch}
        showSearch={true}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        actionButton={
          <button
            onClick={() => navigate('/tasks/create')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#1261E8] to-[#0645B5] text-white text-xs font-bold shadow-sm shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Task</span>
          </button>
        }
      />

      {/* ------------------------------------------------------------------
          B. Task Summary Cards (4 Cards)
          ------------------------------------------------------------------ */}
      <TaskSummaryCard
        data={summaryData}
        activeFilter={statusFilter}
        onFilterSelect={(status) => setStatusFilter(status)}
      />

      {/* ------------------------------------------------------------------
          C. Task Filters Bar & Tabs
          ------------------------------------------------------------------ */}
      <TaskFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        employeeFilter={employeeFilter}
        onEmployeeChange={setEmployeeFilter}
        projectFilter={projectFilter}
        onProjectChange={setProjectFilter}
        dueDateFilter={dueDateFilter}
        onDueDateChange={setDueDateFilter}
        employees={allCompanyEmployees}
        projects={currentProjects}
        onResetFilters={handleResetFilters}
        isExpanded={isFiltersExpanded}
        onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
        totalTasksCount={tasks.length}
      />

      {/* ------------------------------------------------------------------
          D. Task Cards Responsive Grid
             - Mobile: 1-col
             - Tablet: 2-col
             - Desktop: 3-col
          ------------------------------------------------------------------ */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-surface rounded-[24px] p-5 h-48" />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {tasks.map((task) => (
            <TaskCard key={task.id || task.taskId} task={task} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-surface rounded-[28px] p-8 sm:p-12 text-center max-w-md mx-auto my-6 border border-white/80">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Inbox className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No Tasks Found
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            No tasks match your current filter selection or search query.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
            <button
              onClick={() => navigate('/tasks/create')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1261E8] text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------
          E. Floating Add Task Button (Mobile & Desktop)
          ------------------------------------------------------------------ */}
      <FloatingAddButton label="Create New Task" />

      {/* Modals */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};
