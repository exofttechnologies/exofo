import React, { useState, useEffect } from 'react';
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
import { adminProfileService } from '../services/adminProfileService';
import { AdminProfile } from '../types';

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

  const [profile, setProfile] = useState<AdminProfile | null>(null);

  useEffect(() => {
    if (isOpen) {
      adminProfileService.getProfile().then(setProfile).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleSignOut = () => {
    localStorage.removeItem('exofo_auth');
    localStorage.removeItem('exofo_token');
    localStorage.removeItem('exofo_user_email');
    localStorage.removeItem('exofo_user_role');
    localStorage.removeItem('exofo_user_name');
    localStorage.removeItem('exofo_employee_id');
    localStorage.removeItem('exofo_employee_code');
    onClose();
    navigate('/login');
  };

  const userName = profile?.name || localStorage.getItem('exofo_user_name') || 'Admin';
  const userEmail = profile?.email || localStorage.getItem('exofo_user_email') || 'admin@exofo.internal';
  const userInitials = profile?.initials || userName.substring(0, 2).toUpperCase();

  const menuSections = [
    {
      heading: 'Employee Management',
      items: [
        {
          label: 'Employee Listing',
          sublabel: 'View, search & manage staff',
          icon: Users,
          path: '/employees',
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
              {userInitials}
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold mb-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Super Admin</span>
              </div>
              <h2 className="font-extrabold text-lg leading-tight text-white">
                {userName}
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                {userEmail}
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
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-none">{item.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.sublabel}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Sign Out */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
