import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo';
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'sky',
}) => {
  const badgeClasses = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    sky: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  }[badgeColor];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 glass-card-hover relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            {value}
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-brand-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {badge && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${badgeClasses}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
