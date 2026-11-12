import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import illustrationImg from '../../assets/illustration.jpg';
import { employeeService } from '../services/employeeService';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  ArrowRight, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Role Tab: 'employee' or 'admin'
  const [roleTab, setRoleTab] = useState<'employee' | 'admin'>('employee');

  // Form State
  const [loginId, setLoginId] = useState('EMP009');
  const [password, setPassword] = useState('Welcome123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Desktop view mode toggle (Responsive vs Phone Frame Preview)
  const [previewMode, setPreviewMode] = useState<'responsive' | 'phone'>('responsive');

  const handleRoleTabChange = (role: 'employee' | 'admin') => {
    setRoleTab(role);
    setError(null);
    if (role === 'employee') {
      setLoginId('EMP009');
      setPassword('Welcome123!');
    } else {
      setLoginId('admin@exofo.internal');
      setPassword('admin123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginId.trim()) {
      setError(roleTab === 'employee' ? 'Please enter your Employee ID' : 'Please enter your Admin Login ID');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError(null);
    setIsLoading(true);

    // Simulate login authentication & resolve exact employee/admin role dynamically
    setTimeout(async () => {
      const trimmed = loginId.trim().toLowerCase();
      const isExplicitAdmin =
        trimmed === 'admin@exofo.internal' ||
        trimmed === 'admin' ||
        trimmed === 'miqdhadh@exofo.internal';

      let matchedEmployee = null;
      try {
        const allEmployees = await employeeService.getEmployees();
        matchedEmployee =
          allEmployees.find(
            (emp) =>
              emp.employeeId.toLowerCase() === trimmed ||
              emp.id.toLowerCase() === trimmed ||
              emp.email.toLowerCase() === trimmed ||
              emp.name.toLowerCase() === trimmed
          ) || null;
      } catch {
        // Fallback silently to direct identifier checks below
      }

      const isEmployeeLogin =
        Boolean(matchedEmployee) ||
        trimmed.startsWith('emp') ||
        (roleTab === 'employee' && !isExplicitAdmin);

      if (isEmployeeLogin && matchedEmployee) {
        const pwdValid = await employeeService.verifyEmployeeLoginPassword(
          matchedEmployee.id,
          password
        );
        if (!pwdValid) {
          setIsLoading(false);
          setError('Invalid password. Please enter your updated password.');
          return;
        }
      }

      localStorage.setItem('exofo_auth', 'true');
      localStorage.setItem('exofo_user_email', matchedEmployee ? matchedEmployee.email : trimmed);
      localStorage.setItem('exofo_user_role', isEmployeeLogin ? 'employee' : 'admin');

      if (isEmployeeLogin) {
        if (matchedEmployee) {
          localStorage.setItem('exofo_employee_id', matchedEmployee.id);
        } else {
          localStorage.setItem('exofo_employee_id', 'emp-ahmed');
        }
      } else {
        localStorage.removeItem('exofo_employee_id');
      }

      setIsLoading(false);
      const destination = isEmployeeLogin ? '/employee/dashboard' : '/';
      setSuccessToast(
        isEmployeeLogin
          ? `Signed in as ${matchedEmployee ? matchedEmployee.name : 'Employee'}! Redirecting to Workspace...`
          : 'Signed in as Administrator! Redirecting to Dashboard...'
      );
      setTimeout(() => {
        navigate(destination);
      }, 600);
    }, 450);
  };

  return (
    <div className="min-h-screen w-full bg-[#E9EFFA] flex flex-col justify-center items-center relative overflow-x-hidden p-0 sm:p-4 md:p-8 font-sans antialiased">
      {/* Background Decorative Ambient Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      {/* Desktop Mode Toggle Bar (Visible on Desktop >= 1024px) */}
      <aside aria-label="Preview settings" className="hidden lg:flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs z-20">
        <span className="text-xs font-bold text-slate-500 mr-1">Preview Mode:</span>
        <button
          onClick={() => setPreviewMode('responsive')}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            previewMode === 'responsive'
              ? 'bg-[#1261E8] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Responsive Split</span>
        </button>
        <button
          onClick={() => setPreviewMode('phone')}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            previewMode === 'phone'
              ? 'bg-[#1261E8] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Phone Frame</span>
        </button>
      </aside>

      {/* Main Container: Adapts based on screen size or selected preview mode */}
      <div
        className={`w-full transition-all duration-300 ${
          previewMode === 'phone'
            ? 'max-w-[390px] rounded-[44px] overflow-hidden shadow-2xl ring-[10px] ring-slate-800 bg-[#DDE7F6] border-4 border-slate-900 my-auto'
            : 'max-w-5xl rounded-[32px] overflow-hidden bg-white/40 lg:backdrop-blur-xl lg:border lg:border-white/80 lg:shadow-2xl'
        }`}
      >
        <div className={`w-full ${previewMode === 'phone' ? 'flex flex-col' : 'grid grid-cols-1 lg:grid-cols-12 min-h-[620px]'}`}>
          
          {/* ==================================================================
              Visual Showcase Section (Top on mobile / Left on desktop)
              ================================================================== */}
          <div
            className={`relative flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-[#DCE7F7] via-[#E2EDFB] to-[#EEF5FF] overflow-hidden ${
              previewMode === 'phone' ? 'pt-8 pb-4' : 'lg:col-span-6 lg:p-12'
            }`}
          >
            {/* Ambient Background Wave SVG */}
            <svg
              className="absolute inset-0 w-full h-full text-blue-200/40 pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 400 400"
              fill="none"
            >
              <path
                d="M-50,150 Q100,50 250,160 T500,100 L500,450 L-50,450 Z"
                fill="currentColor"
              />
            </svg>

            {/* The Exact Illustration from Design */}
            <div className="relative z-10 w-full max-w-[280px] sm:max-w-[340px] aspect-square flex items-center justify-center">
              <img
                src={illustrationImg}
                alt="Exofo Company Management Dashboard"
                className="w-full h-auto object-contain drop-shadow-sm select-none"
                draggable={false}
              />
            </div>

            {/* Desktop-only Marketing Copy */}
            {previewMode !== 'phone' && (
              <div className="hidden lg:block relative z-10 mt-6 text-center max-w-sm">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-[#1261E8] text-xs font-bold mb-3 border border-blue-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1261E8]" />
                  <span>Enterprise Management Platform</span>
                </div>
                <h2 className="text-xl font-extrabold text-[#0C102A] leading-tight">
                  Empower your team with intelligent insights.
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                  Real-time performance tracking, project analytics, and unified task management in one seamless system.
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-200/60">
                  <div>
                    <p className="text-base font-extrabold text-[#1261E8]">99.9%</p>
                    <p className="text-[10px] font-semibold text-slate-400">Uptime SLA</p>
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-[#1261E8]">2.4x</p>
                    <p className="text-[10px] font-semibold text-slate-400">Productivity</p>
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-[#1261E8]">SOC-2</p>
                    <p className="text-[10px] font-semibold text-slate-400">Certified</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ==================================================================
              Login Form Section (The 1:1 Sheet Card from design)
              ================================================================== */}
          <div
            className={`bg-white relative z-20 flex flex-col justify-center ${
              previewMode === 'phone'
                ? 'rounded-t-[36px] -mt-6 p-7 pt-4 shadow-xl'
                : 'rounded-t-[36px] -mt-6 lg:mt-0 lg:rounded-none lg:col-span-6 p-7 sm:p-10 lg:p-12 shadow-xl lg:shadow-none'
            }`}
          >
            {/* Sheet Handle Pill (Visible on mobile / phone frame) */}
            <div className={`w-14 h-1.5 rounded-full bg-[#E2E6EF] mx-auto mb-6 ${previewMode === 'phone' ? 'block' : 'lg:hidden'}`} />

            {/* Header: Brand & Subtitle */}
            <div className="text-center mb-5">
              <h1 className="text-3xl sm:text-[32px] font-extrabold text-[#0C102A] tracking-tight">
                Exofo
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Sign in to your Company Management System
              </p>
            </div>

            {/* Role Switcher Pill Tabs: Employee vs Administrator */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80 mb-5">
              <button
                type="button"
                onClick={() => handleRoleTabChange('employee')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  roleTab === 'employee'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Employee Portal</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  roleTab === 'admin'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Administrator</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-2.5 text-xs text-rose-600 font-semibold animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input 1: Login ID */}
              <div>
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <label htmlFor="loginId" className="text-xs font-bold text-slate-700">
                    {roleTab === 'employee' ? 'Employee ID or Email' : 'Administrator Email'}
                  </label>
                  {roleTab === 'employee' && (
                    <span className="text-[11px] font-semibold text-blue-600">
                      e.g. EMP009 (Ahmed)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <input
                    id="loginId"
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder={
                      roleTab === 'employee'
                        ? 'Enter your Employee ID (e.g. EMP009)'
                        : 'Enter admin email (admin@exofo.internal)'
                    }
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F4F6FC] border border-[#E6EBF5] text-xs sm:text-sm font-semibold text-[#0C102A] placeholder:text-[#78829A] focus:outline-none focus:bg-white focus:border-[#203CA3] focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Input 2: Password */}
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#F4F6FC] border border-[#E6EBF5] text-xs sm:text-sm font-semibold text-[#0C102A] placeholder:text-[#78829A] focus:outline-none focus:bg-white focus:border-[#203CA3] focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 stroke-[1.8]" />
                    ) : (
                      <Eye className="w-5 h-5 stroke-[1.8]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Options Row: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 text-xs">
                {/* Remember Me Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    role="checkbox"
                    aria-checked={rememberMe}
                    tabIndex={0}
                    className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-all ${
                      rememberMe
                        ? 'bg-[#162569] text-white shadow-2xs'
                        : 'bg-white border border-slate-300'
                    }`}
                  >
                    {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="font-semibold text-slate-700">Remember me</span>
                </label>

                {/* Forgot Password Link */}
                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link has been dispatched to your corporate administrator.');
                  }}
                  className="font-bold text-[#162569] hover:text-[#0C102A] hover:underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Action Button: Login */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#141C46] via-[#162569] to-[#203CA3] hover:opacity-95 active:scale-[0.99] text-white font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Login</span>
                  )}
                </button>
              </div>
            </form>

            {/* Footer encryption badge */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Protected by enterprise-grade 256-bit SSL encryption</span>
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-slate-900 text-white shadow-xl font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

