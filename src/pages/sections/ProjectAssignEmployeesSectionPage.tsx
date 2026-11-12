import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  UserPlus, 
  Check, 
  Users, 
  ShieldCheck 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { employeeService } from '../../services/employeeService';
import { Project, Employee, ProjectEmployee } from '../../types';

export const ProjectAssignEmployeesSectionPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      setLoading(true);
      try {
        const [projData, empList] = await Promise.all([
          projectService.getProjectById(projectId),
          employeeService.getEmployees({ status: 'Active' }),
        ]);

        if (projData) {
          setProject(projData);
          setSelectedIds((projData.assignedEmployees || []).map((e) => e.id || e.email));
        }
        setEmployees(empList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveAssignments = async () => {
    if (!project) return;
    setAssigning(true);

    try {
      const updatedAssigned: ProjectEmployee[] = selectedIds.map((id) => {
        const emp = employees.find((e) => e.id === id || e.employeeId === id || e.email === id);
        return {
          id: emp?.employeeId || id,
          name: emp?.name || 'Assigned Member',
          initials: emp?.initials || 'EM',
          designation: emp?.designation || 'Specialist',
          projectRole: emp?.projectRole || emp?.designation || 'Project Member',
          email: emp?.email || '',
          phone: emp?.phone || '',
          currentTaskCount: emp?.currentTaskCount || 0,
          assignedDate: new Date().toISOString().split('T')[0],
        };
      });

      await projectService.updateProject(project.id, { assignedEmployees: updatedAssigned });
      navigate(`/projects/${project.id}/employees`);
    } catch (err: any) {
      alert(`Failed to save assignments: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold">Loading available employees...</div>;
  if (!project) return null;

  return (
    <div className="w-full pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/projects/${project.id}/employees`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Assigned Employees</span>
        </button>

        <button
          onClick={handleSaveAssignments}
          disabled={assigning}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{assigning ? 'Updating...' : `Save Assignments (${selectedIds.length})`}</span>
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <UserPlus className="w-6 h-6 text-blue-600" />
          <span>Assign Team Members</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select specialists from the database to allocate to <span className="font-bold text-slate-800">{project.name}</span>.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, designation, or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const isSelected = selectedIds.includes(emp.id) || selectedIds.includes(emp.employeeId);
          return (
            <div
              key={emp.id}
              onClick={() => toggleSelect(emp.employeeId || emp.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs">
                  {emp.initials || emp.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{emp.name}</h3>
                  <p className="text-[11px] text-blue-600 font-semibold">{emp.designation}</p>
                  <p className="text-[10px] text-slate-400">{emp.department || emp.email}</p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
