import React from 'react';
import { X, CheckCircle, Clock, Calendar, Users, BarChart3 } from 'lucide-react';
import { Project } from '../types';

interface ProjectDetailsModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  onClose,
}) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100 bg-[#F8FAFF]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>{project.status}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{project.name}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{project.description}</p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Progress Section */}
          <div className="bg-[#F5F8FF] rounded-[20px] p-4 border border-[#E6EFFD]">
            <div className="flex justify-between items-center text-sm font-semibold mb-2">
              <span className="text-slate-600 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Overall Completion
              </span>
              <span className="text-slate-900 font-bold">{project.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-white rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-[16px] p-3 text-center border border-slate-100">
              <Calendar className="w-4 h-4 text-slate-500 mx-auto mb-1" />
              <div className="text-xs text-slate-500 font-medium">Timeline</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">Q4 2026</div>
            </div>

            <div className="bg-slate-50 rounded-[16px] p-3 text-center border border-slate-100">
              <Users className="w-4 h-4 text-slate-500 mx-auto mb-1" />
              <div className="text-xs text-slate-500 font-medium">Team</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">6 Members</div>
            </div>

            <div className="bg-slate-50 rounded-[16px] p-3 text-center border border-slate-100">
              <Clock className="w-4 h-4 text-slate-500 mx-auto mb-1" />
              <div className="text-xs text-slate-500 font-medium">Priority</div>
              <div className="text-sm font-bold text-blue-600 mt-0.5">High</div>
            </div>
          </div>

          {/* Tasks in this Project */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">Recent Milestone Tasks</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-700">Database Architecture & Schema Design</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-700">Stripe Payment Gateway Integration</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-blue-900">End-to-End User Testing & Security Audit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-[#F8FAFF]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

