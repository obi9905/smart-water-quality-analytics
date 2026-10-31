# Smart Water Analytics — Frontend Web Application
## Cloud Computing for Data Analytics (IA3)

A responsive, high-performance web dashboard built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Recharts**, and **Lucide Icons**, integrated with the **FastAPI** backend and **Google BigQuery** data layers.

---

## Architecture & Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6 (configured with `/api` proxy to `http://127.0.0.1:8000`)
- **Styling**: Tailwind CSS (custom dark slate & teal environmental design palette)
- **Charts**: Recharts (PieChart, BarChart, AreaChart, ComposedChart)
- **Icons**: Lucide React
- **Type Safety**: Strict TypeScript interfaces matching backend Pydantic schemas

---

## Implemented Pages & Features

1. **Overview Dashboard** (`/`):
   - 4 Core KPI cards: Total Monitored Stations (1,747), National Avg WQI, Active Reservoir Storage (mcft and %), and Municipal Runway (days).
   - Real-time Drought Vulnerability notice banner.
   - Recharts WQI category breakdown and historical scarcity days distribution.
   - Individual reservoir volume bars (Poondi, Cholavaram, Redhills, Chembarambakkam).

2. **Water Quality Monitoring** (`/water-quality`):
   - Filterable data table of CPCB monitoring stations with state, WQI tier, and search queries.
   - Real parameters: pH, Dissolved Oxygen (DO), Biochemical Oxygen Demand (BOD), Conductivity, and WQI.
   - Top 12 states comparison chart.
   - One-click CSV export of filtered records.

3. **Reservoir Trends** (`/reservoir-trends`):
   - 15-year continuous time-series (2004–2019) across 5,738 observation days.
   - Start year and end year filtering with dynamic sampling step controls (Daily, Weekly, Bi-weekly, Monthly).
   - Area chart with Full Conservation Capacity benchmark (11,057 mcft) and Critical Drought line (1,105 mcft).
   - Stacked volume contributions and catchment rainfall vs storage velocity.

4. **Scarcity Risk Prediction** (`/prediction`):
   - Interactive simulator with parameter sliders and one-click historical presets (2019 Day Zero Drought, Summer Depletion, Monsoon Abundance).
   - Real-time `POST /api/predict-scarcity` inference calling the trained Random Forest and BigQuery ML models.
   - Displays 7-day predicted storage (%), operational risk badge (Level 0–3), supply forecast, multi-class confidence bars, and official conservation protocols.

5. **ML Evaluation & Benchmarks** (`/ml-evaluation`):
   - Chronological out-of-sample test results (2004–2016 Train vs 2017–2019 Test during Chennai's historic drought).
   - Full classification benchmark table: Naive Dummy (0.0%), BigQuery ML Logistic Regression (94.09%), Random Forest (94.20%), Gradient Boosting (92.77%).
   - Regression benchmarks: BigQuery ML Linear Regressor (MAE 1.15%, R² 0.9826).
   - Per-class metrics, confusion matrix, and top feature importances.

6. **Pipeline & Data Quality Status** (`/pipeline-status`):
   - BigQuery Sandbox specs (`smart-water-analytics-512816`, `smart_water_analytics`).
   - SQL transformations registry (`sql/01_create_tables.sql` through `sql/04_ml_models.sql`).
   - CPCB sensor validation audit (pH 0–14, DO ≥ 0, BOD ≥ 0) and 0.0% missing value audit for reservoirs.

7. **Academic Methodology & Dossier** (`/methodology`):
   - Mathematical formulation for Weighted Arithmetic Water Quality Index (Brown et al. / CPCB).
   - Day Zero operational criteria.
   - Dataset citations and open licensing provenance.

---

## Local Development & Startup

### 1. Ensure Backend is Running
In one terminal, start the FastAPI backend:
```bash
python backend/api/main.py
# Runs on http://127.0.0.1:8000
```

### 2. Start Frontend Dev Server
In a second terminal, start Vite:
```bash
cd frontend
npm run dev
```
The application will launch on **http://localhost:3000** (or http://localhost:5173).

### 3. Production Build
To validate TypeScript compilation and produce an optimized bundle:
```bash
npm run build
```
Build output is generated in `frontend/dist/`.
