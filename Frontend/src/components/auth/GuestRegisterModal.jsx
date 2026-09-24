import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  ShieldAlert,
  UserPlus,
  LogIn,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { validateAuthData } from '../../services/validation';

export default function GuestRegisterModal({
  isOpen,
  onClose,
}) {
  const { register, login } = useAuth();
  const [viewMode, setViewMode] = useState('prompt'); // 'prompt' | 'register' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (viewMode === 'login') {
        const validationError = validateAuthData({ email, password });
        if (validationError) throw new Error(validationError);
        await login({ email, password });
      } else {
        const validationError = validateAuthData({ name, email, password }, { requireName: true });
        if (validationError) throw new Error(validationError);
        await register({ name, email, password });
      }
      onClose();
    } catch (err) {
      console.error('Modal auth error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-md w-full overflow-hidden relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {viewMode === 'prompt' ? (
          <div className="p-6 sm:p-8">
            {/* Warning Icon Badge */}
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mb-4 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-neutral-950 mb-1.5">
              Register now to save
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
              You are using <strong className="text-neutral-900">Guest Mode</strong>. Guest documents are held in-memory and will not be saved to the database. Register an account to save, sync, and organize all your documents securely.
            </p>

            <div className="space-y-2.5 mb-6">
              <button
                type="button"
                onClick={() => setViewMode('register')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0B3B60] hover:bg-[#082b47] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account to Save</span>
              </button>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="font-bold text-[#0B3B60] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-neutral-950">
                {viewMode === 'register' ? 'Create Free Account' : 'Sign In'}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {viewMode === 'register'
                  ? 'Sign up to enable permanent cloud auto-save and private storage.'
                  : 'Sign in to access your saved workspace.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {viewMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      maxLength={80}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-neutral-950"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    maxLength={254}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-neutral-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-neutral-950"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-[#0B3B60] hover:bg-[#082b47] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <span>{viewMode === 'register' ? 'Register & Enable Cloud Save' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <button
                type="button"
                onClick={() => setViewMode('prompt')}
                className="text-neutral-500 hover:text-neutral-800 cursor-pointer"
              >
                &larr; Back to prompt
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setViewMode(viewMode === 'register' ? 'login' : 'register');
                }}
                className="font-bold text-[#0B3B60] hover:underline cursor-pointer"
              >
                {viewMode === 'register' ? 'Already have account? Sign In' : 'Need an account? Register'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
