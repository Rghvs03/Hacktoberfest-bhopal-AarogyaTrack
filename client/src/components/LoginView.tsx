import React, { useState } from 'react';
import { api, DoctorUser } from '../api';
import { Activity, ShieldCheck, Stethoscope, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onSuccess: (user: DoctorUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('dr.sharma@aarogya.in');
  const [password, setPassword] = useState('Doctor@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('dr.sharma@aarogya.in');
    setPassword('Doctor@123');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-paper-base">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card-clinical p-8 shadow-sm">
          {/* Logo & Headline */}
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-clinical-700 text-white items-center justify-center mb-3 shadow">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinician Workspace</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to access offline records & longitudinal health files</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                Doctor Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.name@aarogya.in"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-clinical-600 focus:ring-1 focus:ring-clinical-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-clinical-600 focus:ring-1 focus:ring-clinical-600 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-clinical-700 hover:bg-clinical-800 text-white font-medium text-sm shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In as Doctor'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill button */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-clinical-300 text-clinical-800 bg-clinical-50/50 hover:bg-clinical-50 text-xs font-semibold"
            >
              <ShieldCheck className="w-4 h-4 text-clinical-600" />
              <span>Autofill Verified Demo Account (Dr. Sharma)</span>
            </button>
          </div>
        </div>

        {/* Safety Note */}
        <p className="text-center text-[11px] text-slate-500 mt-4">
          🔐 AarogyaTrack Hackathon Prototype • Strictly Synthetic Medical Records
        </p>
      </div>
    </div>
  );
};

