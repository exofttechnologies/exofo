import React from 'react';
import { 
  Home, 
  Folder, 
  CheckCircle2, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Bell,
  UserCheck 
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface DesktopSidebarProps {
  onOpenNotifications: () => void;
  onOpenProfile?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  onOpenNotifications,
  onOpenProfile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainNav = [
    { label: 'Home Dashboard', icon: Home, path: '/' },
    { label: 'Projects', icon: Folder, path: '/projects' },
    { label: 'Tasks & Milestones', icon: CheckCircle2, path: '/tasks' },
  ];

  const secondaryNav = [
    { label: 'Employee Workspace', icon: UserCheck, path: '/employee/dashboard' },
    { label: 'Employee Directory', icon: Users, path: '/employees' },
    { label: 'Project History', icon: FileText, path: '/project-history' },
    { label: 'Admin Profile', icon: Settings, path: '/profile' },
  ];

  const isCurrentActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/80 p-6 flex flex-col justify-between hidden lg:flex select-none flex-shrink-0 min-h-screen sticky top-0 h-screen">
      {/* Brand Header */}
      <div>
        <div 
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          className="flex items-center gap-3 mb-8 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1261E8] to-[#0645B5] flex items-center justify-center text-white font-black text-xl shadow-md">
            E
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Exofo
            </h1>
            <p className="text-xs font-semibold text-slate-400">
              Company Management
            </p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1 mb-8">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
            Overview
          </p>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
            Workspace
          </p>
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-blue-600 stroke-[2.2]' : 'text-slate-400 stroke-[2]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin User Footer Card */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div 
            onClick={() => onOpenProfile ? onOpenProfile() : navigate('/profile')}
            role="button"
            tabIndex={0}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-xs">
              {(localStorage.getItem('exofo_user_name') || 'AD').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">{localStorage.getItem('exofo_user_name') || 'Administrator'}</p>
              <p className="text-[10.5px] font-medium text-slate-400 capitalize">{localStorage.getItem('exofo_user_role') || 'Admin'}</p>
            </div>
          </div>

          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors relative"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 ring-1 ring-white" />
          </button>
        </div>
      </div>
    </aside>
  );
};
