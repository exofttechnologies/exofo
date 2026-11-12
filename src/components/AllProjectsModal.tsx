import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Project } from '../types';
import { projectService } from '../services/projectService';
import { ProjectSummaryCard } from './ProjectSummaryCard';

interface AllProjectsModalProps {
  isOpen: boolean;
  initialFilter?: string;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

export const AllProjectsModal: React.FC<AllProjectsModalProps> = ({
  isOpen,
  initialFilter = 'All',
  onClose,
  onSelectProject,
}) => {
  const [filter, setFilter] = useState<string>(initialFilter);
  const [search, setSearch] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (isOpen) {
      projectService.getAllProjects().then(setProjects).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter((p) => {
    const matchesFilter = filter === 'All' || p.status === filter;
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white rounded-[28px] shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFF]">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Active Company Projects</h3>
            <p className="text-xs text-slate-500 mt-0.5">{projects.length} Total projects under management</p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1">
            {['All', 'In Progress', 'Completed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === s
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Project List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 font-semibold">
              No matching projects found.
            </div>
          ) : (
            filteredProjects.map((p) => (
              <ProjectSummaryCard
                key={p.id}
                project={p}
                onClick={() => onSelectProject(p)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
