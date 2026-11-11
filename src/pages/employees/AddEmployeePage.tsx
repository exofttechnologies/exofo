import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  UserPlus, 
  Check, 
  Calendar, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Key, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { EmployeeAccountStatus } from '../../types';

export const AddEmployeePage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [temporaryPassword, setTemporaryPassword] = useState('Welcome123!');
  const [accountStatus, setAccountStatus] = useState<EmployeeAccountStatus>('Active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('A valid Email Address is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Mobile Number is required.');
      return;
    }
    if (!designation.trim()) {
      setError('Designation is required.');
      return;
    }
    if (!joiningDate) {
      setError('Joining Date is required.');
      return;
    }
    if (!temporaryPassword.trim()) {
      setError('Temporary Password is required.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const created = await employeeService.createEmployee({
        name: name.trim(),
        employeeId: employeeId.trim() || undefined as any,
        email: email.trim(),
        phone: phone.trim(),
        designation: designation.trim(),
        department: department.trim(),
        joiningDate: joiningDate,
        accountStatus: accountStatus,
        temporaryPassword: temporaryPassword.trim(),
      });

      setSuccessToast(`Employee "${created.name}" (${created.employeeId}) created successfully!`);

      setTimeout(() => {
        navigate('/employees');
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to create employee account. Please check the inputs.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-32 max-w-3xl mx-auto space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="space-y-3">
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
            onClick={() => navigate('/employees')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-full bg-white/60 hover:bg-white border border-slate-200/80 shadow-2xs transition-all active:scale-95"
          >
            <span>Employee Directory</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Add New Employee
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Create an official employee account and set up login credentials.
          </p>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 text-xs sm:text-sm text-rose-700 font-semibold animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Personal & Identification */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Personal & Account Identification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Liam Foster"
                required
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* Employee ID (Auto-generate if empty) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Employee ID <span className="text-slate-400 font-normal">(Leave empty to auto-generate)</span>
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP012"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Corporate Email Address <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="liam.foster@exofo.internal"
                required
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Mobile Contact Number <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 789-0123"
                required
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Role, Department & Joining Date */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Role, Department & Joining</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Designation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Lead Systems Engineer"
                required
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Department <span className="text-rose-500">*</span></span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium shadow-2xs"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Product Design</option>
                <option value="Infrastructure">Infrastructure & Cloud</option>
                <option value="Data Platform">Data Platform</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joining Date <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              />
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Initial Account Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountStatus('Active')}
                  className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                    accountStatus === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setAccountStatus('Inactive')}
                  className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                    accountStatus === 'Inactive'
                      ? 'bg-slate-100 text-slate-800 border-slate-300 ring-2 ring-slate-400/20'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Security & Credentials */}
        <div className="glass-surface rounded-[26px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            <span>Account Security & Temporary Password</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Temporary Login Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
              placeholder="e.g. Welcome123!"
              required
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              The employee will be required to change this password on their initial login.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#1261E8] to-[#0645B5] hover:opacity-95 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? 'Creating Employee...' : 'Create Employee Account'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

