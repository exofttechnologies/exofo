import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardList,
  Layers,
  FileText,
  Workflow,
  ListChecks,
  Users,
  Folder,
  AlertCircle,
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { EmployeeHeader } from '../../components/employee/EmployeeHeader';
import { EmployeeBottomNavigation } from '../../components/employee/EmployeeBottomNavigation';
import { NotificationsModal } from '../../components/NotificationsModal';
import { Employee, Project } from '../../types';

/**
 * Lightweight target route for /employee/projects/:projectId
 * Preserves the employee project details route and upcoming section structure
 * until the full dedicated Employee Project Detail module is built.
 */
export const EmployeeProjectDetailsRoutePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!projectId) return;
      try {
        setLoading(true);
        setError(null);
        const activeIdentifier =
          localStorage.getItem('exofo_employee_id') ||
          localStorage.getItem('exofo_user_email') ||
          'emp-ahmed';

        // Verify employee assignment scope via employee projects service
        const result = await projectService.getEmployeeProjects(activeIdentifier);
        if (!active) return;
        setEmployee(result.employee);

        const matched = result.projects.find(
          (p) => p.id === projectId || p.projectCode.toLowerCase() === projectId.toLowerCase()
        );

        if (!matched) {
          setError('Project not found or not assigned to your employee account.');
        } else {
          setProject(matched);
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to load project.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [projectId]);

  const plannedSections = [
    { id: 'details', title: 'Project Details', icon: ClipboardList },
    { id: 'features', title: 'Project Features', icon: Layers },
    { id: 'feature-details', title: 'Feature Details', icon: FileText },
    { id: 'phases', title: 'Project Phases', icon: Workflow },
    { id: 'phase-details', title: 'Phase Details', icon: ListChecks },
    { id: 'team', title: 'Assigned Team Members', icon: Users },
    { id: 'documents', title: 'Project Documents', icon: Folder },
  ];

  return (
    <div
      className="min-h-screen w-full bg-[#F7F9FC] text-slate-900 relative antialiased overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.08) 1.25px, transparent 1.25px)',
        backgroundSize: '22px 22px',
      }}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <EmployeeHeader
          employee={employee}
          unreadCount={2}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => navigate('/employee/profile')}
        />

        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/employee/projects')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/85 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to My Projects</span>
          </button>
        </div>

        {loading && (
          <div className="rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/90 p-8 animate-pulse space-y-4">
            <div className="h-7 w-64 bg-slate-200/70 rounded-xl" />
            <div className="h-4 w-96 bg-slate-200/50 rounded-lg" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[26px] bg-white/80 backdrop-blur-xl border border-rose-200 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-extrabold text-slate-900">Access Unavailable</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{error}</p>
          </div>
        )}

        {!loading && project && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
                {project.projectCode} • {project.status} • {project.progress}%
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {project.name}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                {project.description}
              </p>
            </div>

            <div className="rounded-[28px] bg-white/75 backdrop-blur-xl border border-white/90 p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
              <h2 className="text-sm font-extrabold text-slate-900 mb-4">
                Project Sections Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {plannedSections.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <div
                      key={sec.id}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/85 border border-slate-200/70 shadow-2xs"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {sec.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <EmployeeBottomNavigation />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

