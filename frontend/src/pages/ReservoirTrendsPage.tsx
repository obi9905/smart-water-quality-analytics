import React, { useEffect, useState } from 'react';
import {
  TrendingDown,
  Calendar,
  Layers,
  CloudRain,
  AlertOctagon,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { api } from '../services/api';
import { ReservoirTrendsResponse } from '../types';

export const ReservoirTrendsPage: React.FC = () => {
  const [data, setData] = useState<ReservoirTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controls
  const [startYear, setStartYear] = useState<number>(2004);
  const [endYear, setEndYear] = useState<number>(2019);
  const [sampleRateDays, setSampleRateDays] = useState<number>(7);

  useEffect(() => {
    async function fetchTrends() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getReservoirTrends(startYear, endYear, sampleRateDays);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reservoir trends');
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, [startYear, endYear, sampleRateDays]);

  const years = Array.from({ length: 16 }, (_, i) => 2004 + i);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <TrendingDown className="w-6 h-6 text-brand-400" />
            Reservoir Storage & Scarcity Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical 15-year monitoring logs (2004–2019) across the Chennai reservoir system (Poondi, Cholavaram, Redhills, Chembarambakkam).
          </p>
        </div>

        {/* Units badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 self-start sm:self-auto">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>1 mcft = 28.32 Million Liters • Full Cap: 11,057 mcft</span>
        </div>
      </div>

      {/* Control Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Start Year */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">From:</span>
            <select
              value={startYear}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val <= endYear) setStartYear(val);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              {years.map((y) => (
                <option key={`start-${y}`} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* End Year */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">To:</span>
            <select
              value={endYear}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= startYear) setEndYear(val);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              {years.map((y) => (
                <option key={`end-${y}`} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Sampling Rate */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Resolution:</span>
            <select
              value={sampleRateDays}
              onChange={(e) => setSampleRateDays(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value={1}>Daily (High density)</option>
              <option value={7}>Weekly (Recommended)</option>
              <option value={14}>Bi-weekly</option>
              <option value={30}>Monthly</option>
            </select>
          </div>
        </div>

        {data && (
          <div className="text-xs text-slate-400 font-mono">
            Rendered Points: <strong className="text-slate-200">{data.sampled_points_count}</strong> ({data.period})
          </div>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-72 gap-3">
          <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading multi-year hydrological time-series...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-6 glass-panel border border-rose-500/40 rounded-2xl text-center">
          <AlertOctagon className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="text-sm text-white font-semibold">Error Loading Trends</p>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-6">
          {/* Main Total Storage Area Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Combined Active Storage (mcft) & Scarcity Thresholds</h3>
                <p className="text-xs text-slate-400">
                  Critical drought threshold &lt; 1,105 mcft (10% capacity). Historical observations only.
                </p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trends}>
                  <defs>
                    <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date_str" stroke="#94a3b8" fontSize={10} minTickGap={40} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 12000]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#f1f5f9', fontSize: '11px' }}
                    formatter={(val: any) => [`${Number(val).toFixed(1)} mcft`, 'Total Storage']}
                  />
                  <ReferenceLine
                    y={11057}
                    label={{ value: 'Full Capacity (11,057 mcft)', fill: '#38bdf8', fontSize: 10 }}
                    stroke="#38bdf8"
                    strokeDasharray="4 4"
                  />
                  <ReferenceLine
                    y={1105}
                    label={{ value: 'Critical Scarcity (10%)', fill: '#f43f5e', fontSize: 10 }}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                  />
                  <Area
                    type="monotone"
                    dataKey="total_storage_mcft"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#storageGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stacked Individual Reservoir Volumes */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Storage Breakdown by Individual Reservoir (mcft)
                </h3>
                <p className="text-xs text-slate-400">
                  Stacked volume contributions: Poondi, Cholavaram, Redhills, and Chembarambakkam
                </p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date_str" stroke="#94a3b8" fontSize={10} minTickGap={40} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#f1f5f9', fontSize: '11px' }}
                  />
                  <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="chembarambakkam_storage_mcft" name="Chembarambakkam" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="redhills_storage_mcft" name="Redhills" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="poondi_storage_mcft" name="Poondi" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="cholavaram_storage_mcft" name="Cholavaram" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Catchment Rainfall & Inflow Velocity */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  Catchment Rainfall & Storage Velocity
                </h3>
                <p className="text-xs text-slate-400">
                  Daily Catchment Rainfall (mm) vs 7-day Storage Change Rate (mcft delta)
                </p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date_str" stroke="#94a3b8" fontSize={10} minTickGap={40} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} label={{ value: '7d Storage Delta (mcft)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#f1f5f9', fontSize: '11px' }}
                  />
                  <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar yAxisId="left" dataKey="daily_rainfall_mm" name="Catchment Rain (mm)" fill="#38bdf8" radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="storage_7d_delta_mcft" name="7d Storage Change (mcft)" stroke="#f43f5e" dot={false} strokeWidth={1.5} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
