import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Droplets,
  Database,
  AlertTriangle,
  Waves,
  CloudRain,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { OverviewResponse } from '../types';
import { KpiCard } from '../components/KpiCard';

const WQI_COLORS: Record<string, string> = {
  Excellent: '#10b981',
  Good: '#0ea5e9',
  Poor: '#f59e0b',
  'Very Poor': '#f97316',
  'Unsuitable for Drinking': '#ef4444',
};

const RISK_COLORS: Record<string, string> = {
  Low: '#10b981',
  Moderate: '#0ea5e9',
  Severe: '#f59e0b',
  Critical: '#ef4444',
};

interface OverviewPageProps {
  onNavigate: (page: any) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getOverview();
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load overview data');
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading hydrological telemetry from BigQuery Sandbox...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 glass-panel border border-rose-500/30 rounded-2xl text-center">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Data Connection Error</h3>
        <p className="text-sm text-slate-400 mt-2">{error || 'Unable to retrieve overview telemetry'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { kpis, wqi_distribution, scarcity_risk_distribution, recent_reservoir_snapshot } = data;

  const wqiChartData = Object.entries(wqi_distribution).map(([name, value]) => ({
    name,
    value,
    color: WQI_COLORS[name] || '#64748b',
  }));

  const riskChartData = Object.entries(scarcity_risk_distribution).map(([name, count]) => ({
    name,
    days: count,
    color: RISK_COLORS[name] || '#64748b',
  }));

  const reservoirsList = [
    { name: 'Poondi Reservoir', current: recent_reservoir_snapshot.poondi_mcft, capacity: 3231 },
    { name: 'Cholavaram Reservoir', current: recent_reservoir_snapshot.cholavaram_mcft, capacity: 881 },
    { name: 'Redhills (Puzhal) Reservoir', current: recent_reservoir_snapshot.redhills_mcft, capacity: 3300 },
    { name: 'Chembarambakkam Lake', current: recent_reservoir_snapshot.chembarambakkam_mcft, capacity: 3645 },
  ];

  const isDroughtCritical = kpis.current_storage_percentage < 15.0;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Real-time Alert Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isDroughtCritical
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`p-3 rounded-xl ${
              isDroughtCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {isDroughtCritical ? <ShieldAlert className="w-6 h-6" /> : <Waves className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide uppercase text-white">
                {isDroughtCritical ? 'Drought Vulnerability Notice' : 'Water Storage Advisory'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-white/10 font-medium">
                Observation Date: {kpis.latest_observation_date}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Active combined storage stands at{' '}
              <strong className="text-white">{kpis.current_reservoir_storage_mcft.toFixed(1)} mcft</strong> (
              <strong className="text-white">{kpis.current_storage_percentage.toFixed(1)}%</strong> of 11,057 mcft
              capacity). Estimated municipal supply reserve is{' '}
              <strong className="text-white">{kpis.days_of_water_remaining.toFixed(0)} days</strong>.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('prediction')}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all shadow-md shadow-brand-600/30"
        >
          <span>Run 7-Day Scarcity AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Monitored Stations"
          value={kpis.total_monitoring_stations.toLocaleString()}
          subtitle="CPCB & CWC national stations"
          icon={MapPin}
          badge="1,747 CWC Gauges"
          badgeColor="sky"
        />
        <KpiCard
          title="National Average WQI"
          value={kpis.national_avg_wqi.toFixed(1)}
          subtitle={`Potable Water Share: ${kpis.national_potable_pct}%`}
          icon={Droplets}
          badge={kpis.national_avg_wqi > 75 ? 'Poor / Critical' : 'Moderate Quality'}
          badgeColor={kpis.national_avg_wqi > 75 ? 'rose' : 'amber'}
        />
        <KpiCard
          title="Active Reservoir Storage"
          value={`${kpis.current_storage_percentage.toFixed(1)}%`}
          subtitle={`${kpis.current_reservoir_storage_mcft.toFixed(0)} / 11,057 mcft`}
          icon={Database}
          badge={kpis.current_scarcity_risk + ' Scarcity Risk'}
          badgeColor={kpis.current_scarcity_risk === 'Critical' ? 'rose' : 'emerald'}
        />
        <KpiCard
          title="Municipal Supply Runway"
          value={`${kpis.days_of_water_remaining.toFixed(0)} Days`}
          subtitle="Historical drought rate: 18.3%"
          icon={TrendingDown}
          badge="28.5 mcft/day draw"
          badgeColor="indigo"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WQI Categorical Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">National Water Quality Index (WQI)</h3>
              <p className="text-xs text-slate-400">Distribution across 1,991 CPCB monitoring records</p>
            </div>
            <button
              onClick={() => onNavigate('water-quality')}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
            >
              <span>Explore Stations</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wqiChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {wqiChartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#f1f5f9', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Scarcity Risk Days */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Historical Scarcity Risk Days (2004–2019)</h3>
              <p className="text-xs text-slate-400">Total days spent in each operational scarcity risk tier (5,738 days)</p>
            </div>
            <button
              onClick={() => onNavigate('reservoir-trends')}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
            >
              <span>View Time-Series</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#f1f5f9', fontSize: '12px' }}
                />
                <Bar dataKey="days" radius={[6, 6, 0, 0]}>
                  {riskChartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reservoir Capacity Gauges */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Major Supply Reservoir Levels (Chennai Basin)
            </h3>
            <p className="text-xs text-slate-400">
              Live storage levels vs Full Reservoir Capacity (Total Conservation Capacity: 11,057 mcft)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 self-start">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Catchment Daily Rain:</span>
            <span className="font-mono font-bold text-white">
              {recent_reservoir_snapshot.daily_rainfall_mm.toFixed(1)} mm
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reservoirsList.map((res) => {
            const pct = Math.min(100, Math.max(0, (res.current / res.capacity) * 100));
            const isLow = pct < 20;
            return (
              <div key={res.name} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-xs text-white">{res.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Capacity: {res.capacity} mcft</p>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isLow ? 'bg-rose-500/20 text-rose-400' : 'bg-brand-500/20 text-brand-400'
                    }`}
                  >
                    {pct.toFixed(1)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLow
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                        : 'bg-gradient-to-r from-brand-500 to-cyan-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-2.5 text-[11px]">
                  <span className="text-slate-400">Current Storage:</span>
                  <span className="font-mono font-semibold text-slate-200">{res.current.toFixed(1)} mcft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
