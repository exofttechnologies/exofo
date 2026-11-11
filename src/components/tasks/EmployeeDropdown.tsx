import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Check, Search, X } from 'lucide-react';
import { ProjectEmployee } from '../../types';

interface EmployeeDropdownProps {
  employees: ProjectEmployee[];
  selectedEmployeeId?: string;
  onSelect: (employee: ProjectEmployee | null) => void;
  label?: string;
}

export const EmployeeDropdown: React.FC<EmployeeDropdownProps> = ({
  employees,
  selectedEmployeeId,
  onSelect,
  label = 'Assign Employee (Optional)',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase())
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
          {selectedEmployee ? (
            <>
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {selectedEmployee.initials}
              </div>
              <div className="truncate">
                <span className="font-bold text-slate-900">{selectedEmployee.name}</span>
                <span className="text-slate-400 text-xs ml-1.5">({selectedEmployee.id} • {selectedEmployee.designation})</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <User className="w-4 h-4" />
              <span>Select an employee or leave unassigned</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {selectedEmployee && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Remove employee assignment"
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
        <div className="absolute z-50 mt-2 w-full rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden animate-fade-in">
          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, or role..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* List Options */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {/* Unassigned Option */}
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                !selectedEmployeeId ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span className="italic">No employee assigned (Unassigned)</span>
              {!selectedEmployeeId && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            {filteredEmployees.map((emp) => {
              const isSelected = selectedEmployeeId === emp.id;
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => {
                    onSelect(emp);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {emp.initials}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-900">{emp.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {emp.id} • {emp.designation}
                      </p>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </button>
              );
            })}

            {filteredEmployees.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching employees found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

