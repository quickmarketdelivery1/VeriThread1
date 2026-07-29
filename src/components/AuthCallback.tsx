import React from 'react';
import { RefreshCw, AlertCircle, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthCallbackProps {
  isAuthenticating: boolean;
  error: string | null;
  onNavigate: (route: string) => void;
}

export default function AuthCallback({ isAuthenticating, error, onNavigate }: AuthCallbackProps) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        
        {/* Logo Branding */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">VeriThread</span>
        </div>

        {/* Status Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 shadow-inner">
          {error ? (
            <AlertCircle className="w-8 h-8 text-red-400" />
          ) : isAuthenticating ? (
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          ) : (
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          )}
        </div>

        {/* Status Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {error ? 'Magic Link Error' : isAuthenticating ? 'Authenticating Magic Link' : 'Authentication Successful'}
          </h2>
          <p className="text-sm text-neutral-400 max-w-xs mx-auto leading-relaxed">
            {error ? (
              error
            ) : isAuthenticating ? (
              'Verifying your security credentials with Firebase Auth and completing passwordless sign in...'
            ) : (
              'Redirecting you securely to your VeriThread brand dashboard...'
            )}
          </p>
        </div>

        {/* Action Button on Error */}
        {error && (
          <div className="pt-2">
            <button
              onClick={() => onNavigate('login')}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
