import React, { useEffect, useState } from 'react';
import {
  Droplets,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart2,
  Table as TableIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { WaterQualityResponse, WaterQualityRecord } from '../types';

export const WaterQualityPage: React.FC = () => {
  const [data, setData] = useState<WaterQualityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [limit, setLimit] = useState<number>(100);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getWaterQuality(selectedState, selectedCategory, limit);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch water quality data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedState, selectedCategory, limit]);

  const filteredRecords = data?.records.filter((rec: WaterQualityRecord) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      rec.location.toLowerCase().includes(q) ||
      rec.station_code.toLowerCase().includes(q) ||
      rec.state.toLowerCase().includes(q)
    );
  }) || [];

  const handleExportCsv = () => {
    if (!filteredRecords.length) return;
    const headers = [
      'Station Code', 'Location', 'State', 'Year', 'pH', 'DO (mg/l)',
      'Conductivity', 'BOD (mg/l)', 'Nitrates (mg/l)', 'Total Coliform',
      'WQI', 'Category', 'Is Potable'
    ];
    const rows = filteredRecords.map((r) => [
      `"${r.station_code}"`, `"${r.location.replace(/"/g, '""')}"`, `"${r.state}"`,
      r.year, r.ph, r.dissolved_oxygen_mg_l, r.conductivity_umhos_cm,
      r.bod_mg_l, r.nitrate_nitrite_mg_l, r.total_coliform_mpn_100ml,
      r.water_quality_index, `"${r.wqi_category}"`, r.is_potable
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cpcb_water_quality_${selectedState}_${selectedCategory}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Droplets className="w-6 h-6 text-brand-400" />
            National Water Quality Monitoring
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Standardized CPCB physicochemical parameters: pH, Dissolved Oxygen, BOD, Conductivity, Nitrates, and Coliform count.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={!filteredRecords.length}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* State Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All States ({data?.available_states.length || 0})</option>
              {data?.available_states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* WQI Category Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">WQI Tier:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Excellent">Excellent (0–25)</option>
              <option value="Good">Good (26–50)</option>
              <option value="Poor">Poor (51–75)</option>
              <option value="Very Poor">Very Poor (76–100)</option>
              <option value="Unsuitable for Drinking">Unsuitable (&gt;100)</option>
            </select>
          </div>

          {/* Records limit */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Limit:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
              <option value={250}>250 rows</option>
              <option value={500}>500 rows</option>
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search station or river..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Querying CPCB records from API...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-6 glass-panel border border-rose-500/40 rounded-2xl text-center">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="text-sm text-white font-semibold">Error Loading Data</p>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* State Average Parameters Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  State Water Quality Aggregates (Top 12 States)
                </h3>
                <p className="text-xs text-slate-400">
                  Average Dissolved Oxygen (mg/L), pH, and Biochemical Oxygen Demand (mg/L)
                </p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.state_aggregates.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="state" stroke="#94a3b8" fontSize={10} angle={-20} textAnchor="end" height={45} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#f1f5f9', fontSize: '11px' }}
                  />
                  <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="avg_do" name="Dissolved Oxygen (mg/L)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avg_ph" name="pH Value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avg_bod" name="BOD (mg/L)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Station Records Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-brand-400" />
                  Monitored Station Records
                </h3>
                <p className="text-xs text-slate-400">
                  Showing {filteredRecords.length} of {data.total_matching_records} filtered records
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Station</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">pH</th>
                    <th className="py-3 px-4">D.O. (mg/L)</th>
                    <th className="py-3 px-4">BOD (mg/L)</th>
                    <th className="py-3 px-4">Conductivity</th>
                    <th className="py-3 px-4">WQI</th>
                    <th className="py-3 px-4">Potability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredRecords.map((r) => {
                    const isPotable = r.is_potable;
                    return (
                      <tr key={r.record_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-200">{r.station_code}</td>
                        <td className="py-3 px-4 text-slate-300 font-sans max-w-xs truncate" title={r.location}>
                          {r.location}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-sans">{r.state}</td>
                        <td className="py-3 px-4 text-slate-400">{r.year}</td>
                        <td className="py-3 px-4 text-slate-200">{r.ph.toFixed(1)}</td>
                        <td className="py-3 px-4 text-slate-200">{r.dissolved_oxygen_mg_l.toFixed(1)}</td>
                        <td className="py-3 px-4 text-slate-200">{r.bod_mg_l.toFixed(1)}</td>
                        <td className="py-3 px-4 text-slate-200">{r.conductivity_umhos_cm.toFixed(0)}</td>
                        <td className="py-3 px-4 font-bold text-white">{r.water_quality_index.toFixed(1)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-sans font-medium ${
                              isPotable
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {isPotable ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Potable</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>Non-Potable</span>
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400 font-sans text-xs">
                        No stations match the selected filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
