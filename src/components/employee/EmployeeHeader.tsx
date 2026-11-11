import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Employee } from '../../types';

interface EmployeeHeaderProps {
  employee: Employee | null;
  unreadCount?: number;
  onOpenNotifications: () => void;
  onOpenProfile?: () => void;
}

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
  employee,
  unreadCount = 2,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      navigate('/employee/profile');
    }
  };

  return (
    <header className="w-full flex items-center justify-between py-4 sm:py-5 mb-4 sm:mb-6 select-none">
      {/* Left: Brand Logo */}
      <div 
        onClick={() => navigate('/employee/dashboard')}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-900 via-[#162569] to-[#1261E8] flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
          <span className="text-white font-black text-sm tracking-tighter">EX</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">
            EXOFO
          </span>
          <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase leading-none mt-1">
            Employee Workspace
          </span>
        </div>
      </div>

      {/* Right: Notifications & Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          aria-label="View notifications"
          className="relative w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-700 hover:text-blue-600 transition-all hover:scale-105 active:scale-95"
        >
          <Bell className="w-4 h-4 stroke-[2]" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Employee Profile Avatar */}
        <div
          onClick={handleAvatarClick}
          role="button"
          tabIndex={0}
          aria-label="Employee Profile"
          className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 shadow-2xs cursor-pointer hover:border-blue-300 transition-all active:scale-95"
        >
          {employee?.avatar ? (
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
              {employee?.initials || employee?.name?.substring(0, 2).toUpperCase() || 'EM'}
            </div>
          )}
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-none truncate max-w-[110px]">
              {employee?.name || 'Employee'}
            </span>
            <span className="text-[10px] font-medium text-slate-400 leading-none mt-0.5">
              {employee?.designation || 'Staff'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

