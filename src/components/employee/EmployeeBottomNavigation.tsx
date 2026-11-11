import React from 'react';
import { Home, Layers, CheckSquare, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const EmployeeBottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const p = location.pathname;
    if (p.includes('/tasks')) return 'tasks';
    if (p.includes('/projects')) return 'projects';
    if (p.includes('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/employee/dashboard' },
    { id: 'projects', label: 'Projects', icon: Layers, path: '/employee/projects' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/employee/tasks' },
    { id: 'profile', label: 'Profile', icon: User, path: '/employee/profile' },
  ];

  return (
    <nav
      aria-label="Employee Navigation"
      className="fixed bottom-5 inset-x-0 mx-auto px-4 z-50 pointer-events-auto flex items-center justify-center select-none"
    >
      <div className="w-full max-w-[390px] sm:max-w-[420px] bg-white/85 backdrop-blur-2xl rounded-full p-1.5 sm:p-2 shadow-[0_16px_36px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] border border-white/90 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              className={`relative flex items-center justify-center transition-all duration-300 rounded-full ${
                isActive
                  ? 'bg-slate-900 text-white px-4 sm:px-5 py-2 sm:py-2.5 shadow-md border border-slate-800 gap-2 font-bold text-xs sm:text-sm flex-shrink-0'
                  : 'text-slate-500 hover:text-slate-900 px-3 sm:px-4 py-2 hover:bg-white/60 active:scale-95 flex-1 flex flex-col items-center justify-center gap-0.5'
              }`}
            >
              <Icon
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 ${
                  isActive ? 'stroke-[2.2] text-white' : 'stroke-[1.8] text-slate-500'
                }`}
              />
              <span
                className={`text-[11px] sm:text-xs tracking-tight whitespace-nowrap ${
                  isActive ? 'font-bold text-white' : 'font-semibold text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

