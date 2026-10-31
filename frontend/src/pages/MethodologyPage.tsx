import React from 'react';
import {
  BookOpen,
  Layers,
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-brand-400" />
          Academic Project Methodology & Architecture
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          B.Tech AI & Data Science • Cloud Computing for Data Analytics IA3 Comprehensive Technical Dossier
        </p>
      </div>

      {/* Project Overview Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Project Abstract & Core Objective</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          Rapid urbanization and climate volatility have triggered critical water security challenges across India, exemplifying both chronic chemical degradation of water bodies and catastrophic urban drought crises—such as Chennai’s 2019 "Day Zero." This cloud analytics platform integrates multi-source public hydrological records into an end-to-end data pipeline built on <strong>Google Cloud Platform (GCP)</strong>. By coupling <strong>BigQuery Sandbox</strong> with <strong>BigQuery ML</strong> and local Scikit-Learn models, the platform calculates standardized <strong>Water Quality Index (WQI)</strong> metrics across 1,991 national monitoring stations and forecasts 7-day forward water scarcity risk with over <strong>94% accuracy</strong> using non-leaking chronological validation.
        </p>
      </div>

      {/* Mathematical Formulations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WQI Calculation */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="font-bold text-white text-base flex items-center gap-2">
            <span className="text-cyan-400">1.</span>
            Weighted Arithmetic Water Quality Index (WQI)
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Derived using the Brown et al. formulation standardized under CPCB guidelines:
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-brand-300 space-y-2">
            <p>WQI = ∑(q_i · w_i) / ∑(w_i)</p>
            <p className="text-[11px] text-slate-400">
              Where q_i = 100 · |V_i - V_ideal| / |S_i - V_ideal|
            </p>
          </div>

          <div className="text-xs text-slate-300 space-y-1">
            <p><strong>Standards (S_i) & Unit Weights (w_i):</strong></p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li>pH: S = 8.5, Ideal = 7.0 (w = 0.1176)</li>
              <li>Dissolved Oxygen (DO): S = 5.0 mg/L, Ideal = 14.6 mg/L (w = 0.2000)</li>
              <li>BOD: S = 5.0 mg/L, Ideal = 0.0 mg/L (w = 0.2000)</li>
              <li>Conductivity: S = 300 µmhos/cm, Ideal = 0.0 (w = 0.0033)</li>
              <li>Nitrates: S = 45.0 mg/L, Ideal = 0.0 (w = 0.0222)</li>
              <li>Total Coliform: S = 50 MPN/100mL, Ideal = 0.0 (w = 0.0200)</li>
            </ul>
          </div>
        </div>

        {/* Scarcity Risk Classification */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="font-bold text-white text-base flex items-center gap-2">
            <span className="text-emerald-400">2.</span>
            Operational Scarcity Risk & Day Zero Criteria
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Multi-tier risk classification based on conservation capacity (11,057 mcft) and supply runway:
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
              <strong>Level 3 - Critical / Day Zero:</strong> Storage &lt; 10% (&lt; 1,105 mcft) OR Runway &lt; 40 days
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <strong>Level 2 - Severe Risk:</strong> Storage 10%–25% (1,105–2,764 mcft) OR Runway &lt; 90 days
            </div>
            <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300">
              <strong>Level 1 - Moderate Risk:</strong> Storage 25%–50% (2,764–5,528 mcft) OR Runway &lt; 180 days
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <strong>Level 0 - Low / Normal:</strong> Storage ≥ 50% (≥ 5,528 mcft)
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Provenance & Literature References */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-400" />
          Authentic Dataset Sources & Citations
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex justify-between items-start">
              <span className="font-bold text-white text-sm">
                1. Central Pollution Control Board (CPCB) — National Water Quality Monitoring Programme
              </span>
              <span className="text-cyan-400 font-mono text-[11px]">1,991 Records</span>
            </div>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Covers monitored stations across Indian rivers, lakes, and reservoirs with physicochemical water metrics. Licensing: Open Government Data (OGD) Platform India / Ministry of Environment, Forest and Climate Change.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex justify-between items-start">
              <span className="font-bold text-white text-sm">
                2. Central Water Commission (CWC) — Flood Forecast & Reservoir Registry
              </span>
              <span className="text-cyan-400 font-mono text-[11px]">1,747 Stations</span>
            </div>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Provides geospatial coordinates, river basins, Full Reservoir Level (FRL), Maximum Water Level (MWL), and warning levels across 146 major dams and 1,601 river gauges in India.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex justify-between items-start">
              <span className="font-bold text-white text-sm">
                3. Chennai Metro Water Supply & Sewerage Board (CMWSSB) — Reservoir Time-Series
              </span>
              <span className="text-cyan-400 font-mono text-[11px]">5,738 Days</span>
            </div>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Continuous 15-year daily storage levels (mcft) and catchment rainfall (mm) for Poondi, Cholavaram, Redhills, and Chembarambakkam reservoirs spanning 2004 to 2019.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
