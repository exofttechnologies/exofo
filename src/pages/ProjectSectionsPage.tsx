import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  ClipboardList, 
  Layers, 
  Users, 
  UserPlus, 
  Workflow, 
  Folder, 
  ShieldCheck, 
  Receipt, 
  ListChecks, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { Project } from '../types';
import { NotificationsModal } from '../components/NotificationsModal';
import { ProfileDrawer } from '../components/ProfileDrawer';

export const ProjectSectionsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      if (!projectId) {
        setError('No project ID specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await projectService.getProjectById(projectId);
        
        if (!isMounted) return;

        if (!data) {
          setError(`Project with ID "${projectId}" could not be found.`);
        } else {
          setProject(data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load project details. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Loading State
  if (loading) {
    return (
      <div className="w-full pb-28 animate-pulse">
        <div className="h-10 w-40 bg-white/70 rounded-full mb-6" />
        <div className="glass-surface rounded-[28px] p-6 mb-8 h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="glass-surface rounded-[22px] p-5 h-28" />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error || !project) {
    return (
      <div className="w-full pb-28 pt-8">
        <div className="glass-surface rounded-[28px] p-8 sm:p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Project Not Found</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {error || 'The requested project could not be loaded.'}
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Return to Projects List</span>
          </button>
        </div>
      </div>
    );
  }

  // 9 Section Cards Definition
  const sectionCards = [
    {
      id: 'details',
      title: 'Project Details',
      description: 'Project and client information.',
      icon: ClipboardList,
      gradient: 'from-[#1261E8] to-[#0645B5]', // Primary to deep blue
      path: `/projects/${project.id}/details`,
      badge: `${project.progress}% Complete`,
    },
    {
      id: 'features',
      title: 'Project Features',
      description: 'Project requirements and features.',
      icon: Layers,
      gradient: 'from-[#1A73E8] to-[#0A58CA]',
      path: `/projects/${project.id}/features`,
      badge: `${project.features.length} Features`,
    },
    {
      id: 'employees',
      title: 'Assigned Employees',
      description: 'View employees assigned to this project.',
      icon: Users,
      gradient: 'from-[#0F52BA] to-[#053A8B]',
      path: `/projects/${project.id}/employees`,
      badge: `${project.assignedEmployees.length} Assigned`,
    },
    {
      id: 'phases',
      title: 'Project Phases',
      description: 'Manage project phases and progress.',
      icon: Workflow,
      gradient: 'from-[#1E40AF] to-[#0645B5]',
      path: `/projects/${project.id}/phases`,
      badge: `${project.phases.length} Phases`,
    },
    {
      id: 'documents',
      title: 'Project Documents',
      description: 'Manage project documents and files.',
      icon: Folder,
      gradient: 'from-[#0284C7] to-[#0369A1]',
      path: `/projects/${project.id}/documents`,
      badge: `${project.documents.length} Files`,
    },
    {
      id: 'credentials',
      title: 'Password Vault',
      description: 'Securely store project credentials.',
      icon: ShieldCheck,
      gradient: 'from-[#0E7490] to-[#155E75]',
      path: `/projects/${project.id}/credentials`,
      badge: `${project.credentials.length} Logins`,
    },
    {
      id: 'invoices',
      title: 'Invoices & Bills',
      description: 'Manage project invoices and bills.',
      icon: Receipt,
      gradient: 'from-[#2563EB] to-[#0F172A]',
      path: `/projects/${project.id}/invoices`,
      badge: `${project.invoices.length} Invoices`,
    },
    {
      id: 'milestones',
      title: 'Milestones & Roadmap',
      description: 'Track key milestones and delivery steps.',
      icon: ListChecks,
      gradient: 'from-[#3B82F6] to-[#1D4ED8]',
      path: `/projects/${project.id}/milestones`,
      badge: 'Timeline',
    },
  ];

  return (
    <div className="w-full pb-28">
      {/* ------------------------------------------------------------------
          1. Header Section (Top Bar matching prompt spec)
          ------------------------------------------------------------------ */}
      <header className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          {/* Back Arrow to return to Projects */}
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Projects</span>
          </button>

          {/* Right Header Actions: Notification & Admin Avatar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsNotificationsOpen(true)}
              aria-label="View notifications"
              className="relative w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all"
            >
              <Bell className="w-4 h-4 stroke-[2]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            <button
              onClick={() => setIsProfileOpen(true)}
              aria-label="Admin Profile"
              className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/80 shadow-2xs hover:scale-105 active:scale-95 transition-all"
            >
              {(localStorage.getItem('exofo_user_name') || 'AD').substring(0, 2).toUpperCase()}
            </button>
          </div>
        </div>

        {/* Project Meta Banner Card */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                  {project.projectCode}
                </span>
                <span className="text-xs font-semibold text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  {project.category || 'Company Initiative'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {project.name}
              </h1>
            </div>

            {/* Project Status Badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs ${
                project.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : project.status === 'On Hold'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-[#EBF3FF] text-[#1261E8] border border-[#DCEBFF]'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  project.status === 'Completed'
                    ? 'bg-emerald-600'
                    : project.status === 'On Hold'
                    ? 'bg-amber-500'
                    : 'bg-[#1261E8]'
                }`} />
                <span>{project.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Subtitle Section */}
        <div className="px-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Manage Project
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Access all project information and management sections in one place.
          </p>
        </div>
      </header>

      {/* ------------------------------------------------------------------
          2. Main 9 Section Cards Responsive Grid
             - Mobile: 1-col (or 2-col on wider phones)
             - Tablet: 2-col
             - Desktop: 3-col
          ------------------------------------------------------------------ */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
        {sectionCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(card.path);
                }
              }}
              className="group glass-surface stat-card-hover rounded-[22px] p-5 cursor-pointer select-none flex items-center justify-between gap-4 transition-all duration-200 border border-white/80 hover:border-blue-300 min-h-[96px]"
            >
              {/* Left: Icon Container + Titles */}
              <div className="flex items-center gap-3.5 min-w-0">
                {/* 1. Blue gradient icon container */}
                <div 
                  className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}
                >
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>

                {/* 2 & 3. Title & Short Description */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors truncate">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-[12.5px] font-medium text-slate-500 truncate mt-0.5 leading-snug">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* 4. Small Arrow Icon on Right */}
              <div className="w-8 h-8 rounded-full bg-slate-100/80 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-all duration-200 flex-shrink-0 shadow-2xs group-hover:translate-x-0.5">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          );
        })}
      </main>

      {/* Notifications and Profile Drawers */}
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

