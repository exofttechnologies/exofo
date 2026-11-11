import React, { useState, useRef, useEffect } from 'react';
import { Folder, ChevronDown, Check, Search, X, Sparkles } from 'lucide-react';
import { Project } from '../../types';

interface ProjectDropdownProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelect: (project: Project | null) => void;
  label?: string;
}

export const ProjectDropdown: React.FC<ProjectDropdownProps> = ({
  projects,
  selectedProjectId,
  onSelect,
  label = 'Select Project (Optional)',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const isIndependent = !selectedProjectId || selectedProjectId === 'independent';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">
        {label}
      </label>

      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-left text-xs sm:text-sm text-slate-800 shadow-2xs hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
      >
        <div className="flex items-center gap-2.5 truncate">
          {!isIndependent && selectedProject ? (
            <>
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center flex-shrink-0">
                <Folder className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="font-bold text-slate-900">{selectedProject.name}</span>
                <span className="text-slate-400 text-xs ml-1.5">({selectedProject.projectCode} • {selectedProject.status})</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Independent Task (Not associated with any project)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isIndependent && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Set as independent task"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden animate-fade-in">
          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search running projects..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* List Options */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {/* Independent Task Option */}
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                isIndependent ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="font-bold text-slate-900">Independent Task</p>
                  <p className="text-[11px] text-slate-400">Standalone operational task without project dependency</p>
                </div>
              </div>
              {isIndependent && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
            </button>

            {/* Running Projects */}
            {filteredProjects.map((proj) => {
              const isSelected = selectedProjectId === proj.id;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => {
                    onSelect(proj);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      <Folder className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-900">{proj.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {proj.projectCode} • {proj.status} • {proj.progress}%
                      </p>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </button>
              );
            })}

            {filteredProjects.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching projects found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

