import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Archive, 
  Search, 
  Filter, 
  RotateCcw, 
  Building, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  FolderArchive,
  ArrowLeft,
  Bell
} from 'lucide-react';
import { Project } from '../../types';
import { projectHistoryService } from '../../services/projectHistoryService';
import { NotificationsModal } from '../../components/NotificationsModal';
import { ProfileDrawer } from '../../components/ProfileDrawer';
import { initialAdminProfile } from '../../data/mockData';

export const ProjectHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Archived'>('All');

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const loadHistoricalProjects = async () => {
    try {
      setLoading(true);
      const data = await projectHistoryService.getHistoricalProjects({
        search,
        status: statusFilter,
      });
      setProjects(data);
    } catch (err) {
      console.error('Failed to load project history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistoricalProjects();
  }, [search, statusFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
  };

  return (
    <div className="w-full pb-32 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/profile')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Profile</span>
        </button>

        <span className="text-slate-300">•</span>

        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-full bg-white/60 hover:bg-white border border-slate-200/80 shadow-2xs transition-all active:scale-95"
        >
          <span>All Active Projects</span>
        </button>
      </div>

      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs border border-slate-200">
              Historical Archive
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Completed & Inactive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Project History
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Audit logs and deliverable archives for completed and retired company initiatives.
          </p>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNotificationsOpen(true)}
            aria-label="Notifications"
            className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-700 hover:text-blue-600 transition-all hover:scale-105 active:scale-95"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsProfileOpen(true)}
            aria-label="Profile Menu"
            className="w-10 h-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-2xs hover:scale-105 active:scale-95 transition-all"
          >
            {initialAdminProfile.initials}
          </button>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="glass-surface rounded-[24px] p-4 sm:p-5 border border-white/80 shadow-glass space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs w-full sm:w-auto">
            {(['All', 'Completed', 'Archived'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  statusFilter === s
                    ? 'bg-[#1261E8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'All' ? 'All History' : s}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search historical projects or clients..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Historical Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-surface rounded-[26px] p-6 h-60" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/project-history/${proj.id}`)}
              role="button"
              tabIndex={0}
              className="group glass-surface stat-card-hover rounded-[26px] p-6 cursor-pointer border border-white/80 hover:border-blue-300 transition-all duration-200 flex flex-col justify-between shadow-2xs select-none"
            >
              <div>
                {/* Meta tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs border border-slate-200">
                    {proj.projectCode}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border ${
                      proj.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        proj.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                    />
                    <span>{proj.status}</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors text-lg mb-1 leading-tight">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {proj.description}
                </p>

                {/* Client Information */}
                <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-100 space-y-1 mb-4 text-xs">
                  <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px]">
                    <span>Client / Sponsor</span>
                    <span>Corporate Org</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="truncate pr-2">{proj.client.name}</span>
                    <span className="text-slate-600 text-[11px] truncate max-w-[140px]">
                      {proj.client.company || 'Enterprise Client'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer: Completion Date & View Details */}
              <div className="pt-3 border-t border-slate-100/90 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Closed: {proj.expectedCompletionDate || 'Recorded'}</span>
                </div>

                <div className="inline-flex items-center gap-1 font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Audit Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-surface rounded-[28px] p-8 sm:p-12 text-center max-w-md mx-auto my-6 border border-white/80">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <Archive className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No Historical Records
          </h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            No completed or archived projects match your filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-full bg-white text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-50 shadow-2xs"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Modals */}
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

