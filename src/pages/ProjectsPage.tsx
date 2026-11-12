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
import { projectService } from '../services/projectService';
import { Project } from '../types';
import { FloatingAddButton } from '../components/tasks/FloatingAddButton';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService.getAllProjects().then((data) => {
      setProjectsList(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const handleOpenCreate = () => navigate('/projects/create');
    window.addEventListener('open-create-project-modal', handleOpenCreate);
    return () => {
      window.removeEventListener('open-create-project-modal', handleOpenCreate);
    };
  }, [navigate]);

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

  const totalActive = projectsList.filter((p) => p.status !== 'Archived').length;
  const inProgress = projectsList.filter((p) => p.status === 'In Progress').length;
  const completed = projectsList.filter((p) => p.status === 'Completed').length;
  const onHold = projectsList.filter((p) => p.status === 'On Hold').length;

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
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={() => navigate('/projects/create')}
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

      {/* Overview Statistics Capsules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
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
          <p className="text-2xl font-black text-slate-900 leading-none">{totalActive}</p>
        </div>

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
          <p className="text-2xl font-black text-blue-600 leading-none">{inProgress}</p>
        </div>

        <div 
          onClick={() => handleFilterChange('Completed')}
          className={`glass-surface rounded-[22px] p-4 cursor-pointer transition-all ${
            activeFilter === 'Completed' ? 'ring-2 ring-blue-600 bg-white' : 'hover:bg-white/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 leading-none">{completed}</p>
        </div>

        <div 
          onClick={() => handleFilterChange('On Hold')}
          className={`glass-surface rounded-[22px] p-4 cursor-pointer transition-all ${
            activeFilter === 'On Hold' ? 'ring-2 ring-blue-600 bg-white' : 'hover:bg-white/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">On Hold</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500 leading-none">{onHold}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, code or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/80 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-semibold text-sm">
          Loading company projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-surface rounded-[28px] p-12 text-center">
          <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No Projects Found</h3>
          <p className="text-xs text-slate-400 mb-5">
            {searchQuery ? 'Try adjusting your search terms.' : 'No projects match the selected filter.'}
          </p>
          <button
            onClick={() => navigate('/projects/create')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="glass-surface rounded-[26px] p-5 cursor-pointer hover:shadow-md transition-all border border-slate-200/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center">
                    {renderIcon(project.iconName || 'Layout')}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                    project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                    project.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {project.status}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase">
                    {project.projectCode}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">
                    {project.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-slate-900">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{(project.assignedEmployees || []).length} Members</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <FloatingAddButton onClick={() => navigate('/projects/create')} />
    </div>
  );
};
