import React, { useEffect, useState } from 'react';
import { api, DoctorUser } from '../api';
import { Wifi, WifiOff, RefreshCw, User, LogOut, Activity } from 'lucide-react';

interface NavbarProps {
  user: DoctorUser | null;
  onLogout: () => void;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onRefresh }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkPending = async () => {
    try {
      const count = await api.getPendingCount();
      setPendingCount(count);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto trigger sync on reconnect
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkPending();
    const interval = setInterval(checkPending, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      await api.syncOutbox();
      await checkPending();
      onRefresh();
    } catch (e) {
      console.error('Manual sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="border-b border-paper-border bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-clinical-700 text-white flex items-center justify-center shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">AarogyaTrack</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Every Visit Matters</p>
          </div>
        </div>

        {/* Status Indicators & User */}
        <div className="flex items-center gap-3">
          {/* Connectivity Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isOnline ? 'Online Sync Active' : 'Offline Mode (Local Dexie)'}</span>
          </div>

          {/* Pending Sync Badge & Trigger */}
          {pendingCount > 0 && (
            <button
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-clinical-700 text-white hover:bg-clinical-800 shadow-sm transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingCount} Pending Sync</span>
            </button>
          )}

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800">{user.name}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{user.role}</span>
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
