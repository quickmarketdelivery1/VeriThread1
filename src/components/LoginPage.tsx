import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, RefreshCw, ShieldAlert, Eye } from 'lucide-react';
import { loginUser } from '../lib/firebase';

interface LoginPageProps {
  onNavigate: (route: string) => void;
  onLoginSuccess?: (email: string) => void;
  onPreviewLogin?: () => void;
}

export default function LoginPage({ onNavigate, onLoginSuccess, onPreviewLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isPreviewModeEnabled = import.meta.env.VITE_PREVIEW_MODE === 'true';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      await loginUser(email.trim(), password);
      setIsLoading(false);

      if (onLoginSuccess) {
        onLoginSuccess(email.trim());
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-8 flex flex-col gap-6 relative">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div 
            onClick={() => onNavigate('')}
            className="w-12 h-12 rounded-xl bg-[#0F5132] flex items-center justify-center text-white font-display font-bold text-2xl shadow-md cursor-pointer"
          >
            V
          </div>
          <h2 className="font-display font-bold text-2xl text-[#0F5132] tracking-tight mt-1">VeriThread</h2>
          <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Digital Product Passport Platform</p>
        </div>

        <div className="text-center">
          <h3 className="font-display font-semibold text-lg text-gray-900">Brand Studio Sign In</h3>
          <p className="text-gray-500 text-xs mt-1">Enter your registered email and password to log in.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="founder@brand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132] text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132] text-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-center mt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[160px] max-w-xs bg-[#0F5132] hover:bg-[#145A32] text-white py-2.5 px-6 rounded-xl font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Logging In...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 flex flex-col items-center gap-3">
          <p className="text-xs text-gray-500">
            Don't have an account yet?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="text-[#0F5132] font-bold hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </p>

          {/* Preview Mode Bypass Button (Discreet ghost/outline style) */}
          {isPreviewModeEnabled && (
            <button
              type="button"
              onClick={onPreviewLogin}
              className="mt-1 text-xs text-gray-600 hover:text-[#0F5132] border border-gray-200 hover:border-[#0F5132] bg-gray-50 hover:bg-emerald-50/50 py-1.5 px-4 rounded-xl transition-all cursor-pointer font-semibold inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-gray-500" /> Preview Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

