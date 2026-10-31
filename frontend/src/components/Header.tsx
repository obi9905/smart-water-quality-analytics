import React from 'react';
import { Database, Calendar, Activity } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  isBackendOnline: boolean;
  totalRecordsLoaded?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  isBackendOnline,
  totalRecordsLoaded,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        {totalRecordsLoaded !== undefined && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Records:</span>
            <span className="font-mono font-semibold text-white">
              {totalRecordsLoaded.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Period:</span>
          <span className="font-mono text-slate-200">2004–2019</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">Sync:</span>
          <span className={`font-mono font-medium ${isBackendOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isBackendOnline ? 'Active' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
};
