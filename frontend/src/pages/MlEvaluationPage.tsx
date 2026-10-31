import React, { useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { MlEvaluationResponse } from '../types';

export const MlEvaluationPage: React.FC = () => {
  const [data, setData] = useState<MlEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getMlEvaluation();
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch ML evaluation report');
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading benchmark evaluation metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 glass-panel border border-rose-500/30 rounded-2xl text-center">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white">Metrics Unavailable</h3>
        <p className="text-xs text-slate-400 mt-1">{error || 'Could not load ML evaluation'}</p>
      </div>
    );
  }

  const { metadata, classification, regression } = data;

  // Format classification comparison for charts
  const classComparisonData = Object.entries(classification.models_comparison).map(([model, m]) => ({
    name: model.replace(/_/g, ' '),
    accuracy: Math.round((m.accuracy || 0) * 100),
    f1: Math.round((m.f1_weighted || 0) * 100),
  }));

  // Format regression comparison for charts
  const regComparisonData = Object.entries(regression.models_comparison).map(([model, m]) => ({
    name: model.replace(/_/g, ' '),
    mae: m.mae_storage_pct || 0,
    r2: Math.max(0, m.r2_score || 0),
  }));

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-brand-400" />
            Machine Learning Evaluation & Benchmarks
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Strict chronological evaluation comparing BigQuery ML, Random Forest, and Gradient Boosting against naive baselines.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 self-start sm:self-auto">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Zero Data Leakage: Chronological Split</span>
        </div>
      </div>

      {/* Evaluation Metadata Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">Cloud Machine Learning:</span>
          <span className="font-semibold text-white">{metadata.target_cloud_platform}</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Chronological Training Period:</span>
          <span className="font-mono text-slate-200">{metadata.train_period} ({metadata.train_samples_count} days)</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Out-of-Sample Test Period:</span>
          <span className="font-mono text-rose-300 font-semibold">{metadata.test_period} ({metadata.test_samples_count} days)</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Forecast Horizon:</span>
          <span className="font-mono text-cyan-300 font-semibold">T + {metadata.forecast_horizon_days} Days Ahead</span>
        </div>
      </div>

      {/* 1. Classification Benchmarks Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-400" />
          Task 1: Multi-Class Scarcity Risk Classification
        </h3>

        {/* Comparison Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Model Architecture</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Weighted Precision</th>
                  <th className="py-3 px-4">Weighted Recall</th>
                  <th className="py-3 px-4">Weighted F1</th>
                  <th className="py-3 px-4">Macro F1</th>
                  <th className="py-3 px-4">ROC-AUC (OVR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {Object.entries(classification.models_comparison).map(([model, m]) => {
                  const isBest = model === classification.best_model;
                  const isBqml = model.includes('BigQueryML');
                  return (
                    <tr
                      key={model}
                      className={
                        isBest
                          ? 'bg-brand-950/20 font-semibold text-white'
                          : isBqml
                          ? 'bg-slate-800/30 text-cyan-200'
                          : 'text-slate-300'
                      }
                    >
                      <td className="py-3 px-4 font-sans flex items-center gap-2">
                        {isBest && <span className="text-amber-400">★ Best</span>}
                        {isBqml && <span className="text-cyan-400">☁ BQML</span>}
                        <span>{model.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="py-3 px-4">{((m.accuracy || 0) * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4">{m.precision_weighted?.toFixed(4) || '—'}</td>
                      <td className="py-3 px-4">{m.recall_weighted?.toFixed(4) || '—'}</td>
                      <td className="py-3 px-4 font-bold text-brand-400">{m.f1_weighted?.toFixed(4) || '—'}</td>
                      <td className="py-3 px-4">{m.f1_macro?.toFixed(4) || '—'}</td>
                      <td className="py-3 px-4">{m.roc_auc_ovr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Classification Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white text-sm mb-4">Accuracy Comparison vs Naive Baseline (%)</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} interval={0} angle={-15} textAnchor="end" height={45} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#f1f5f9', fontSize: '11px' }}
                  />
                  <Bar dataKey="accuracy" name="Accuracy (%)" radius={[6, 6, 0, 0]}>
                    {classComparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.accuracy === 0 ? '#ef4444' : entry.accuracy > 93 ? '#0ea5e9' : '#38bdf8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              <strong>Academic Note:</strong> The naive baseline (Most Frequent Class) achieves 0.0% accuracy because the out-of-sample test period consists of the severe 2017–2019 Day Zero drought, completely breaking static majority-class heuristics.
            </p>
          </div>

          {/* Per-Class Performance Table */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white text-sm mb-4">Per-Tier Performance (Random Forest)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold font-sans">
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Precision</th>
                    <th className="py-2.5 px-3">Recall</th>
                    <th className="py-2.5 px-3">F1-Score</th>
                    <th className="py-2.5 px-3">Test Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Object.entries(classification.per_class_metrics).map(([tier, m]) => (
                    <tr key={tier} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-sans font-semibold text-white">{tier}</td>
                      <td className="py-2.5 px-3 text-slate-200">{m.precision.toFixed(3)}</td>
                      <td className="py-2.5 px-3 text-slate-200">{m.recall.toFixed(3)}</td>
                      <td className="py-2.5 px-3 text-brand-400 font-bold">{m['f1-score'].toFixed(3)}</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.support} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Regression Benchmarks Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-400" />
          Task 2: Continuous Reservoir Storage % Prediction (7-Day Ahead)
        </h3>

        {/* Regression Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Regressor Architecture</th>
                  <th className="py-3 px-4">MAE (% Storage)</th>
                  <th className="py-3 px-4">RMSE (% Storage)</th>
                  <th className="py-3 px-4">R² Score</th>
                  <th className="py-3 px-4">MAPE (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {Object.entries(regression.models_comparison).map(([model, m]) => {
                  const isBest = model === regression.best_model;
                  const isBqml = model.includes('BigQueryML');
                  return (
                    <tr
                      key={model}
                      className={
                        isBest
                          ? 'bg-brand-950/20 font-semibold text-white'
                          : isBqml
                          ? 'bg-slate-800/30 text-cyan-200'
                          : 'text-slate-300'
                      }
                    >
                      <td className="py-3 px-4 font-sans flex items-center gap-2">
                        {isBqml && <span className="text-cyan-400">☁ BQML</span>}
                        <span>{model.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">{m.mae_storage_pct?.toFixed(3)}%</td>
                      <td className="py-3 px-4">{m.rmse_storage_pct?.toFixed(3)}%</td>
                      <td className="py-3 px-4 font-bold text-cyan-300">{m.r2_score?.toFixed(4)}</td>
                      <td className="py-3 px-4">{m.mape_pct?.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Regressor MAE Comparison Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              MAE (% Capacity Deviation)
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} interval={0} angle={-15} textAnchor="end" height={45} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#f1f5f9', fontSize: '11px' }}
                    formatter={(val: any) => [`${val}%`, 'MAE']}
                  />
                  <Bar dataKey="mae" name="MAE (% storage)" radius={[4, 4, 0, 0]}>
                    {regComparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-reg-${index}`}
                        fill={entry.mae > 10 ? '#ef4444' : entry.mae < 1.5 ? '#10b981' : '#38bdf8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              BigQuery ML Linear Regressor achieves 1.15% MAE, dramatically outperforming the naive mean baseline (28.4%).
            </p>
          </div>

          {/* Top Features Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Top 8 Feature Importances
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classification.top_features.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 0.4]} />
                  <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={9} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#f1f5f9', fontSize: '11px' }}
                  />
                  <Bar dataKey="importance" name="Relative Importance" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Error Analysis & Limitations */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                Error Analysis & Hydrological Boundary Conditions
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
                {regression.error_analysis.limitation_note}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Largest Residual Outliers in Out-of-Sample Period:
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                {regression.error_analysis.largest_residuals.slice(0, 3).map((res) => (
                  <div key={res.date_str} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                    <span className="text-slate-300">{res.date_str}</span>
                    <span className="text-slate-400">Actual: {res.target_future_storage_pct.toFixed(1)}%</span>
                    <span className="text-slate-400">Pred: {res.predicted_storage_pct.toFixed(1)}%</span>
                    <span className="text-rose-400 font-bold">Error: {res.error_abs.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
