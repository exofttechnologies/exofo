import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Key,
  Lock,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { EmployeeHeader } from '../../components/employee/EmployeeHeader';
import { EmployeeBottomNavigation } from '../../components/employee/EmployeeBottomNavigation';
import { NotificationsModal } from '../../components/NotificationsModal';
import { Employee } from '../../types';

export const EmployeeChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const activeIdentifier =
          localStorage.getItem('exofo_employee_id') ||
          localStorage.getItem('exofo_user_email') ||
          'emp-ahmed';
        const resolved = await employeeService.resolveEmployeeProfile(activeIdentifier);
        setEmployee(resolved);
      } catch {
        // Handle gracefully in submit if missing
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const targetIdentifier =
        employee?.employeeId ||
        employee?.id ||
        localStorage.getItem('exofo_employee_id') ||
        localStorage.getItem('exofo_user_email') ||
        'emp-ahmed';

      const result = await employeeService.changeEmployeePassword(targetIdentifier, {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSuccessToast(result.message || 'Password updated successfully!');

      setTimeout(() => {
        navigate('/employee/profile');
      }, 1100);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#F7F9FC] text-slate-900 relative antialiased overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.08) 1.25px, transparent 1.25px)',
        backgroundSize: '22px 22px',
      }}
    >
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* Abstract Ambient Flowing Colour Textures */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute -top-32 -right-28 w-[520px] h-[520px] rounded-full bg-blue-500/10 blur-[125px]" />
        <div className="absolute bottom-12 -left-32 w-[460px] h-[460px] rounded-full bg-slate-900/7 blur-[130px]" />
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Top Bar */}
        <EmployeeHeader
          employee={employee}
          unreadCount={2}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => navigate('/employee/profile')}
        />

        {/* Back Navigation */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/employee/profile')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/85 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to My Profile</span>
          </button>
        </div>

        {/* Page Title directly on background */}
        <section className="mb-7 select-none">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Change Password
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Update your employee account password to keep your workspace protected.
          </p>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 flex items-start gap-3 text-xs sm:text-sm text-rose-700 font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Change Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative pt-4">
            <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
              <Key className="w-3.5 h-3.5 text-blue-600 stroke-[2.2]" />
              <span className="text-[11px] font-bold text-slate-800">Password Security</span>
            </div>

            <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-7 shadow-[0_12px_34px_rgba(15,23,42,0.04)] space-y-4">
              <div
                className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/15 via-slate-400/5 to-transparent blur-2xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative z-10 space-y-4">
                {/* Current Password */}
                <div>
                  <label htmlFor="empCurrentPwd" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Current Password <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="empCurrentPwd"
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                      required
                      className="w-full px-4 py-3 pr-11 rounded-2xl bg-white/90 border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="empNewPwd" className="block text-xs font-bold text-slate-700 mb-1.5">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="empNewPwd"
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3 pr-11 rounded-2xl bg-white/90 border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      aria-label={showNew ? 'Hide new password' : 'Show new password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                    Must be at least 8 characters long and differ from your current password.
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="empConfirmPwd" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="empConfirmPwd"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3 pr-11 rounded-2xl bg-white/90 border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Security Policy Reminder */}
                <div className="p-3.5 rounded-2xl bg-blue-50/75 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-[11px] font-medium">
                    Passwords are cryptographically salted and hashed before storage and are never saved or displayed in plain text.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate('/employee/profile')}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full bg-white/85 hover:bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      <EmployeeBottomNavigation />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};
