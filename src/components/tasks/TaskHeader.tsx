import React from 'react';
import { Bell, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currentUser } from '../../data/mockData';
import { TaskSearch } from './TaskSearch';

interface TaskHeaderProps {
  title?: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  showBack?: boolean;
  backUrl?: string;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  showSearch?: boolean;
  actionButton?: React.ReactNode;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  title = 'Tasks',
  subtitle = 'Manage and monitor your ongoing tasks.',
  searchValue = '',
  onSearchChange,
  showBack = false,
  backUrl = '/tasks',
  onOpenNotifications,
  onOpenProfile,
  showSearch = true,
  actionButton,
}) => {
  const navigate = useNavigate();

  return (
    <header className="mb-6 space-y-4">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Back button or Exofo Brand / Category */}
        <div>
          {showBack ? (
            <button
              onClick={() => navigate(backUrl)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Back</span>
            </button>
          ) : (
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
              Task Management
            </span>
          )}
        </div>

        {/* Right: Notifications & Profile Avatar */}
        <div className="flex items-center gap-2.5">
          {actionButton}

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="View notifications"
            className="relative w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            {currentUser.unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#1261E8] ring-2 ring-white" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Admin Profile"
            className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/80 shadow-2xs hover:scale-105 active:scale-95 transition-all"
          >
            {currentUser.initials}
          </button>
        </div>
      </div>

      {/* Title & Subtitle Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Search input in header (if enabled) */}
        {showSearch && onSearchChange && (
          <div className="w-full md:w-80">
            <TaskSearch value={searchValue} onChange={onSearchChange} />
          </div>
        )}
      </div>
    </header>
  );
};

