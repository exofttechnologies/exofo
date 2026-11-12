import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { Project } from '../types';
import { DashboardHeader } from '../components/DashboardHeader';
import { WelcomeSection } from '../components/WelcomeSection';
import { LayeredFolderNavigation } from '../components/LayeredFolderNavigation';
import { DashboardStatistics } from '../components/DashboardStatistics';
import { CurrentProjects } from '../components/CurrentProjects';
import { NotificationsModal } from '../components/NotificationsModal';
import { ProfileDrawer } from '../components/ProfileDrawer';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    projectService.getAllProjects().then((list) => {
      setRecentProjects(list.slice(0, 2));
    }).catch(() => {});
  }, []);

  // Handle Main Card Status Filter Click -> Navigates to /projects with filter
  const handleStatusFilter = (status: string) => {
    navigate(`/projects?status=${encodeURIComponent(status)}`);
  };

  // Handle Stat Card Click
  const handleStatClick = (statId: string) => {
    if (statId === 'assigned-projects') {
      navigate('/projects');
    } else {
      navigate('/tasks');
    }
  };

  return (
    <div className="w-full">
      {/* Mobile-Only Top Header (Desktop uses top bar from Layout) */}
      <div className="lg:hidden">
        <DashboardHeader
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="w-full">
        {/* Top Welcome Section */}
        <WelcomeSection />

        {/* Responsive Content Grid: On Desktop, arranges into balanced columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Main Showcase Column (Full width on mobile, 7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Layered Folder Navigation & Electric Blue Projects Card */}
            <div>
              <LayeredFolderNavigation
                onFilterStatus={handleStatusFilter}
              />
            </div>

            {/* Current Projects Section */}
            <div>
              <CurrentProjects
                projects={recentProjects}
                onViewAll={() => navigate('/projects')}
                onSelectProject={(project) => navigate(`/projects/${project.id}`)}
              />
            </div>
          </div>

          {/* Secondary Column: Statistics Cards (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <div className="hidden lg:flex items-center justify-between mb-3 px-1">
                <h3 className="text-[17px] font-bold tracking-tight text-slate-900">
                  Performance & Workload
                </h3>
                <span className="text-xs font-semibold text-blue-600">Updated Real-Time</span>
              </div>

              {/* 2x2 Statistics Grid */}
              <DashboardStatistics onSelectStat={handleStatClick} />
            </div>

            {/* Desktop Additional Glassmorphism Widget: System Quick Access */}
            <div className="hidden lg:block glass-surface rounded-[24px] p-5">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Enterprise Operations</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Manage organization-wide departments, automated workflows, and SOC-2 security protocols.
              </p>
              
              <div className="grid grid-cols-2 gap-2.5">
                <button 
                  onClick={() => navigate('/projects')}
                  className="p-3 rounded-2xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-100 text-left transition-colors"
                >
                  <p className="text-xs font-bold text-blue-900">All Projects</p>
                  <p className="text-[11px] font-medium text-blue-600 mt-0.5">Active Workspaces</p>
                </button>

                <button 
                  onClick={() => navigate('/tasks')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-left transition-colors"
                >
                  <p className="text-xs font-bold text-slate-900">All Tasks</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Assigned & Pipeline</p>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Notifications Modal Drawer */}
      <NotificationsModal 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Profile Menu Drawer (Accessible via avatar on mobile & header) */}
      <ProfileDrawer 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};
