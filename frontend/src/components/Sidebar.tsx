import React from 'react';
import {
  LayoutDashboard,
  Droplets,
  TrendingDown,
  BrainCircuit,
  BarChart3,
  Server,
  BookOpen,
  Cloud,
  ShieldCheck,
} from 'lucide-react';

export type PageId =
  | 'overview'
  | 'water-quality'
  | 'reservoir-trends'
  | 'prediction'
  | 'ml-evaluation'
  | 'pipeline-status'
  | 'methodology';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isBackendOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isBackendOnline,
}) => {
  const navItems = [
    { id: 'overview' as PageId, label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'water-quality' as PageId, label: 'Water Quality Monitoring', icon: Droplets },
    { id: 'reservoir-trends' as PageId, label: 'Reservoir Trends', icon: TrendingDown },
    { id: 'prediction' as PageId, label: 'Scarcity Prediction', icon: BrainCircuit },
    { id: 'ml-evaluation' as PageId, label: 'ML Evaluation & Benchmarks', icon: BarChart3 },
    { id: 'pipeline-status' as PageId, label: 'Pipeline & Data Quality', icon: Server },
    { id: 'methodology' as PageId, label: 'Architecture & Report', icon: BookOpen },
  ];

  return (
    <aside className="w-72 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 glass-panel min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold text-xl">
              💧
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-base leading-tight tracking-tight">
                Smart Water
              </h1>
              <p className="text-xs text-brand-400 font-medium tracking-wide uppercase">
                Analytics & Scarcity AI
              </p>
            </div>
          </div>

          {/* Cloud Badge */}
          <div className="mt-4 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>GCP BigQuery</span>
            </span>
            <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded font-mono font-semibold">
              ₹0 Sandbox
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigation Modules
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 m-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Backend API
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isBackendOnline
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/20 text-rose-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            {isBackendOnline ? 'Online (8000)' : 'Disconnected'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono truncate">
          Project: smart-water-analytics-512816
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          B.Tech AI & Data Science • IA3 Evaluation
        </p>
      </div>
    </aside>
  );
};
