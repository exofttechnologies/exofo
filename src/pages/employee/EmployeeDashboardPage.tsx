import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  RefreshCw, 
  UserCheck 
} from 'lucide-react';
import { employeeService, EmployeeDashboardData } from '../../services/employeeService';
import { EmployeeHeader } from '../../components/employee/EmployeeHeader';
import { EmployeeSummaryCards } from '../../components/employee/EmployeeSummaryCards';
import { EmployeeProjectsCard } from '../../components/employee/EmployeeProjectsCard';
import { EmployeeTodayTasksCard } from '../../components/employee/EmployeeTodayTasksCard';
import { EmployeeQuickActionsCard } from '../../components/employee/EmployeeQuickActionsCard';
import { EmployeeBottomNavigation } from '../../components/employee/EmployeeBottomNavigation';
import { NotificationsModal } from '../../components/NotificationsModal';
import { ProfileDrawer } from '../../components/ProfileDrawer';
import { Employee } from '../../types';

export const EmployeeDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Available employees for quick switching / testing
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => {
    return localStorage.getItem('exofo_employee_id') || 'emp-ahmed';
  });

  const loadData = async (empIdToLoad?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Determine active employee id or email from localStorage
      const storedEmail = localStorage.getItem('exofo_user_email');
      const targetId = empIdToLoad || selectedEmpId || storedEmail || 'emp-ahmed';

      const data = await employeeService.getEmployeeDashboard(targetId);
      setDashboardData(data);

      // Load active employees list for switcher (ensure active user like Ahmed is always visible)
      const emps = await employeeService.getEmployees({ status: 'Active' });
      setAvailableEmployees(emps);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSwitchEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    localStorage.setItem('exofo_employee_id', empId);
    loadData(empId);
  };

  return (
    <div 
      className="min-h-screen w-full bg-[#F7F9FC] text-slate-900 relative antialiased"
      style={{
        backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.08) 1.25px, transparent 1.25px)',
        backgroundSize: '22px 22px',
      }}
    >
      {/* ------------------------------------------------------------------
          Abstract Ambient Flowing Colors (Behind Selected Sections)
          ------------------------------------------------------------------ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        {/* Deep Blue ambient glow (top right) */}
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-blue-500/10 blur-[120px]" />
        {/* Soft Coral / Red ambient accent (middle left) */}
        <div className="absolute top-1/3 -left-32 w-[460px] h-[460px] rounded-full bg-rose-500/8 blur-[130px]" />
        {/* Dark Navy / Slate ambient shadow (bottom right) */}
        <div className="absolute bottom-10 right-1/4 w-[420px] h-[420px] rounded-full bg-slate-900/6 blur-[140px]" />
      </div>

      {/* Main Responsive Canvas */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* 1. Header Section */}
        <EmployeeHeader
          employee={dashboardData?.employee || null}
          unreadCount={dashboardData?.unreadNotifications ?? 2}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Optional Employee Switcher Pill Bar for Testing */}
        {availableEmployees.length > 0 && (
          <div className="mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Workspace Account:</span>
            </span>
            {availableEmployees.map((emp) => {
              const isSelected =
                dashboardData?.employee.id === emp.id ||
                dashboardData?.employee.employeeId === emp.employeeId;

              return (
                <button
                  key={emp.id}
                  onClick={() => handleSwitchEmployee(emp.id)}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-all flex-shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white/70 hover:bg-white text-slate-600 border border-slate-200/70'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{emp.name}</span>
                  <span className="text-[10px] font-medium opacity-60">({emp.department})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData()}
              className="px-3 py-1 bg-white rounded-xl border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !dashboardData && (
          <div className="space-y-6 animate-pulse">
            <div className="h-14 w-80 bg-slate-200/60 rounded-2xl mb-6" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white/60 rounded-[24px]" />
              ))}
            </div>
            <div className="h-64 bg-white/60 rounded-[28px]" />
          </div>
        )}

        {dashboardData && (
          <>
            {/* 2. Welcome Greeting */}
            <section className="mb-8 select-none">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome back,{' '}
                <span className="text-slate-900 font-black underline decoration-blue-500/40 decoration-4 underline-offset-4">
                  {dashboardData.employee.name}
                </span>
                !
              </h1>
              <p className="text-sm sm:text-base font-semibold text-slate-500 mt-1.5">
                Here's your work overview.
              </p>
            </section>

            {/* 3. Work Summary Cards */}
            <EmployeeSummaryCards counts={dashboardData.counts} />

            {/* 4. My Projects Section */}
            <EmployeeProjectsCard projects={dashboardData.assignedProjects} />

            {/* 5. Today's Tasks & Quick Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Today's Tasks (7 cols on desktop) */}
              <div className="lg:col-span-7 h-full">
                <EmployeeTodayTasksCard tasks={dashboardData.todayTasks} />
              </div>

              {/* Quick Actions (5 cols on desktop) */}
              <div className="lg:col-span-5 h-full">
                <EmployeeQuickActionsCard />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 6. Floating Pill Bottom Navigation Bar */}
      <EmployeeBottomNavigation />

      {/* Modals & Profile Drawer */}
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

