import React, { useState } from 'react';
import {
  BrainCircuit,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  CloudRain,
  Percent,
  Clock,
  Send,
} from 'lucide-react';
import { api } from '../services/api';
import { ScarcityPredictRequest, ScarcityPredictResponse } from '../types';

export const ScarcityPredictionPage: React.FC = () => {
  const [formData, setFormData] = useState<ScarcityPredictRequest>({
    current_storage_pct: 22.5,
    days_of_water_left: 85.0,
    rain_7d_sum_mm: 12.0,
    storage_7d_delta_mcft: -80.0,
    month: 6,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScarcityPredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const applyPreset = (preset: 'drought' | 'normal' | 'moderate') => {
    if (preset === 'drought') {
      setFormData({
        current_storage_pct: 4.8,
        days_of_water_left: 18.0,
        rain_7d_sum_mm: 0.0,
        storage_7d_delta_mcft: -195.0,
        month: 6,
      });
    } else if (preset === 'normal') {
      setFormData({
        current_storage_pct: 82.0,
        days_of_water_left: 318.0,
        rain_7d_sum_mm: 75.0,
        storage_7d_delta_mcft: 240.0,
        month: 11,
      });
    } else {
      setFormData({
        current_storage_pct: 35.0,
        days_of_water_left: 135.0,
        rain_7d_sum_mm: 8.0,
        storage_7d_delta_mcft: -110.0,
        month: 4,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.predictScarcity(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <BrainCircuit className="w-6 h-6 text-brand-400" />
          Water Scarcity Risk Prediction Engine
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Machine Learning inference predicting 7-day forward reservoir storage (%) and multi-class operational risk tier using Random Forest and BigQuery ML algorithms.
        </p>
      </div>

      {/* Scenario Presets Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-300 font-semibold flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Test Historical Scenarios:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => applyPreset('drought')}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all"
          >
            🚨 2019 Day Zero Drought
          </button>
          <button
            type="button"
            onClick={() => applyPreset('moderate')}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
          >
            ⚠️ Summer Depletion Phase
          </button>
          <button
            type="button"
            onClick={() => applyPreset('normal')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-all"
          >
            ✅ Northeast Monsoon Abundance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Prediction Input Form */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span>Hydrological Input Parameters</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Storage % */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-cyan-400" />
                  Current Active Storage (%)
                </label>
                <span className="font-mono font-bold text-brand-400">
                  {formData.current_storage_pct.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={formData.current_storage_pct}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    current_storage_pct: val,
                    days_of_water_left: Math.round(((val / 100) * 11057) / 28.5),
                  }));
                }}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Equivalent to {(((formData.current_storage_pct / 100) * 11057)).toFixed(0)} mcft active storage
              </p>
            </div>

            {/* Days of Water Left */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Municipal Supply Runway (Days)
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={formData.days_of_water_left}
                onChange={(e) => setFormData((prev) => ({ ...prev, days_of_water_left: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                required
              />
            </div>

            {/* 7-Day Cumulative Rainfall */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                7-Day Cumulative Catchment Rain (mm)
              </label>
              <input
                type="number"
                min="0"
                max="600"
                step="0.5"
                value={formData.rain_7d_sum_mm}
                onChange={(e) => setFormData((prev) => ({ ...prev, rain_7d_sum_mm: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                required
              />
            </div>

            {/* 7-Day Storage Delta */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                7-Day Storage Velocity (mcft change)
              </label>
              <input
                type="number"
                min="-600"
                max="2000"
                step="5"
                value={formData.storage_7d_delta_mcft}
                onChange={(e) => setFormData((prev) => ({ ...prev, storage_7d_delta_mcft: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Negative values indicate net drawdown/evaporation; positive indicates catchment recharge.
              </p>
            </div>

            {/* Month / Season */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Calendar Month
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData((prev) => ({ ...prev, month: parseInt(e.target.value) }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m} {idx >= 9 ? '(NE Monsoon)' : idx >= 5 ? '(SW Monsoon)' : '(Dry Period)'}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Computing Inference...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute ML Scarcity Forecast</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Display */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-5 glass-panel border border-rose-500/40 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {!result && !error && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Awaiting Model Parameters</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Adjust the hydrological parameters or select a historical preset on the left, then click Execute ML Scarcity Forecast.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {/* Main Risk Card */}
              <div
                className={`glass-panel p-6 rounded-2xl border ${
                  result.predicted_risk_level === 'Critical'
                    ? 'border-rose-500/60 bg-rose-950/20'
                    : result.predicted_risk_level === 'Severe'
                    ? 'border-amber-500/60 bg-amber-950/20'
                    : result.predicted_risk_level === 'Moderate'
                    ? 'border-sky-500/60 bg-sky-950/20'
                    : 'border-emerald-500/60 bg-emerald-950/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      7-Day Forecast Horizon
                    </span>
                    <h3 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-3">
                      <span>Operational Risk:</span>
                      <span
                        className={`px-3 py-1 rounded-xl text-base font-bold border ${
                          result.predicted_risk_level === 'Critical'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : result.predicted_risk_level === 'Severe'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : result.predicted_risk_level === 'Moderate'
                            ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}
                      >
                        {result.predicted_risk_level} (Level {result.predicted_risk_score})
                      </span>
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400">Forecasted Supply</span>
                    <p className="text-xl font-mono font-extrabold text-white">
                      {result.days_of_supply_forecast.toFixed(0)} Days
                    </p>
                  </div>
                </div>

                {/* Storage forecast metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs text-slate-400">Predicted Active Storage</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-mono font-bold text-white">
                        {result.predicted_future_storage_pct_7d.toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-400">
                        ({(((result.predicted_future_storage_pct_7d / 100) * 11057)).toFixed(0)} mcft)
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs text-slate-400">Storage Trajectory</span>
                    <div className="flex items-center gap-2 mt-1">
                      {result.predicted_future_storage_pct_7d < formData.current_storage_pct ? (
                        <>
                          <TrendingDown className="w-5 h-5 text-rose-400" />
                          <span className="text-sm font-semibold text-rose-400">
                            Depleting (-{(formData.current_storage_pct - result.predicted_future_storage_pct_7d).toFixed(1)}%)
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-semibold text-emerald-400">
                            Recharging (+{(result.predicted_future_storage_pct_7d - formData.current_storage_pct).toFixed(1)}%)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-300 block mb-1">
                    Municipal Policy & Conservation Protocol:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {result.recommendation}
                  </p>
                </div>
              </div>

              {/* Confidence Probabilities */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-4">
                  Multi-Class Probability Distribution
                </h4>
                <div className="space-y-3">
                  {Object.entries(result.confidence_probabilities).map(([tier, prob]) => {
                    const pct = Math.round(prob * 100);
                    return (
                      <div key={tier}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium">{tier} Risk</span>
                          <span className="font-mono text-slate-300 font-bold">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              tier === 'Critical'
                                ? 'bg-rose-500'
                                : tier === 'Severe'
                                ? 'bg-amber-500'
                                : tier === 'Moderate'
                                ? 'bg-sky-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
