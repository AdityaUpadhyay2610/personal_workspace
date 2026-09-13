import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';

export default function AuthPage({ defaultMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, register, continueAsGuest } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        await register({ name, email, password });
      }
    } catch (err) {
      console.error('Auth submission error:', err);
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#EBF2F8] p-3 sm:p-6 lg:p-10 font-sans text-neutral-800 antialiased selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split-Screen Card Container */}
      <div className="w-full max-w-5xl min-h-[620px] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10 border border-neutral-100">
        
        {/* ================= LEFT SECTION (Blue Gradient with 3D Bubbles) ================= */}
        <div className="w-full lg:w-[48%] bg-gradient-to-br from-[#005BEA] via-[#0066F6] to-[#0047C4] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden shrink-0">
          
          {/* 3D Decorative Spheres / Bubbles */}
          {/* Main Large Left Bubble */}
          <div
            className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full pointer-events-none shadow-2xl"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #2989FF 0%, #0056D6 60%, #003699 100%)',
              boxShadow: 'inset 0 -10px 25px rgba(0,0,0,0.35), 0 20px 40px rgba(0,0,0,0.3)',
            }}
          />
          {/* Secondary Foreground Bubble */}
          <div
            className="absolute -bottom-16 right-[-10px] w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #3DA2FF 0%, #0060E6 60%, #003B9E 100%)',
              boxShadow: 'inset 0 -10px 25px rgba(0,0,0,0.3), 0 15px 35px rgba(0,0,0,0.25)',
            }}
          />
          {/* Small Top Floating Bubble */}
          <div
            className="absolute top-[-30px] right-[-20px] w-40 h-40 rounded-full pointer-events-none opacity-40"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #5CB3FF 0%, #0066F6 70%, #0044B3 100%)',
            }}
          />

          {/* Left Content */}
          <div className="relative z-10 my-auto py-10 lg:py-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider uppercase leading-tight mb-2 text-white drop-shadow-sm">
              WELCOME
            </h1>
            <h2 className="text-sm sm:text-base lg:text-lg font-bold tracking-[0.2em] uppercase text-blue-100 mb-6 drop-shadow-xs">
              PERSONAL DOCX WORKSPACE
            </h2>
            <p className="text-xs sm:text-sm text-blue-50/85 leading-relaxed max-w-sm font-normal">
              An intelligent, block-based editor designed for crafting structured documents, interactive tables, Kanban boards, and instant Microsoft Word (.docx) exports.
            </p>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 text-[11px] text-blue-100/70 font-medium">
            &copy; {new Date().getFullYear()} Personal Workspace &middot; Private &amp; Encrypted
          </div>
        </div>

        {/* ================= RIGHT SECTION (Clean Sign In / Sign Up Form) ================= */}
        <div className="w-full lg:w-[52%] bg-white p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative">
          
          {/* Bottom Right Decorative Blue Bubble */}
          <div
            className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full pointer-events-none hidden sm:block"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #2E8DFF 0%, #0062E0 65%, #003EAB 100%)',
              boxShadow: 'inset 0 -8px 20px rgba(0,0,0,0.25)',
            }}
          />

          <div className="max-w-sm w-full mx-auto relative z-10">
            {/* Title & Subtitle */}
            <div className="mb-7">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D253A] tracking-tight mb-1.5">
                {isLogin ? 'Sign in' : 'Sign up'}
              </h2>
              <p className="text-xs text-neutral-400 font-normal">
                {isLogin
                  ? 'Welcome back! Please enter your details to sign in.'
                  : 'Create a free account to enable cloud auto-save & sync.'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-snug">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name Field (Sign Up mode only) */}
              {!isLogin && (
                <div className="relative flex items-center bg-[#F3F6F9] rounded-xl px-4 py-3 border border-transparent focus-within:border-neutral-300 focus-within:bg-white transition-all shadow-2xs">
                  <User className="w-5 h-5 text-neutral-700 shrink-0 mr-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-medium"
                  />
                </div>
              )}

              {/* Email / Username Field */}
              <div className="relative flex items-center bg-[#F3F6F9] rounded-xl px-4 py-3 border border-transparent focus-within:border-neutral-300 focus-within:bg-white transition-all shadow-2xs">
                {isLogin ? (
                  <User className="w-5 h-5 text-neutral-700 shrink-0 mr-3" />
                ) : (
                  <Mail className="w-5 h-5 text-neutral-700 shrink-0 mr-3" />
                )}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isLogin ? 'User Name / Email' : 'Email Address'}
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-medium"
                />
              </div>

              {/* Password Field */}
              <div className="relative flex items-center bg-[#F3F6F9] rounded-xl px-4 py-3 border border-transparent focus-within:border-neutral-300 focus-within:bg-white transition-all shadow-2xs">
                <Lock className="w-5 h-5 text-neutral-700 shrink-0 mr-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[11px] font-extrabold tracking-wider text-[#0B3B60] hover:text-blue-600 transition-colors uppercase cursor-pointer"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>

              {/* Remember Me & Forgot Password (Sign in mode) */}
              <div className="flex items-center justify-between text-xs pt-1 pb-1">
                <label className="flex items-center gap-2 text-neutral-600 select-none cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0B3B60] border-neutral-300 focus:ring-0 cursor-pointer accent-[#0B3B60]"
                  />
                  <span>Remember me</span>
                </label>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => alert('Please contact administrator to reset your password.')}
                    className="text-[#0B3B60] hover:text-blue-600 font-semibold cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              {/* Primary Solid Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0B3B60] hover:bg-[#072842] active:scale-[0.99] text-white text-sm font-bold tracking-wide rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <span>{isLogin ? 'Sign in' : 'Sign up'}</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-neutral-200"></div>
              <span className="absolute bg-white px-3 text-xs text-neutral-400 font-medium">
                Or
              </span>
            </div>

            {/* Secondary Outlined Action Button (Guest Access) */}
            <button
              type="button"
              onClick={continueAsGuest}
              className="w-full py-3 px-4 bg-white hover:bg-neutral-50 active:scale-[0.99] border border-neutral-900 hover:border-neutral-950 text-neutral-900 text-sm font-bold tracking-wide rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Sign in as Guest
            </button>

            {/* Bottom Mode Switcher */}
            <div className="mt-6 text-center text-xs text-neutral-500">
              <span>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsLogin(!isLogin);
                }}
                className="font-bold text-[#0B3B60] hover:text-blue-600 hover:underline cursor-pointer transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
