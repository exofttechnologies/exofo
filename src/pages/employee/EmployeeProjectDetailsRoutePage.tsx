import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Layers,
  Workflow,
  ListChecks,
  Users,
  Folder,
  AlertCircle,
  X,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { EmployeeHeader } from '../../components/employee/EmployeeHeader';
import { EmployeeBottomNavigation } from '../../components/employee/EmployeeBottomNavigation';
import { NotificationsModal } from '../../components/NotificationsModal';
import { Employee, Project } from '../../types';

type PreviewSectionId = 'features' | 'employees' | 'phases' | 'documents' | 'milestones' | null;

export const EmployeeProjectDetailsRoutePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activePreviewSection, setActivePreviewSection] = useState<PreviewSectionId>(null);

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

  const sectionCards = project
    ? [
        {
          id: 'details',
          title: 'Project Details',
          description: 'Project and client information.',
          icon: ClipboardList,
          gradient: 'from-[#1261E8] to-[#0645B5]',
          badge: `${project.progress}% Complete`,
          onClick: () => navigate(`/employee/projects/${project.id}/details`),
        },
        {
          id: 'features',
          title: 'Project Features',
          description: 'Project requirements and features.',
          icon: Layers,
          gradient: 'from-[#1A73E8] to-[#0A58CA]',
          badge: `${project.features?.length || 0} Features`,
          onClick: () => setActivePreviewSection('features'),
        },
        {
          id: 'employees',
          title: 'Assigned Employees',
          description: 'View employees assigned to this project.',
          icon: Users,
          gradient: 'from-[#0F52BA] to-[#053A8B]',
          badge: `${project.assignedEmployees?.length || 0} Assigned`,
          onClick: () => setActivePreviewSection('employees'),
        },
        {
          id: 'phases',
          title: 'Project Phases',
          description: 'Manage project phases and progress.',
          icon: Workflow,
          gradient: 'from-[#1E40AF] to-[#0645B5]',
          badge: `${project.phases?.length || 0} Phases`,
          onClick: () => setActivePreviewSection('phases'),
        },
        {
          id: 'documents',
          title: 'Project Documents',
          description: 'Manage project documents and files.',
          icon: Folder,
          gradient: 'from-[#0284C7] to-[#0369A1]',
          badge: `${project.documents?.length || 0} Files`,
          onClick: () => setActivePreviewSection('documents'),
        },
        {
          id: 'milestones',
          title: 'Milestones & Roadmap',
          description: 'Track key milestones and delivery steps.',
          icon: ListChecks,
          gradient: 'from-[#3B82F6] to-[#1D4ED8]',
          badge: `${project.milestones?.length || 0} Milestones`,
          onClick: () => setActivePreviewSection('milestones'),
        },
      ]
    : [];

  return (
    <div
      className="min-h-screen w-full bg-[#F7F9FC] text-slate-900 relative antialiased overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.08) 1.25px, transparent 1.25px)',
        backgroundSize: '22px 22px',
      }}
    >
      {/* Abstract Ambient Flowing Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute -top-32 -right-28 w-[520px] h-[520px] rounded-full bg-blue-500/10 blur-[125px]" />
        <div className="absolute bottom-12 -left-32 w-[460px] h-[460px] rounded-full bg-slate-900/7 blur-[130px]" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Top Bar */}
        <EmployeeHeader
          employee={employee}
          unreadCount={2}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => navigate('/employee/profile')}
        />

        {/* Back Navigation */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate('/employee/projects')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/85 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to My Projects</span>
          </button>
        </div>

        {/* Loading State matching ProjectSectionsPage */}
        {loading && (
          <div className="w-full animate-pulse space-y-6">
            <div className="glass-surface rounded-[26px] p-6 h-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-surface rounded-[22px] p-5 h-24" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && (error || !project) && (
          <div className="glass-surface rounded-[28px] p-8 sm:p-12 text-center max-w-lg mx-auto mt-6">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Project Unavailable</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {error || 'The requested project could not be loaded.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/employee/projects')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Return to My Projects</span>
            </button>
          </div>
        )}

        {/* Main Sections Overview Content matching ProjectSectionsPage UI */}
        {!loading && !error && project && (
          <>
            <header className="mb-6">
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
                    {project.description && (
                      <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs ${
                        project.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : project.status === 'On Hold'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : project.status === 'Not Started'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-[#EBF3FF] text-[#1261E8] border border-[#DCEBFF]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          project.status === 'Completed'
                            ? 'bg-emerald-600'
                            : project.status === 'On Hold'
                            ? 'bg-amber-500'
                            : project.status === 'Not Started'
                            ? 'bg-slate-500'
                            : 'bg-[#1261E8]'
                        }`}
                      />
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
                  Access all project information and work sections in one place.
                </p>
              </div>
            </header>

            {/* Section Cards Responsive Grid matching ProjectSectionsPage */}
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
              {sectionCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.id}
                    onClick={card.onClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        card.onClick();
                      }
                    }}
                    className="group glass-surface stat-card-hover rounded-[22px] p-5 cursor-pointer select-none flex items-center justify-between gap-4 transition-all duration-200 border border-white/80 hover:border-blue-300 min-h-[96px]"
                  >
                    {/* Left: Blue Gradient Icon Container + Title & Description */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}
                      >
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>

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

                    {/* Right: Arrow Icon */}
                    <div className="w-8 h-8 rounded-full bg-slate-100/80 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-all duration-200 flex-shrink-0 shadow-2xs group-hover:translate-x-0.5">
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                );
              })}
            </main>
          </>
        )}
      </div>

      {/* Section Preview Modal for Secondary Read-Only Sections */}
      {activePreviewSection && project && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setActivePreviewSection(null)}
        >
          <div
            className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[28px] shadow-2xl border border-white overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFF]">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  {project.name}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 capitalize">
                  {activePreviewSection === 'employees'
                    ? 'Assigned Team Members'
                    : activePreviewSection === 'milestones'
                    ? 'Milestones & Roadmap'
                    : `Project ${activePreviewSection}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewSection(null)}
                aria-label="Close section preview"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {activePreviewSection === 'features' &&
                (project.features.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No features listed yet.</p>
                ) : (
                  project.features.map((f) => (
                    <div key={f.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{f.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                          {f.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{f.description}</p>
                    </div>
                  ))
                ))}

              {activePreviewSection === 'employees' &&
                (project.assignedEmployees.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No team members assigned.</p>
                ) : (
                  project.assignedEmployees.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                          {m.initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{m.name}</p>
                          <p className="text-[11px] text-slate-500">{m.projectRole || m.designation}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {m.designation}
                      </span>
                    </div>
                  ))
                ))}

              {activePreviewSection === 'phases' &&
                (project.phases.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No phases defined yet.</p>
                ) : (
                  project.phases.map((ph, idx) => (
                    <div key={ph.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          0{idx + 1}. {ph.name}
                        </span>
                        <span className="text-[11px] font-bold text-blue-600">{ph.completionPercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${ph.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ))}

              {activePreviewSection === 'documents' &&
                (project.documents.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No project documents uploaded yet.</p>
                ) : (
                  project.documents.map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{d.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {d.category} • {d.size} • {d.uploadDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ))}

              {activePreviewSection === 'milestones' &&
                (!project.milestones || project.milestones.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No milestones recorded yet.</p>
                ) : (
                  project.milestones.map((ms) => (
                    <div key={ms.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {ms.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span className={`text-xs font-semibold truncate ${ms.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {ms.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium flex-shrink-0 ml-2">{ms.date}</span>
                    </div>
                  ))
                ))}
            </div>
          </div>
        </div>
      )}

      <EmployeeBottomNavigation />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};
