import React from 'react';
import { 
  Home, 
  ListTodo, 
  Folder, 
  User, 
  Plus 
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavTab } from '../types';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isProjectsPage = location.pathname.startsWith('/projects');
  const isTasksPage = location.pathname.startsWith('/tasks');
  const showPlusButton = isProjectsPage || isTasksPage;

  const getActiveTab = (): NavTab => {
    const path = location.pathname;
    if (path.startsWith('/tasks')) return 'tasks';
    if (path.startsWith('/projects')) return 'projects';
    if (path.startsWith('/profile') || path.startsWith('/employees') || path.startsWith('/project-history')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home, path: '/' },
    { id: 'tasks' as NavTab, label: 'Tasks', icon: ListTodo, path: '/tasks' },
    { id: 'projects' as NavTab, label: 'Projects', icon: Folder, path: '/projects' },
    { id: 'profile' as NavTab, label: 'Profile', icon: User, path: '/profile' },
  ];

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProjectsPage) {
      window.dispatchEvent(new CustomEvent('open-create-project-modal'));
    } else if (isTasksPage) {
      navigate('/tasks/create');
    }
  };

  return (
    <nav 
      aria-label="Bottom Navigation"
      className={`fixed bottom-4 inset-x-0 mx-auto px-4 z-50 pointer-events-auto flex items-center justify-center transition-all duration-300 select-none lg:hidden ${
        showPlusButton 
          ? 'w-full max-w-[430px] gap-2.5 sm:gap-3.5' 
          : 'w-full max-w-[390px] sm:max-w-[420px]'
      }`}
    >
      {/* Pill: White Frosted Capsule with Navigation Tabs */}
      <div 
        className={`bg-white/85 backdrop-blur-2xl rounded-full p-1.5 sm:p-2 shadow-[0_12px_32px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] border border-white/90 flex items-center justify-between transition-all duration-300 ${
          showPlusButton ? 'flex-1' : 'w-full'
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              className={`relative flex items-center justify-center transition-all duration-300 rounded-full ${
                isActive
                  ? 'bg-white text-slate-900 px-4 sm:px-5 py-2 sm:py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-slate-100/90 gap-2 font-bold text-xs sm:text-sm flex-shrink-0'
                  : 'text-slate-400 hover:text-slate-700 px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-white/50 active:scale-95 flex-1 flex justify-center'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'stroke-[2.2] text-slate-900' : 'stroke-[1.8]'
                }`} 
              />
              {isActive && (
                <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 whitespace-nowrap">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Separate Blue Floating Plus Button (Only rendered when on Project or Task page) */}
      {showPlusButton && (
        <button
          onClick={handlePlusClick}
          aria-label={isProjectsPage ? 'Create Project' : 'Create Task'}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#0645B5] via-[#0D55D2] to-[#1261E8] text-white shadow-[0_8px_24px_rgba(18,97,232,0.4)] border-2 border-white/90 flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95 transition-all duration-200 animate-scale-up"
        >
          <Plus className="w-6 h-6 stroke-[2.6] transition-transform duration-200" />
        </button>
      )}
    </nav>
  );
};
