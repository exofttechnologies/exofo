import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Folder, 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Users, 
  ArrowRight,
  Monitor,
  GraduationCap,
  Smartphone,
  Database,
  Layout
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { currentProjects, projectStats } from '../data/mockData';
import { Project } from '../types';
import { FloatingAddButton } from '../components/tasks/FloatingAddButton';
import { CreateProjectModal } from '../components/CreateProjectModal';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const [projectsList, setProjectsList] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('exofo_projects');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return currentProjects;
  });
  const [activeFilter, setActiveFilter] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOpenCreate = () => setIsCreateModalOpen(true);
    window.addEventListener('open-create-project-modal', handleOpenCreate);
    return () => {
      window.removeEventListener('open-create-project-modal', handleOpenCreate);
    };
  }, []);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setActiveFilter(status);
    }
  }, [searchParams]);

  const handleFilterChange = (status: string) => {
    setActiveFilter(status);
    if (status === 'All') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ status });
    }
  };

  const filteredProjects = projectsList.filter((project) => {
    const matchesFilter = activeFilter === 'All' || project.status === activeFilter;
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.category && project.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Monitor':
        return <Monitor className="w-6 h-6 text-white stroke-[2]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6 text-white stroke-[2]" />;
      case 'Smartphone':
        return <Smartphone className="w-6 h-6 text-white stroke-[2]" />;
      case 'Database':
        return <Database className="w-6 h-6 text-white stroke-[2]" />;
      case 'Layout':
      default:
        return <Layout className="w-6 h-6 text-white stroke-[2]" />;
    }
  };

  return (
    <div className="w-full pb-28">
      {/* ------------------------------------------------------------------
          Top Navigation Bar & Breadcrumb
          ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Dashboard</span>
        </button>

        {/* Action Button: Create Project */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Folder className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Company Projects
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Click any project card to open its dedicated section management hub.
        </p>
      </div>

      {/* ------------------------------------------------------------------
          Overview Statistics Capsules (Glassmorphic)
          ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Total Active */}
        <div 
          onClick={() => handleFilterChange('All')}
          className={`glass-surface rounded-[22px] p-4 cursor-pointer transition-all ${
            activeFilter === 'All' ? 'ring-2 ring-blue-600 bg-white' : 'hover:bg-white/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Active</span>
            <Folder className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 leading-none">{projectStats.totalActive}</p>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => handleFilterChange('In Progress')}
          className={`glass-surface rounded-[22px] p-4 cursor-pointer transition-all ${
            activeFilter === 'In Progress' ? 'ring-2 ring-blue-600 bg-white' : 'hover:bg-white/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">In Progress</span>
            <PlayCircle className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-600 leading-none">{projectStats.inProgress}</p>
        </div>

        {/* Completed */}
        <div 
          onClick={() => handleFilterChange('Completed')}
          className={`glass-surface rounded-[22px] p-4 cursor-pointer transition-all ${
            activeFilter === 'Completed' ? 'ring-2 ring-emerald-600 bg-white' : 'hover:bg-white/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 leading-none">{projectStats.completed}</p>
        </div>

        {/* On Hold */}
        <div 
          onClick={() => handleFilterChange('On Hold')}
          className={`glass-surface rounded-[22px] p-4 cursor-pointer transition-all ${
            activeFilter === 'On Hold' ? 'ring-2 ring-amber-600 bg-white' : 'hover:bg-white/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">On Hold</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 leading-none">{projectStats.onHold}</p>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          Search and Filter Controls
          ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name, keyword or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {['All', 'In Progress', 'Completed', 'On Hold'].map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------
          Responsive Projects Grid
          ------------------------------------------------------------------ */}
      {filteredProjects.length === 0 ? (
        <div className="glass-surface rounded-[28px] p-12 text-center">
          <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Projects Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different status filter tab above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {filteredProjects.map((project: Project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/projects/${project.id}`);
                }
              }}
              className="group glass-surface stat-card-hover rounded-[26px] p-5 cursor-pointer select-none flex flex-col justify-between transition-all duration-200 border border-white/80 hover:border-blue-300"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#1261E8] to-[#0645B5] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
                      {renderIcon(project.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {project.projectCode}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </h3>
                      </div>
                      <p className="text-xs font-medium text-slate-500 line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : project.status === 'On Hold'
                      ? 'bg-amber-50 text-amber-600 border border-amber-100'
                      : 'bg-[#EBF3FF] text-[#1261E8] border border-[#DCEBFF]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      project.status === 'Completed'
                        ? 'bg-emerald-600'
                        : project.status === 'On Hold'
                        ? 'bg-amber-500'
                        : 'bg-[#1261E8]'
                    }`} />
                    <span>{project.status}</span>
                  </span>
                </div>

                {/* Meta details: Timeline & Team */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-5 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {project.startDate} to {project.expectedCompletionDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {project.assignedEmployees.length} Engineers
                  </span>
                </div>
              </div>

              {/* Bottom Progress Row */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-400 font-medium">Progress</span>
                  <span className="text-slate-900 font-bold">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#E6EFFD] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      project.status === 'Completed' ? 'bg-emerald-600' : 'bg-[#1261E8]'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                {/* Team Avatars & Manage Project Link */}
                <div className="flex items-center justify-between mt-4">
                  {/* Team Avatars */}
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {project.assignedEmployees.slice(0, 3).map((m, i) => (
                      <div
                        key={i}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center"
                        title={m.name}
                      >
                        {m.initials}
                      </div>
                    ))}
                    {project.assignedEmployees.length > 3 && (
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 text-slate-600 font-bold text-[9px] flex items-center justify-center">
                        +{project.assignedEmployees.length - 3}
                      </div>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>Manage Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Add Project Button (Same plus icon as Tasks page) */}
      <FloatingAddButton 
        label="Create New Project" 
        onClick={() => setIsCreateModalOpen(true)} 
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={(newProj) => {
          setProjectsList([newProj, ...projectsList]);
        }}
      />
    </div>
  );
};
