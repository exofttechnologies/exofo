import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Layers,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  ArrowUpRight,
  Monitor,
  GraduationCap,
  Smartphone,
  Database,
  Layout,
  Building2,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  X,
} from 'lucide-react';
import { projectService, EmployeeProjectsSummary } from '../../services/projectService';
import { EmployeeHeader } from '../../components/employee/EmployeeHeader';
import { EmployeeBottomNavigation } from '../../components/employee/EmployeeBottomNavigation';
import { NotificationsModal } from '../../components/NotificationsModal';
import { Employee, Project } from '../../types';

const STATUS_FILTERS = ['All', 'Not Started', 'In Progress', 'On Hold', 'Completed'] as const;

const CARD_TEXTURES = [
  {
    glow: 'from-blue-500/20 via-sky-400/10 to-transparent',
    secondaryGlow: 'from-slate-900/10 via-blue-900/5 to-transparent',
    tabDot: 'bg-blue-600',
    iconBg: 'bg-blue-50/90 border-blue-200/70 text-blue-700',
    progressFill: 'from-[#1261E8] to-[#0645B5]',
  },
  {
    glow: 'from-rose-500/18 via-red-400/10 to-transparent',
    secondaryGlow: 'from-slate-800/10 via-slate-500/5 to-transparent',
    tabDot: 'bg-rose-500',
    iconBg: 'bg-rose-50/90 border-rose-200/70 text-rose-700',
    progressFill: 'from-rose-500 to-red-600',
  },
  {
    glow: 'from-slate-900/18 via-blue-950/10 to-transparent',
    secondaryGlow: 'from-blue-500/10 via-slate-400/5 to-transparent',
    tabDot: 'bg-slate-900',
    iconBg: 'bg-slate-100/90 border-slate-300/70 text-slate-900',
    progressFill: 'from-slate-900 to-slate-700',
  },
  {
    glow: 'from-slate-500/20 via-zinc-300/15 to-transparent',
    secondaryGlow: 'from-blue-500/10 via-rose-400/5 to-transparent',
    tabDot: 'bg-slate-500',
    iconBg: 'bg-slate-100/90 border-slate-200/80 text-slate-700',
    progressFill: 'from-slate-700 to-blue-600',
  },
];

export const EmployeeProjectsPage: React.FC = () => {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<EmployeeProjectsSummary>({
    total: 0,
    inProgress: 0,
    completed: 0,
    notStarted: 0,
    onHold: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [loading, setLoading] = useState<boolean>(true);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Header interaction modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Debounce search query before querying backend/service
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAssignedProjects = useCallback(
    async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        } else {
          setIsFiltering(true);
        }
        setError(null);

        const activeIdentifier =
          localStorage.getItem('exofo_employee_id') ||
          localStorage.getItem('exofo_user_email') ||
          'emp-ahmed';

        const result = await projectService.getEmployeeProjects(activeIdentifier, {
          status: statusFilter,
          search: debouncedSearch,
        });

        setEmployee(result.employee);
        setSummary(result.summary);
        setProjects(result.projects);
      } catch (err: any) {
        setError(err.message || 'Unable to load your assigned projects.');
      } finally {
        setLoading(false);
        setIsFiltering(false);
      }
    },
    [statusFilter, debouncedSearch]
  );

  useEffect(() => {
    fetchAssignedProjects(projects.length === 0 && loading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, debouncedSearch]);

  const renderProjectIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Monitor':
        return <Monitor className="w-5 h-5 stroke-[1.9]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 stroke-[1.9]" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 stroke-[1.9]" />;
      case 'Database':
        return <Database className="w-5 h-5 stroke-[1.9]" />;
      case 'Layout':
      default:
        return <Layout className="w-5 h-5 stroke-[1.9]" />;
    }
  };

  const getStatusBadgeClasses = (status: Project['status']) => {
    switch (status) {
      case 'Completed':
        return {
          badge: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
        };
      case 'On Hold':
        return {
          badge: 'bg-amber-50/90 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500',
        };
      case 'Not Started':
        return {
          badge: 'bg-slate-100/90 text-slate-700 border-slate-200/80',
          dot: 'bg-slate-500',
        };
      case 'In Progress':
      default:
        return {
          badge: 'bg-blue-50/90 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-600',
        };
    }
  };

  const summaryCards = [
    {
      id: 'total',
      label: 'Total Projects',
      count: summary.total,
      filterValue: 'All',
      icon: Layers,
      accentGlow: 'from-blue-500/18 via-blue-400/5 to-transparent',
      tabDot: 'bg-blue-600',
      iconColor: 'text-blue-600',
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      count: summary.inProgress,
      filterValue: 'In Progress',
      icon: Clock,
      accentGlow: 'from-rose-500/15 via-slate-800/5 to-transparent',
      tabDot: 'bg-rose-500',
      iconColor: 'text-rose-600',
    },
    {
      id: 'completed',
      label: 'Completed',
      count: summary.completed,
      filterValue: 'Completed',
      icon: CheckCircle2,
      accentGlow: 'from-slate-900/15 via-slate-400/10 to-transparent',
      tabDot: 'bg-slate-900',
      iconColor: 'text-slate-900',
    },
  ];

  const hasActiveFilters = statusFilter !== 'All' || debouncedSearch.trim() !== '';

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

      {/* Main Responsive Content */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Top Bar (EXOFO Logo, Notifications, Avatar) */}
        <EmployeeHeader
          employee={employee}
          unreadCount={2}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => navigate('/employee/profile')}
        />

        {/* Page Title directly on dotted background (not inside a card) */}
        <section className="mb-7 select-none">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            My Projects
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-500 mt-1">
            Projects assigned to you
          </p>
        </section>

        {/* Project Summary: 3 Compact Folder-Style Glass Cards */}
        <section aria-label="Project Summary" className="grid grid-cols-3 gap-3 sm:gap-5 mb-7">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            const isSelected = statusFilter === card.filterValue;

            return (
              <div
                key={card.id}
                onClick={() => setStatusFilter(card.filterValue)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setStatusFilter(card.filterValue);
                  }
                }}
                className="group relative pt-3.5 cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Curved Folder Tab */}
                <div className="absolute top-0 left-2.5 sm:left-3.5 z-10 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-t-[12px] bg-white/85 backdrop-blur-md border border-b-0 border-white/90 shadow-2xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${card.tabDot}`} />
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 tracking-tight truncate">
                    {card.label}
                  </span>
                </div>

                {/* Translucent Folder Body */}
                <div
                  className={`relative overflow-hidden rounded-[22px] rounded-tl-[6px] bg-white/75 backdrop-blur-xl p-3.5 sm:p-5 transition-all ${
                    isSelected
                      ? 'border border-slate-900/20 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/10'
                      : 'border border-white/90 shadow-[0_8px_28px_rgba(0,0,0,0.03)] group-hover:border-white'
                  }`}
                >
                  {/* Abstract Subtle Gradient Accent */}
                  <div
                    className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.accentGlow} blur-xl pointer-events-none`}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                        {loading ? '—' : card.count}
                      </div>
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1.5 truncate">
                        {card.label}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/85 border border-slate-200/70 flex items-center justify-center flex-shrink-0 shadow-2xs">
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.iconColor} stroke-[2]`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Search & Status Filters */}
        <section
          aria-label="Project Search and Filters"
          className="rounded-[26px] bg-white/70 backdrop-blur-xl border border-white/90 p-4 sm:p-5 shadow-[0_10px_32px_rgba(0,0,0,0.03)] mb-7 space-y-3.5"
        >
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, project ID, or client name..."
              aria-label="Search assigned projects"
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/85 border border-slate-200/80 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900/30 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 flex-1">
              {STATUS_FILTERS.map((status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white/85 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-white'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>

            {isFiltering && (
              <span className="text-[11px] font-semibold text-slate-400 flex-shrink-0 hidden sm:inline">
                Updating...
              </span>
            )}
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="mb-7 p-5 rounded-[24px] bg-white/80 backdrop-blur-xl border border-rose-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Could not load projects</p>
                <p className="text-xs font-medium text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchAssignedProjects(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading State: Skeleton Folder Cards */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-pulse">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="relative pt-4">
                <div className="absolute top-0 left-4 w-24 h-6 rounded-t-[12px] bg-white/70 border border-b-0 border-white/80" />
                <div className="rounded-[26px] rounded-tl-[8px] bg-white/65 border border-white/80 p-5 space-y-4 h-64">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-200/70" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 bg-slate-200/70 rounded-lg" />
                      <div className="h-3 w-1/2 bg-slate-200/60 rounded-lg" />
                    </div>
                  </div>
                  <div className="h-10 w-full bg-slate-200/50 rounded-xl" />
                  <div className="h-2.5 w-full bg-slate-200/60 rounded-full" />
                  <div className="flex justify-between pt-2">
                    <div className="h-4 w-24 bg-slate-200/60 rounded-lg" />
                    <div className="h-4 w-20 bg-slate-200/60 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && projects.length === 0 && (
          <div className="relative pt-4">
            <div className="absolute top-0 left-5 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/90">
              <FolderOpen className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[11px] font-bold text-slate-700">Projects Folder</span>
            </div>

            <div className="rounded-[28px] rounded-tl-[8px] bg-white/70 backdrop-blur-xl border border-white/90 p-10 sm:p-14 text-center shadow-[0_12px_36px_rgba(0,0,0,0.03)]">
              <div className="w-14 h-14 rounded-2xl bg-slate-100/90 border border-slate-200/70 flex items-center justify-center mx-auto mb-4 text-slate-500">
                <FolderOpen className="w-7 h-7 stroke-[1.7]" />
              </div>

              {summary.total === 0 || !hasActiveFilters ? (
                <>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    No projects assigned yet
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1.5">
                    Your assigned projects will appear here.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    No matching projects found
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1.5 mb-5">
                    Try adjusting your search keywords or selected status filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('All');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Responsive Project Listing Grid */}
        {!loading && !error && projects.length > 0 && (
          <section
            aria-label="Assigned Projects Listing"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          >
            {projects.map((project, index) => {
              const texture = CARD_TEXTURES[index % CARD_TEXTURES.length];
              const statusStyle = getStatusBadgeClasses(project.status);
              const memberCount = project.assignedEmployees?.length ?? project.teamSize ?? 0;

              return (
                <article
                  key={project.id}
                  onClick={() => navigate(`/employee/projects/${project.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/employee/projects/${project.id}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${project.name} details`}
                  className="group relative pt-4 cursor-pointer select-none flex flex-col transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
                >
                  {/* Folder-Shaped Top Tab */}
                  <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                    <span className={`w-1.5 h-1.5 rounded-full ${texture.tabDot}`} />
                    <span className="text-[11px] font-extrabold text-slate-800 tracking-wide">
                      {project.projectCode || project.id}
                    </span>
                  </div>

                  {/* Frosted-Glass Folder Front Panel */}
                  <div className="relative overflow-hidden rounded-[26px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04),0_2px_6px_rgba(15,23,42,0.02)] group-hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] group-hover:bg-white/85 transition-all flex-1 flex flex-col justify-between">
                    {/* Subtle Abstract Flowing Colour Texture Behind Top Portion */}
                    <div
                      className={`absolute -top-12 -right-10 w-44 h-44 rounded-full bg-gradient-to-br ${texture.glow} blur-2xl pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity`}
                      aria-hidden="true"
                    />
                    <div
                      className={`absolute top-2 -left-10 w-36 h-36 rounded-full bg-gradient-to-tr ${texture.secondaryGlow} blur-2xl pointer-events-none opacity-75`}
                      aria-hidden="true"
                    />

                    {/* Card Top: Thumbnail, Title, Client, Status */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3 mb-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${texture.iconBg}`}
                          >
                            {renderProjectIcon(project.iconName)}
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate group-hover:text-[#1261E8] transition-colors">
                              {project.name}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 truncate mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">
                                {project.client?.company || project.client?.name || 'Internal Client'}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="w-7 h-7 rounded-full bg-white/90 border border-slate-200/70 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all flex-shrink-0 shadow-2xs">
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.3]" />
                        </div>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed mb-4 min-h-[2.25rem]">
                        {project.description}
                      </p>

                      {/* Status Badge & Team Count */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusStyle.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          <span>{project.status}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Card Bottom: Progress Bar & Dates */}
                    <div className="relative z-10 pt-3.5 border-t border-slate-200/60 space-y-3">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                          <span className="text-[11px] font-semibold text-slate-500">Progress</span>
                          <span className="text-slate-900 font-extrabold">{project.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${texture.progressFill} transition-all duration-700 ease-out`}
                            style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                          />
                        </div>
                      </div>

                      {/* Start Date, Deadline & Avatar Stack */}
                      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500 pt-0.5">
                        <span className="inline-flex items-center gap-1 truncate">
                          <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{project.startDate || 'TBD'}</span>
                        </span>
                        <span className="text-slate-300">→</span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{project.expectedCompletionDate || 'TBD'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {/* Floating Pill Bottom Navigation (Projects Active) */}
      <EmployeeBottomNavigation />

      {/* Modals */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

