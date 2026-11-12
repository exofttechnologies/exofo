import React from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Archive, 
  UserCheck, 
  Edit3, 
  Key, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { initialAdminProfile } from '../data/mockData';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleSignOut = () => {
    localStorage.removeItem('exofo_auth');
    localStorage.removeItem('exofo_employee_id');
    localStorage.removeItem('exofo_user_role');
    onClose();
    navigate('/login');
  };

  const menuSections = [
    {
      heading: 'Employee Management',
      items: [
        {
          label: 'Employee Listing',
          sublabel: 'View, search & manage staff',
          icon: Users,
          path: '/employees',
          badge: '11 Staff',
        },
        {
          label: 'Add Employee',
          sublabel: 'Create new employee account',
          icon: UserPlus,
          path: '/employees/create',
        },
      ],
    },
    {
      heading: 'Project History',
      items: [
        {
          label: 'Project History',
          sublabel: 'Completed & archived records',
          icon: Archive,
          path: '/project-history',
          badge: 'Historical',
        },
      ],
    },
    {
      heading: 'Admin Profile',
      items: [
        {
          label: 'Admin Profile',
          sublabel: 'Account details & security logs',
          icon: UserCheck,
          path: '/profile',
        },
        {
          label: 'Edit Profile',
          sublabel: 'Update name, contact & avatar',
          icon: Edit3,
          path: '/profile/edit',
        },
        {
          label: 'Change Password',
          sublabel: 'Manage credentials & security',
          icon: Key,
          path: '/profile/change-password',
        },
      ],
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm h-full bg-white/95 backdrop-blur-2xl shadow-2xl border-l border-white/80 flex flex-col justify-between overflow-hidden animate-slide-left select-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Admin Profile Menu"
      >
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-br from-[#1261E8] via-[#0D55D2] to-[#0645B5] text-white relative">
          <button
            onClick={onClose}
            aria-label="Close Profile Menu"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all active:scale-95"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center font-extrabold text-xl ring-4 ring-white/25 shadow-md">
              {initialAdminProfile.initials}
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold mb-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Super Admin</span>
              </div>
              <h2 className="font-extrabold text-lg leading-tight text-white">
                {initialAdminProfile.name}
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                {initialAdminProfile.email}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
                {section.heading}
              </h3>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all duration-200 group ${
                        isActive
                          ? 'bg-blue-50 text-[#1261E8] font-bold shadow-2xs'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                            isActive
                              ? 'bg-[#1261E8] text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                          }`}
                        >
                          <Icon className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold truncate">{item.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">
                            {item.sublabel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Sign Out */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 font-bold text-xs transition-colors active:scale-95 shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Admin Panel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
