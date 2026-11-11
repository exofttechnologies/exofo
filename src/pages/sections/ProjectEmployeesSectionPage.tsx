import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Briefcase, 
  CheckCircle, 
  Trash2 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Project, ProjectEmployee } from '../../types';

export const ProjectEmployeesSectionPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      setLoading(true);
      const data = await projectService.getProjectById(projectId);
      if (data) setProject(data);
      setLoading(false);
    }
    load();
  }, [projectId]);

  const handleRemove = async (employeeId: string, name: string) => {
    if (!project) return;
    if (window.confirm(`Remove ${name} from this project?`)) {
      await projectService.removeEmployee(project.id, employeeId);
      const updated = await projectService.getProjectById(project.id);
      if (updated) setProject(updated);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold">Loading project team...</div>;
  if (!project) return null;

  return (
    <div className="w-full pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Project Sections</span>
        </button>

        {/* Add Employee Button (Navigates to Card 5: Assign Employees) */}
        <button
          onClick={() => navigate(`/projects/${project.id}/assign-employees`)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assigned Employees ({project.assignedEmployees.length})
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Team members, assigned roles, and workload for {project.name}.
        </p>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project.assignedEmployees.length === 0 ? (
          <div className="col-span-2 glass-surface rounded-[26px] p-10 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Employees Assigned</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click "Add Employee" to assign engineers to this project.</p>
          </div>
        ) : (
          project.assignedEmployees.map((emp: ProjectEmployee) => (
            <div
              key={emp.id}
              className="glass-surface stat-card-hover rounded-[24px] p-5 border border-white/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-xs flex-shrink-0">
                      {emp.initials}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{emp.name}</h3>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">{emp.projectRole}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{emp.designation}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(emp.id, emp.name)}
                    aria-label="Remove from project"
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Assigned Tasks</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                  {emp.currentTaskCount} Tasks Active
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

