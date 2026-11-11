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
import { Project, ProjectEmployee } from '../../types';
import { allCompanyEmployees } from '../../data/mockData';

export const ProjectAssignEmployeesSectionPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      setLoading(true);
      const data = await projectService.getProjectById(projectId);
      if (data) {
        setProject(data);
        // Pre-select already assigned employees
        setSelectedIds(data.assignedEmployees.map((e) => e.id));
      }
      setLoading(false);
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
      await projectService.assignEmployees(project.id, selectedIds);
      navigate(`/projects/${project.id}/employees`);
    } finally {
      setAssigning(false);
    }
  };

  const filteredEmployees = allCompanyEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase()) ||
      emp.projectRole.toLowerCase().includes(search.toLowerCase())
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
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center">
            <UserPlus className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assign Employees to {project.name}
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Search the organization talent directory and allocate engineers to this project.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search employees by name, role or designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
        />
      </div>

      {/* Employee Selection List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredEmployees.map((emp) => {
          const isSelected = selectedIds.includes(emp.id);

          return (
            <div
              key={emp.id}
              onClick={() => toggleSelect(emp.id)}
              role="button"
              tabIndex={0}
              className={`glass-surface rounded-[22px] p-4.5 cursor-pointer select-none flex items-center justify-between gap-4 transition-all border ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 shadow-xs'
                  : 'border-white/80 hover:bg-white/90'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs ring-2 ${
                  isSelected ? 'bg-blue-600 text-white ring-blue-300' : 'bg-slate-800 text-white ring-slate-100'
                }`}>
                  {emp.initials}
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate leading-tight">{emp.name}</h4>
                  <p className="text-xs font-semibold text-blue-600 truncate mt-0.5">{emp.projectRole}</p>
                  <p className="text-[11px] text-slate-400 font-medium truncate">{emp.designation}</p>
                </div>
              </div>

              {/* Selection Checkbox Pill */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isSelected ? 'bg-blue-600 text-white shadow-xs' : 'border-2 border-slate-300 bg-white'
              }`}>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

