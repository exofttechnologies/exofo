import React from 'react';
import { Bell } from 'lucide-react';

interface DashboardHeaderProps {
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenNotifications,
  onOpenProfile,
}) => {
  const userName = localStorage.getItem('exofo_user_name') || 'Admin';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AD';

  return (
    <header className="flex items-center justify-between pt-1 pb-4">
      {/* Brand Identity */}
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900 leading-tight">
          Exofo
        </h1>
        <p className="text-[13px] font-medium text-slate-500 tracking-normal mt-0.5">
          Company Management
        </p>
      </div>

      {/* Right Actions: Notifications & Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell Button */}
        <button
          onClick={onOpenNotifications}
          aria-label="View notifications"
          className="relative w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center text-slate-800 transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95"
        >
          <Bell className="w-5 h-5 text-slate-800 stroke-[2.2]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#111827] ring-2 ring-white" />
        </button>

        {/* Circular Admin Profile Avatar */}
        <button
          onClick={onOpenProfile}
          aria-label="Open profile menu"
          className="w-11 h-11 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-sm transition-all duration-200 hover:bg-slate-800 hover:scale-105 active:scale-95 ring-2 ring-white/60"
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
};

