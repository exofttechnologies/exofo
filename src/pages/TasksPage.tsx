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
import { projectService } from '../services/projectService';
import { employeeService } from '../services/employeeService';
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

  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

  // Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    employeeService.getEmployees().then(setAvailableEmployees).catch(() => {});
    projectService.getAllProjects().then(setAvailableProjects).catch(() => {});
  }, []);

  // Load Tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks({
        status: statusFilter,
        priority: priorityFilter,
        assignedEmployeeId: employeeFilter !== 'All' ? employeeFilter : undefined,
        projectId: projectFilter !== 'All' ? projectFilter : undefined,
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

  // Overall counts for Summary Cards
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
      {/* Header Section */}
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

      {/* Task Summary Cards */}
      <TaskSummaryCard
        data={summaryData}
        activeFilter={statusFilter}
        onFilterSelect={(status) => setStatusFilter(status)}
      />

      {/* Task Filters Bar */}
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
        employees={availableEmployees}
        projects={availableProjects}
        onResetFilters={handleResetFilters}
        isExpanded={isFiltersExpanded}
        onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
        totalTasksCount={tasks.length}
      />

      {/* Task Cards Responsive Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-semibold text-sm">
          Loading tasks from MongoDB...
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-surface rounded-[26px] p-12 text-center border border-dashed border-slate-200">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No Tasks Found</h3>
          <p className="text-xs text-slate-400 mb-5">
            {search ? 'Try adjusting your search filters.' : 'There are no tasks matching your selection.'}
          </p>
          <button
            onClick={() => navigate('/tasks/create')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Task</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id || task.taskId} task={task} />
          ))}
        </div>
      )}

      <FloatingAddButton onClick={() => navigate('/tasks/create')} />

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
