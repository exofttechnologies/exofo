import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  CheckSquare, 
  Clock, 
  Circle, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import { employeeService, EmployeeDashboardData } from '../../services/employeeService';
import { taskService } from '../../services/taskService';
import { EmployeeHeader } from '../../components/employee/EmployeeHeader';
import { EmployeeBottomNavigation } from '../../components/employee/EmployeeBottomNavigation';
import { NotificationsModal } from '../../components/NotificationsModal';
import { ProfileDrawer } from '../../components/ProfileDrawer';
import { Task, TaskStatus } from '../../types';

export const EmployeeTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const storedId = localStorage.getItem('exofo_employee_id') || 'emp-ahmed';
        const data = await employeeService.getEmployeeDashboard(storedId);
        setDashboardData(data);
        setTasks(data.assignedTasks);
      } catch (err) {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const s = searchParams.get('status');
    if (s) setStatusFilter(s);
  }, [searchParams]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    if (status === 'All') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ status });
    }
  };

  const handleUpdateStatus = async (task: Task, newStatus: TaskStatus) => {
    const newProgress = newStatus === 'Completed' ? 100 : newStatus === 'In Progress' && task.progress === 0 ? 25 : task.progress;
    
    // Update local state immediately
    const updatedTasks = tasks.map((t) =>
      t.id === task.id || t.taskId === task.taskId
        ? { ...t, status: newStatus, progress: newProgress }
        : t
    );
    setTasks(updatedTasks);

    try {
      await taskService.updateTask(task.id || task.taskId, {
        status: newStatus,
        progress: newProgress,
      });
      setToastMessage(`Task "${task.taskName}" updated to ${newStatus}!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      // ignore
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesSearch =
      t.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.projectName && t.projectName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const counts = {
    all: tasks.length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
  };

  return (
    <div
      className="min-h-screen w-full bg-[#F7F9FC] text-slate-900 relative antialiased"
      style={{
        backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.08) 1.25px, transparent 1.25px)',
        backgroundSize: '22px 22px',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -left-32 w-[450px] h-[450px] rounded-full bg-indigo-500/8 blur-[130px]" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Header */}
        <EmployeeHeader
          employee={dashboardData?.employee || null}
          unreadCount={dashboardData?.unreadNotifications ?? 2}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/employee/dashboard')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="mb-7">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Assigned Tasks
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Track your personal task deliverables, update progress percentages, and log status transitions.
          </p>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-7">
          {[
            { label: 'All Tasks', count: counts.all, filter: 'All', icon: CheckSquare, color: 'text-slate-800' },
            { label: 'In Progress', count: counts.inProgress, filter: 'In Progress', icon: Clock, color: 'text-blue-600' },
            { label: 'Pending', count: counts.pending, filter: 'Pending', icon: Circle, color: 'text-amber-600' },
            { label: 'Completed', count: counts.completed, filter: 'Completed', icon: CheckCircle2, color: 'text-emerald-600' },
          ].map((card) => {
            const Icon = card.icon;
            const isSelected = statusFilter === card.filter;

            return (
              <div
                key={card.label}
                onClick={() => handleStatusFilterChange(card.filter)}
                role="button"
                tabIndex={0}
                className={`p-4 rounded-[22px] border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-white border-blue-400 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white/75 hover:bg-white border-white/90 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500">{card.label}</span>
                  <Icon className={`w-4 h-4 ${card.color} stroke-[2.2]`} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {card.count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 sm:p-5 rounded-[24px] bg-white/70 backdrop-blur-xl border border-white/90 shadow-2xs mb-6 space-y-3.5">
          {/* Status Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', 'In Progress', 'Pending', 'Completed'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusFilterChange(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search + Priority Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks by name, ID (e.g. TSK001), or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="p-12 rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/90 text-center">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Matching Tasks Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'Completed';

              return (
                <div
                  key={task.id}
                  className="group relative pt-4 select-none stat-card-hover transition-all"
                >
                  {/* Folder Tab with Task ID & Priority */}
                  <div className="absolute top-0 left-4 z-10 flex items-center gap-2 px-3.5 py-1 rounded-t-[14px] bg-white/90 backdrop-blur-md border border-b-0 border-white/90 shadow-2xs">
                    <span className="text-[11px] font-extrabold text-blue-600">
                      {task.taskId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        task.priority === 'High'
                          ? 'bg-rose-50 text-rose-600'
                          : task.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {/* Main Task Card */}
                  <div className="rounded-[26px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/90 p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:border-blue-200 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Task Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            onClick={() => navigate(`/tasks/${task.id || task.taskId}`)}
                            className={`text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors ${
                              isCompleted ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.taskName}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-3">
                          {task.description}
                        </p>

                        {/* Meta Tags */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap">
                          {task.projectName && (
                            <span className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                              <Layers className="w-3.5 h-3.5" />
                              <span>{task.projectName}</span>
                            </span>
                          )}

                          {task.dueDate && (
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>Due {task.dueDate}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Progress & Status Changer */}
                      <div className="flex flex-col sm:items-end justify-between gap-3 sm:w-56 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Status Quick Changer */}
                        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
                          {(['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => handleUpdateStatus(task, s)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                task.status === s
                                  ? s === 'Completed'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : s === 'In Progress'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'bg-slate-700 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {s === 'In Progress' ? 'Progress' : s}
                            </button>
                          ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full">
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className="text-[11px] text-slate-400">Progress</span>
                            <span className="text-slate-900">{task.progress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Details Link */}
                        <button
                          onClick={() => navigate(`/tasks/${task.id || task.taskId}`)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 self-end mt-1"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Bottom Navigation */}
      <EmployeeBottomNavigation />

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
