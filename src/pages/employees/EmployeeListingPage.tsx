import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building, 
  Edit3, 
  Eye, 
  ArrowRight, 
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Bell
} from 'lucide-react';
import { Employee, EmployeeAccountStatus } from '../../types';
import { employeeService } from '../../services/employeeService';
import { NotificationsModal } from '../../components/NotificationsModal';
import { ProfileDrawer } from '../../components/ProfileDrawer';

export const EmployeeListingPage: React.FC = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [designationFilter, setDesignationFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getEmployees({
        search,
        designation: designationFilter,
        status: statusFilter,
        department: departmentFilter,
      });
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [search, designationFilter, statusFilter, departmentFilter]);

  // Extract unique departments and designations for filter dropdowns
  const designations = Array.from(new Set(employees.map((e) => e.designation)));
  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const handleResetFilters = () => {
    setSearch('');
    setDesignationFilter('All');
    setStatusFilter('All');
    setDepartmentFilter('All');
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    designationFilter !== 'All' ||
    statusFilter !== 'All' ||
    departmentFilter !== 'All';

  return (
    <div className="w-full pb-32 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/profile')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] rotate-180" />
          <span>Profile</span>
        </button>

        <span className="text-slate-300">•</span>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-full bg-white/60 hover:bg-white border border-slate-200/80 shadow-2xs transition-all active:scale-95"
        >
          <span>Dashboard</span>
        </button>
      </div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-100">
              Talent & Staff
            </span>
            <span className="text-xs text-slate-400 font-semibold">• {employees.length} Members</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Employee Directory
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Manage company personnel, designations, account statuses, and assignments.
          </p>
        </div>

        {/* Action Buttons & Top Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/employees/create')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#1261E8] to-[#0645B5] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4 stroke-[2.2]" />
            <span>Add Employee</span>
          </button>

          <button
            onClick={() => setIsNotificationsOpen(true)}
            aria-label="Notifications"
            className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-700 hover:text-blue-600 transition-all hover:scale-105 active:scale-95"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsProfileOpen(true)}
            aria-label="Profile Menu"
            className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-2xs hover:scale-105 active:scale-95 transition-all"
          >
            {(localStorage.getItem('exofo_user_name') || 'AD').substring(0, 2).toUpperCase()}
          </button>
        </div>
      </header>

      {/* Search & Filters Bar */}
      <div className="glass-surface rounded-[24px] p-4 sm:p-5 border border-white/80 shadow-glass space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Designation Filter */}
          <div>
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="All">All Designations</option>
              {designations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="All">All Departments</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                title="Reset filters"
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Employee Cards Responsive Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-surface rounded-[24px] p-5 h-56" />
          ))}
        </div>
      ) : employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {employees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => navigate(`/employees/${emp.employeeId}`)}
              role="button"
              tabIndex={0}
              className="group glass-surface stat-card-hover rounded-[24px] p-5 cursor-pointer border border-white/80 hover:border-blue-300 transition-all duration-200 flex flex-col justify-between shadow-2xs select-none"
            >
              {/* Top Row: Avatar, Name & Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] text-white flex items-center justify-center font-extrabold text-sm shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                      {emp.initials}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors text-base leading-tight">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {emp.designation}
                      </p>
                    </div>
                  </div>

                  {/* Account Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      emp.accountStatus === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        emp.accountStatus === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    <span>{emp.accountStatus}</span>
                  </span>
                </div>

                {/* Metadata Pills */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold">
                    {emp.employeeId}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                    {emp.department}
                  </span>
                  {emp.currentTaskCount !== undefined && (
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                      {emp.currentTaskCount} Tasks
                    </span>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100/90">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/employees/${emp.employeeId}/edit`);
                    }}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                    title="Edit Employee"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/employees/${emp.employeeId}/assignments`);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-colors"
                  >
                    Assignments
                  </button>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-surface rounded-[28px] p-8 sm:p-12 text-center max-w-md mx-auto my-6 border border-white/80">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No Employees Found
          </h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            No employees match your current search query or filter selection.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-full bg-white text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-50"
            >
              Reset Filters
            </button>
            <button
              onClick={() => navigate('/employees/create')}
              className="px-4 py-2 rounded-full bg-[#1261E8] text-white text-xs font-bold shadow-xs hover:bg-blue-700"
            >
              Add Employee
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
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

