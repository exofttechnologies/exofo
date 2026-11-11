import React from 'react';
import { X, Check, Bell, Briefcase, Calendar, MessageSquare } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Project Milestone Achieved',
      desc: 'Dhabhi Cart reached 65% completion with Stripe checkout verified.',
      time: '12m ago',
      icon: Briefcase,
      unread: true,
    },
    {
      id: 2,
      title: 'New Task Due Tomorrow',
      desc: 'TrackED academic grading syllabus audit is due on Wednesday.',
      time: '1h ago',
      icon: Calendar,
      unread: true,
    },
    {
      id: 3,
      title: 'Team Update',
      desc: 'Sarah added 3 new test scenarios to QA dashboard.',
      time: '4h ago',
      icon: MessageSquare,
      unread: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-white/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-[#F8FAFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Notifications</h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                className={`p-3.5 rounded-2xl border transition-all ${
                  item.unread 
                    ? 'bg-blue-50/50 border-blue-100/80 shadow-2xs' 
                    : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.unread ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <span className="text-[11px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-[#F8FAFF] border-t border-slate-100 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            Mark all as read
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

