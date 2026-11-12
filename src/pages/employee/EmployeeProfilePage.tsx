import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  ShieldCheck,
  Edit3,
  Key,
  Bell,
  LogOut,
  ChevronRight,
  Layers,
  Clock,
  CheckCircle2,
  Lock,
  UserCheck,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { employeeService, EmployeeProfileData } from '../../services/employeeService';
import { EmployeeHeader } from '../../components/employee/EmployeeHeader';
import { EmployeeBottomNavigation } from '../../components/employee/EmployeeBottomNavigation';
import { NotificationsModal } from '../../components/NotificationsModal';

export const EmployeeProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<EmployeeProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const activeIdentifier =
        localStorage.getItem('exofo_employee_id') ||
        localStorage.getItem('exofo_user_email') ||
        'emp-ahmed';

      const data = await employeeService.getEmployeeProfile(activeIdentifier);
      setProfileData(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load your employee profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleConfirmLogout = () => {
    localStorage.removeItem('exofo_auth');
    localStorage.removeItem('exofo_token');
    localStorage.removeItem('exofo_employee_id');
    localStorage.removeItem('exofo_employee_code');
    localStorage.removeItem('exofo_user_role');
    localStorage.removeItem('exofo_user_email');
    localStorage.removeItem('exofo_user_name');
    setIsLogoutConfirmOpen(false);
    navigate('/login');
  };

  const employee = profileData?.employee || null;
  const workSummary = profileData?.workSummary || {
    assignedProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
  };

  const summaryCards = [
    {
      id: 'assigned-projects',
      label: 'Assigned Projects',
      count: workSummary.assignedProjects,
      icon: Layers,
      path: '/employee/projects',
      tabDot: 'bg-blue-600',
      iconColor: 'text-blue-600',
      glow: 'from-blue-500/18 via-blue-400/5 to-transparent',
    },
    {
      id: 'active-tasks',
      label: 'Active Tasks',
      count: workSummary.activeTasks,
      icon: Clock,
      path: '/employee/tasks?status=In Progress',
      tabDot: 'bg-rose-500',
      iconColor: 'text-rose-600',
      glow: 'from-rose-500/15 via-slate-800/5 to-transparent',
    },
    {
      id: 'completed-tasks',
      label: 'Completed Tasks',
      count: workSummary.completedTasks,
      icon: CheckCircle2,
      path: '/employee/tasks?status=Completed',
      tabDot: 'bg-slate-900',
      iconColor: 'text-emerald-600',
      glow: 'from-slate-900/15 via-slate-400/10 to-transparent',
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

      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Top Bar */}
        <EmployeeHeader
          employee={employee}
          unreadCount={2}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => navigate('/employee/profile')}
        />

        {/* Page Title directly on dotted background */}
        <section className="mb-7 select-none">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            My Profile
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-500 mt-1">
            Manage your personal information and account settings.
          </p>
        </section>

        {/* Error State */}
        {error && (
          <div className="mb-7 p-5 rounded-[24px] bg-white/80 backdrop-blur-xl border border-rose-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Unable to load profile</p>
                <p className="text-xs font-medium text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadProfile}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !error && (
          <div className="space-y-6 animate-pulse">
            <div className="h-44 rounded-[28px] bg-white/70 border border-white/80" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 rounded-[28px] bg-white/70 border border-white/80" />
              <div className="h-64 rounded-[28px] bg-white/70 border border-white/80" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-28 rounded-[24px] bg-white/70" />
              <div className="h-28 rounded-[24px] bg-white/70" />
              <div className="h-28 rounded-[24px] bg-white/70" />
            </div>
          </div>
        )}

        {/* Loaded Profile View */}
        {!loading && !error && employee && (
          <div className="space-y-7">
            {/* ── 1. Employee Profile Overview Folder Card ── */}
            <section className="relative pt-4 select-none">
              <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span className="text-[11px] font-extrabold text-slate-800 tracking-wide">
                  {employee.employeeId}
                </span>
              </div>

              <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-7 shadow-[0_14px_38px_rgba(15,23,42,0.04),0_2px_6px_rgba(15,23,42,0.02)]">
                {/* Subtle Abstract Texture Accents */}
                <div
                  className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/18 via-sky-400/10 to-transparent blur-2xl pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute -bottom-16 -left-12 w-56 h-56 rounded-full bg-gradient-to-tr from-rose-500/12 via-slate-400/10 to-transparent blur-2xl pointer-events-none"
                  aria-hidden="true"
                />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                    {/* Profile Image / Initials */}
                    {employee.avatar ? (
                      <img
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-[24px] object-cover ring-4 ring-white shadow-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-[24px] bg-gradient-to-tr from-slate-900 via-[#162569] to-[#1261E8] text-white flex items-center justify-center font-black text-2xl sm:text-3xl ring-4 ring-white shadow-md flex-shrink-0">
                        {employee.initials || employee.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                          {employee.name}
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            employee.accountStatus === 'Active'
                              ? 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80'
                              : 'bg-rose-50/90 text-rose-700 border-rose-200/80'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              employee.accountStatus === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{employee.accountStatus}</span>
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">
                        {employee.designation}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-1 flex-wrap">
                        <span>{employee.department}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-blue-600 font-bold">{employee.employeeId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Profile Action Button */}
                  <button
                    type="button"
                    onClick={() => navigate('/employee/profile/edit')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 flex-shrink-0"
                  >
                    <Edit3 className="w-4 h-4 stroke-[2.2]" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </section>

            {/* ── 2. Personal Information & Employment Details (Two Columns on Desktop) ── */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Card A: Personal Information */}
              <div className="relative pt-4 flex flex-col">
                <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                  <User className="w-3.5 h-3.5 text-blue-600 stroke-[2.2]" />
                  <span className="text-[11px] font-bold text-slate-800">Personal Info</span>
                </div>

                <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] flex-1 flex flex-col justify-between">
                  <div
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-blue-500/12 via-sky-300/5 to-transparent blur-2xl pointer-events-none"
                    aria-hidden="true"
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/60">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                        Personal Information
                      </h3>
                      <button
                        type="button"
                        onClick={() => navigate('/employee/profile/edit')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    <dl className="space-y-3.5">
                      <div className="flex items-start justify-between gap-4 py-1">
                        <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2 flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Full Name</span>
                        </dt>
                        <dd className="text-xs sm:text-sm font-bold text-slate-900 text-right truncate">
                          {employee.name}
                        </dd>
                      </div>

                      <div className="flex items-start justify-between gap-4 py-1 border-t border-slate-100">
                        <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2 flex-shrink-0">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>Email Address</span>
                        </dt>
                        <dd className="text-xs sm:text-sm font-bold text-slate-900 text-right truncate">
                          {employee.email}
                        </dd>
                      </div>

                      <div className="flex items-start justify-between gap-4 py-1 border-t border-slate-100">
                        <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2 flex-shrink-0">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mobile Number</span>
                        </dt>
                        <dd className="text-xs sm:text-sm font-bold text-slate-900 text-right truncate">
                          {employee.phone || 'Not provided'}
                        </dd>
                      </div>

                      {employee.dateOfBirth && (
                        <div className="flex items-start justify-between gap-4 py-1 border-t border-slate-100">
                          <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2 flex-shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Date of Birth</span>
                          </dt>
                          <dd className="text-xs sm:text-sm font-bold text-slate-900 text-right">
                            {employee.dateOfBirth}
                          </dd>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-4 py-1 border-t border-slate-100">
                        <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2 flex-shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Address</span>
                        </dt>
                        <dd className="text-xs sm:text-sm font-bold text-slate-900 text-right max-w-[60%]">
                          {employee.address || 'Not added yet'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Card B: Employment Details (Strictly Read-Only) */}
              <div className="relative pt-4 flex flex-col">
                <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                  <Briefcase className="w-3.5 h-3.5 text-slate-800 stroke-[2.2]" />
                  <span className="text-[11px] font-bold text-slate-800">Employment Record</span>
                </div>

                <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] flex-1 flex flex-col justify-between">
                  <div
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-slate-900/12 via-slate-400/5 to-transparent blur-2xl pointer-events-none"
                    aria-hidden="true"
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/60">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                        Employment Details
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100/90 px-2.5 py-1 rounded-full border border-slate-200/70">
                        <Lock className="w-3 h-3" />
                        <span>Read Only</span>
                      </span>
                    </div>

                    <dl className="space-y-3.5">
                      <div className="flex items-start justify-between gap-4 py-1">
                        <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2 flex-shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Employee ID</span>
                        </dt>
                        <dd className="text-xs sm:text-sm font-extrabold text-blue-600 text-right">
                          {employee.employeeId}
                        </dd>
                      </div>

                      <div className="flex items-start justify-between gap-4 py-1 border-t border-slate-100">
                        <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2 flex-shrink-0">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>Designation</span>
                        </dt>
                        <dd className="text-xs sm:text-sm font-bold text-slate-900 text-right">
                          {employee.designation}
                        </dd>
                      </div>

                      <div className="flex items-start justify-between gap-4 py-1 border-t border-slate-100">
                        <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2 flex-shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Department</span>
                        </dt>
                        <dd className="text-xs sm:text-sm font-bold text-slate-900 text-right">
                          {employee.department}
                        </dd>
                      </div>

                      <div className="flex items-start justify-between gap-4 py-1 border-t border-slate-100">
                        <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2 flex-shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Joining Date</span>
                        </dt>
                        <dd className="text-xs sm:text-sm font-bold text-slate-900 text-right">
                          {employee.joiningDate}
                        </dd>
                      </div>

                      <div className="flex items-start justify-between gap-4 py-1 border-t border-slate-100">
                        <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2 flex-shrink-0">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Employment Status</span>
                        </dt>
                        <dd className="text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              employee.accountStatus === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {employee.accountStatus}
                          </span>
                        </dd>
                      </div>

                      {employee.reportingManager && (
                        <div className="flex items-start justify-between gap-4 py-1 border-t border-slate-100">
                          <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2 flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>Reporting Manager</span>
                          </dt>
                          <dd className="text-xs sm:text-sm font-bold text-slate-900 text-right">
                            {employee.reportingManager}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 3. Work Summary (3 Compact Folder-Style Cards) ── */}
            <section aria-label="Work Summary" className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    onClick={() => navigate(card.path)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(card.path);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="group relative pt-3.5 cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
                  >
                    <div className="absolute top-0 left-3.5 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-t-[12px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${card.tabDot}`} />
                      <span className="text-[11px] font-bold text-slate-800 tracking-tight">
                        {card.label}
                      </span>
                    </div>

                    <div className="relative overflow-hidden rounded-[22px] rounded-tl-[6px] bg-white/75 backdrop-blur-xl border border-white/95 p-4 sm:p-5 shadow-[0_8px_28px_rgba(0,0,0,0.03)] group-hover:bg-white/90 transition-all">
                      <div
                        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.glow} blur-xl pointer-events-none`}
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <div>
                          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                            {card.count}
                          </div>
                          <p className="text-xs font-semibold text-slate-500 mt-1.5">
                            {card.label}
                          </p>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-white/90 border border-slate-200/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                          <Icon className={`w-5 h-5 ${card.iconColor} stroke-[2]`} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* ── 4. Account Settings Section ── */}
            <section className="relative pt-4 select-none">
              <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-800 stroke-[2.2]" />
                <span className="text-[11px] font-bold text-slate-800">Security & Session</span>
              </div>

              <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
                <div
                  className="absolute -bottom-16 -right-12 w-48 h-48 rounded-full bg-gradient-to-tr from-rose-500/12 via-blue-400/5 to-transparent blur-2xl pointer-events-none"
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight pb-3.5 mb-3.5 border-b border-slate-200/60">
                    Account Settings
                  </h3>

                  <div className="space-y-2.5">
                    {/* Change Password */}
                    <button
                      type="button"
                      onClick={() => navigate('/employee/profile/change-password')}
                      className="w-full p-3.5 sm:p-4 rounded-2xl bg-white/85 hover:bg-white border border-slate-200/80 hover:border-blue-300 shadow-2xs transition-all flex items-center justify-between gap-3 text-left group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Key className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            Change Password
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            Update your login password securely
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </button>

                    {/* Notifications (Opens existing Notifications Modal) */}
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen(true)}
                      className="w-full p-3.5 sm:p-4 rounded-2xl bg-white/85 hover:bg-white border border-slate-200/80 hover:border-blue-300 shadow-2xs transition-all flex items-center justify-between gap-3 text-left group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                          <Bell className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            Notifications
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            View project updates and unread alerts
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </button>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={() => setIsLogoutConfirmOpen(true)}
                      className="w-full p-3.5 sm:p-4 rounded-2xl bg-rose-50/70 hover:bg-rose-50 border border-rose-200/80 hover:border-rose-300 shadow-2xs transition-all flex items-center justify-between gap-3 text-left group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0">
                          <LogOut className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-rose-700">
                            Logout
                          </p>
                          <p className="text-[11px] text-rose-500 font-medium truncate">
                            Sign out of your employee workspace session
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Floating Pill Bottom Navigation (Profile Active) */}
      <EmployeeBottomNavigation />

      {/* Existing Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Logout Confirmation Dialog */}
      {isLogoutConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsLogoutConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[28px] bg-white/95 backdrop-blur-2xl border border-white shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                aria-label="Close confirmation"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 id="logout-dialog-title" className="text-lg font-extrabold text-slate-900">
                Sign out of Exofo?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                You will be signed out of your employee workspace and returned to the login screen.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

