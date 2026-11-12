import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Lock, 
  LogOut, 
  ChevronRight, 
  Users, 
  UserPlus, 
  UserCheck, 
  Edit3, 
  Briefcase, 
  Archive, 
  FolderArchive, 
  Folder, 
  ShieldCheck, 
  Sliders, 
  Bell, 
  Globe, 
  Mail, 
  Phone, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminProfile, Employee, Project } from '../types';
import { adminProfileService } from '../services/adminProfileService';
import { employeeService } from '../services/employeeService';
import { projectHistoryService } from '../services/projectHistoryService';
import { currentProjects } from '../data/mockData';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [historicalProjects, setHistoricalProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Biometrics toggle (matching reference image)
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const [profData, empData, histData] = await Promise.all([
          adminProfileService.getProfile(),
          employeeService.getEmployees(),
          projectHistoryService.getHistoricalProjects(),
        ]);
        setProfile(profData);
        setEmployees(empData);
        setHistoricalProjects(histData);
      } catch (err) {
        console.error('Failed to load admin profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  if (loading || !profile) {
    return (
      <div className="w-full pb-32 max-w-xl mx-auto animate-pulse space-y-5">
        <div className="h-10 w-36 bg-white/70 rounded-full" />
        <div className="h-44 bg-white/70 rounded-[26px]" />
        <div className="h-64 bg-white/70 rounded-[26px]" />
        <div className="h-48 bg-white/70 rounded-[26px]" />
        <div className="h-32 bg-white/70 rounded-[26px]" />
      </div>
    );
  }

  const firstEmployeeId = employees[0]?.employeeId || 'EMP001';
  const firstHistoricalId = historicalProjects[0]?.id || 'proj-4';

  return (
    <div className="w-full pb-32 max-w-xl mx-auto space-y-6 pt-2">
      {/* ------------------------------------------------------------------
          Admin Identity Header Card
          ------------------------------------------------------------------ */}
      <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-slate-100 shadow-glass flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0 ring-4 ring-slate-50">
          {profile.initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
              {profile.name}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100 flex-shrink-0">
              Admin
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium truncate">
            {profile.email}
          </p>

          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {profile.company} • {profile.designation}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          CARD 1: EMPLOYEE MANAGEMENT (Grouped Inset List Card)
          ------------------------------------------------------------------ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Employee Management
          </span>
          <span className="text-[11px] font-bold text-blue-600">
            {employees.length} Staff
          </span>
        </div>

        <div className="bg-white rounded-[26px] border border-slate-100 shadow-glass overflow-hidden divide-y divide-slate-100">
          {/* 1. Employee Listing */}
          <div
            onClick={() => navigate('/employees')}
            role="button"
            tabIndex={0}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/70 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Users className="w-5 h-5 text-slate-500 stroke-[1.6] flex-shrink-0" />
              <span className="text-sm font-medium text-slate-800">
                Employee Listing
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                Directory
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[1.8]" />
            </div>
          </div>

          {/* 2. Add Employee (Separate Page) */}
          <div
            onClick={() => navigate('/employees/create')}
            role="button"
            tabIndex={0}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/70 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <UserPlus className="w-5 h-5 text-slate-500 stroke-[1.6] flex-shrink-0" />
              <span className="text-sm font-medium text-slate-800">
                Add Employee
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600">
                New Account
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[1.8]" />
            </div>
          </div>

          {/* 3. Employee Details */}
          <div
            onClick={() => navigate(`/employees/${firstEmployeeId}`)}
            role="button"
            tabIndex={0}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/70 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <UserCheck className="w-5 h-5 text-slate-500 stroke-[1.6] flex-shrink-0" />
              <span className="text-sm font-medium text-slate-800">
                Employee Details
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                Personnel Profile
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[1.8]" />
            </div>
          </div>

          {/* 4. Edit Employee */}
          <div
            onClick={() => navigate(`/employees/${firstEmployeeId}/edit`)}
            role="button"
            tabIndex={0}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/70 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Edit3 className="w-5 h-5 text-slate-500 stroke-[1.6] flex-shrink-0" />
              <span className="text-sm font-medium text-slate-800">
                Edit Employee
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                Modify Records
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[1.8]" />
            </div>
          </div>

          {/* 5. Employee Assignments */}
          <div
            onClick={() => navigate(`/employees/${firstEmployeeId}/assignments`)}
            role="button"
            tabIndex={0}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/70 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Briefcase className="w-5 h-5 text-slate-500 stroke-[1.6] flex-shrink-0" />
              <span className="text-sm font-medium text-slate-800">
                Employee Assignments
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                Workload & Tasks
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[1.8]" />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          CARD 2: PROJECT HISTORY (Grouped Inset List Card)
          ------------------------------------------------------------------ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Project History & Archives
          </span>
          <span className="text-[11px] font-bold text-slate-600">
            {historicalProjects.length} Historical
          </span>
        </div>

        <div className="bg-white rounded-[26px] border border-slate-100 shadow-glass overflow-hidden divide-y divide-slate-100">
          {/* 6. Project History (Separate Page for Full Project List) */}
          <div
            onClick={() => navigate('/project-history')}
            role="button"
            tabIndex={0}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/70 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Archive className="w-5 h-5 text-slate-500 stroke-[1.6] flex-shrink-0" />
              <span className="text-sm font-medium text-slate-800">
                Project History
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                Full Project List
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[1.8]" />
            </div>
          </div>

          {/* 7. Historical Project Details */}
          <div
            onClick={() => navigate(`/project-history/${firstHistoricalId}`)}
            role="button"
            tabIndex={0}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/70 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <FolderArchive className="w-5 h-5 text-slate-500 stroke-[1.6] flex-shrink-0" />
              <span className="text-sm font-medium text-slate-800">
                Historical Project Details
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                Audit Record
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[1.8]" />
            </div>
          </div>

          {/* 8. All Active Company Projects */}
          <div
            onClick={() => navigate('/projects')}
            role="button"
            tabIndex={0}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/70 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Folder className="w-5 h-5 text-slate-500 stroke-[1.6] flex-shrink-0" />
              <span className="text-sm font-medium text-slate-800">
                All Active Projects
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600">
                {currentProjects.length} Active
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[1.8]" />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          CARD 3: ADMIN SETTINGS & SECURITY (Exact match to reference image)
          ------------------------------------------------------------------ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Admin Profile & Security
          </span>
        </div>

        <div className="bg-white rounded-[26px] border border-slate-100 shadow-glass overflow-hidden divide-y divide-slate-100">
          {/* Settings / Edit Profile */}
          <div
            onClick={() => navigate('/profile/edit')}
            role="button"
            tabIndex={0}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/70 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Settings className="w-5 h-5 text-slate-500 stroke-[1.6] flex-shrink-0" />
              <span className="text-sm font-medium text-slate-800">
                Settings
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          </div>

          {/* Change Password */}
          <div
            onClick={() => navigate('/profile/change-password')}
            role="button"
            tabIndex={0}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/70 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Key className="w-5 h-5 text-slate-500 stroke-[1.6] flex-shrink-0" />
              <span className="text-sm font-medium text-slate-800">
                Change Password
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          </div>

          {/* Enable Fingerprint / Face ID (Exact iOS toggle from image) */}
          <div className="flex items-center justify-between px-5 py-3.5 select-none">
            <div className="flex items-center gap-3.5 min-w-0">
              <Lock className="w-5 h-5 text-slate-500 stroke-[1.6] flex-shrink-0" />
              <span className="text-sm font-medium text-slate-800">
                Enable finger Print/Face ID
              </span>
            </div>

            {/* iOS Green Toggle Switch (matching reference image #34C759) */}
            <button
              type="button"
              onClick={() => setBiometricsEnabled(!biometricsEnabled)}
              aria-label="Toggle fingerprint and face ID"
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out cursor-pointer ${
                biometricsEnabled ? 'bg-[#34C759]' : 'bg-slate-200'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                  biometricsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Security Audit Logs */}
          <div className="flex items-center justify-between px-5 py-3.5 select-none">
            <div className="flex items-center gap-3.5 min-w-0">
              <ShieldCheck className="w-5 h-5 text-slate-500 stroke-[1.6] flex-shrink-0" />
              <span className="text-sm font-medium text-slate-800">
                Security Audit Logs
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-emerald-600">
                AWS Verified
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          CARD 4: SIGN OUT
          ------------------------------------------------------------------ */}
      <div className="bg-white rounded-[26px] border border-slate-100 shadow-glass overflow-hidden">
        <div
          onClick={() => {
            localStorage.removeItem('exofo_auth');
            localStorage.removeItem('exofo_token');
            localStorage.removeItem('exofo_user_email');
            localStorage.removeItem('exofo_user_role');
            localStorage.removeItem('exofo_user_name');
            localStorage.removeItem('exofo_employee_id');
            localStorage.removeItem('exofo_employee_code');
            navigate('/login');
          }}
          role="button"
          tabIndex={0}
          className="flex items-center justify-between px-5 py-3.5 hover:bg-rose-50/70 active:bg-rose-100/70 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <LogOut className="w-5 h-5 text-rose-500 stroke-[1.6] flex-shrink-0" />
            <span className="text-sm font-medium text-rose-600">
              Sign Out
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-rose-400 stroke-[1.8]" />
        </div>
      </div>
    </div>
  );
};
