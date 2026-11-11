import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { BottomNavigation } from './BottomNavigation';
import { NotificationsModal } from './NotificationsModal';
import { ProfileDrawer } from './ProfileDrawer';
import { currentUser } from '../data/mockData';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // For /login route, render full-screen without dashboard frame
  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F5F8FF] flex flex-col antialiased relative overflow-x-hidden">
      {/* ------------------------------------------------------------------
          Ambient Background Curved Ribbons (Exact match to reference design)
          ------------------------------------------------------------------ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        {/* Soft curved ribbon path running from top right across the canvas */}
        <svg 
          className="absolute -top-12 -right-16 w-[560px] h-[860px] text-blue-200/50" 
          viewBox="0 0 480 780" 
          fill="none"
        >
          <path 
            d="M480 40C380 60 300 160 320 280C340 400 240 500 120 520C0 540 -80 640 -100 760" 
            stroke="currentColor" 
            strokeWidth="36" 
            strokeLinecap="round" 
            className="opacity-40"
          />
        </svg>

        {/* Subtle ambient light shapes */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-sky-100/40 blur-3xl" />
      </div>

      <div className="flex flex-1 w-full">
        {/* Desktop Left Sidebar (Visible on screens >= 1024px) */}
        <DesktopSidebar 
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop Top Header Bar (Visible on screens >= 1024px) */}
          <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/60 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
            {/* Search Bar */}
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects, tasks, or members..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/90 border border-slate-200/80 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsNotificationsOpen(true)}
                aria-label="Notifications"
                className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all relative shadow-xs"
              >
                <Bell className="w-4 h-4" />
                {currentUser.unreadNotifications > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                )}
              </button>

              <div 
                onClick={() => navigate('/profile')}
                role="button"
                tabIndex={0}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white border border-slate-200/80 hover:bg-slate-50 cursor-pointer shadow-xs transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  {currentUser.initials}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</p>
                  <p className="text-[10px] font-semibold text-blue-600 leading-tight mt-0.5">{currentUser.role}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </main>
        </div>
      </div>

      {/* Floating Bottom Navigation Bar (Visible on Mobile / Tablet < 1024px) */}
      <BottomNavigation />

      {/* Modals & Drawers */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

