import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Check, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Calendar, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { Employee, EmployeeAccountStatus } from '../../types';
import { employeeService } from '../../services/employeeService';

export const EditEmployeePage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [accountStatus, setAccountStatus] = useState<EmployeeAccountStatus>('Active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmp() {
      if (!employeeId) return;
      try {
        setLoading(true);
        const data = await employeeService.getEmployeeById(employeeId);
        if (!data) {
          setError(`Employee "${employeeId}" not found.`);
        } else {
          setEmployee(data);
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone);
          setDesignation(data.designation);
          setDepartment(data.department);
          setJoiningDate(data.joiningDate ? data.joiningDate.split('T')[0] : '');
          setAccountStatus(data.accountStatus);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load employee.');
      } finally {
        setLoading(false);
      }
    }
    loadEmp();
  }, [employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

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

    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await employeeService.updateEmployee(employee.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        designation: designation.trim(),
        department: department.trim(),
        joiningDate: joiningDate || employee.joiningDate,
        accountStatus: accountStatus,
      });

      setSuccessToast(`Employee "${updated.name}" updated successfully!`);

      setTimeout(() => {
        navigate(`/employees/${updated.employeeId}`);
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to update employee details.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full pb-32 max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="h-10 w-32 bg-white/70 rounded-full" />
        <div className="h-64 bg-white/70 rounded-[28px]" />
        <div className="h-44 bg-white/70 rounded-[28px]" />
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="w-full pb-32 pt-8 text-center max-w-md mx-auto">
        <div className="glass-surface rounded-[28px] p-8 border border-white/80">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-800">Employee Not Found</h2>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/employees')}
            className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs"
          >
            Return to Employees
          </button>
        </div>
      </div>
    );
  }

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
        <button
          onClick={() => navigate(`/employees/${employee?.employeeId}`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Profile</span>
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Edit Employee: {employee?.name}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Update employee details, designation, department, and account status.
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

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-surface rounded-[26px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span>Personal & Account Information</span>
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
                required
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              />
            </div>

            {/* Employee ID (Read-only for safety) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Employee ID <span className="text-slate-400 font-normal">(System Identifier)</span>
              </label>
              <input
                type="text"
                value={employee?.employeeId}
                disabled
                className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-500 cursor-not-allowed font-mono shadow-2xs"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Mobile Number <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              />
            </div>
          </div>
        </div>

        <div className="glass-surface rounded-[26px] p-5 sm:p-7 border border-white/80 shadow-glass space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Role, Department & Account Status</span>
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
                required
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Department</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs font-medium"
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
                <span>Joining Date</span>
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              />
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Account Status
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

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/employees/${employee?.employeeId}`)}
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
            <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

