import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Mail,
  Camera,
  Check,
  AlertCircle,
  CheckCircle2,
  Lock,
  Trash2,
} from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { EmployeeHeader } from '../../components/employee/EmployeeHeader';
import { EmployeeBottomNavigation } from '../../components/employee/EmployeeBottomNavigation';
import { NotificationsModal } from '../../components/NotificationsModal';
import { Employee } from '../../types';

export const EmployeeProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('');

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const activeIdentifier =
          localStorage.getItem('exofo_employee_id') ||
          localStorage.getItem('exofo_user_email') ||
          'emp-ahmed';

        const data = await employeeService.getEmployeeProfile(activeIdentifier);
        setEmployee(data.employee);
        setName(data.employee.name || '');
        setPhone(data.employee.phone || '');
        setAddress(data.employee.address || '');
        setAvatar(data.employee.avatar || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Profile image must be smaller than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Unable to read the selected image file.');
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Mobile Number is required.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await employeeService.updateEmployeeSelfProfile(employee.employeeId || employee.id, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        avatar,
      });

      setSuccessToast('Your profile has been updated!');
      setTimeout(() => {
        navigate('/employee/profile');
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile changes.');
      setIsSubmitting(false);
    }
  };

  const previewInitials = (() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (name.trim() || employee?.initials || 'EM').substring(0, 2).toUpperCase();
  })();

  return (
    <div
      className="min-h-screen w-full bg-[#F7F9FC] text-slate-900 relative antialiased overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.08) 1.25px, transparent 1.25px)',
        backgroundSize: '22px 22px',
      }}
    >
      {/* Toast Notification */}
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
        <div className="absolute bottom-12 -left-32 w-[460px] h-[460px] rounded-full bg-rose-500/8 blur-[130px]" />
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
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
            Edit Profile
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Update your profile image, name, mobile number, and address.
          </p>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="rounded-[28px] bg-white/70 border border-white/80 p-8 animate-pulse space-y-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-200/70" />
            <div className="h-11 rounded-2xl bg-slate-200/60" />
            <div className="h-11 rounded-2xl bg-slate-200/60" />
            <div className="h-20 rounded-2xl bg-slate-200/60" />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 flex items-start gap-3 text-xs sm:text-sm text-rose-700 font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Edit Form Folder Card */}
        {!loading && employee && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative pt-4">
              <div className="absolute top-0 left-4 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-t-[14px] bg-white/85 backdrop-blur-md border border-b-0 border-white/95 shadow-2xs">
                <User className="w-3.5 h-3.5 text-blue-600 stroke-[2.2]" />
                <span className="text-[11px] font-bold text-slate-800">Editable Details</span>
              </div>

              <div className="relative overflow-hidden rounded-[28px] rounded-tl-[8px] bg-white/75 backdrop-blur-xl border border-white/95 p-5 sm:p-7 shadow-[0_12px_34px_rgba(15,23,42,0.04)] space-y-5">
                <div
                  className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/15 via-sky-300/5 to-transparent blur-2xl pointer-events-none"
                  aria-hidden="true"
                />

                {/* Profile Image Selector */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-slate-200/60">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name || employee.name}
                      className="w-20 h-20 rounded-[24px] object-cover ring-4 ring-white shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-[24px] bg-gradient-to-tr from-slate-900 via-[#162569] to-[#1261E8] text-white flex items-center justify-center font-black text-2xl ring-4 ring-white shadow-md flex-shrink-0">
                      {previewInitials}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-800">Profile Image</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{avatar ? 'Change Photo' : 'Upload Photo'}</span>
                      </button>

                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 text-xs font-bold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      PNG, JPG, or WebP up to 2 MB.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="relative z-10 space-y-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="empFullName" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="empFullName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-2xs transition-all"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="empPhone" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Mobile Number <span className="text-rose-500">*</span>
                      </span>
                    </label>
                    <input
                      id="empPhone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="e.g. +1 (555) 112-3344"
                      className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-2xs transition-all"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="empAddress" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Address</span>
                    </label>
                    <textarea
                      id="empAddress"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your residential or mailing address..."
                      className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-2xs transition-all resize-y"
                    />
                  </div>

                  {/* Read-only Employment & Auth Notice */}
                  <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Verified Account & Employment Fields (Read-Only)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium pt-1">
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{employee.email}</span>
                      </p>
                      <p className="truncate">
                        ID: <span className="font-bold text-slate-700">{employee.employeeId}</span> • {employee.designation}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Corporate email and employment details are admin-managed and cannot be modified here.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
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
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <EmployeeBottomNavigation />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

