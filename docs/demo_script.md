# 5-Minute Live Demonstration Script (Viva Walkthrough)
## Smart Water Quality and Scarcity Prediction System

**Local Application URL**: `http://localhost:3000`  
**Backend API URL**: `http://127.0.0.1:8000` (Swagger Docs: `http://127.0.0.1:8000/docs`)  
**GCP Project ID**: `smart-water-analytics-512816`

---

## Preparation Before Professor Enters
1. Ensure the FastAPI backend is running:
   ```bash
   python backend/api/main.py
   # Confirms: 200 OK on http://127.0.0.1:8000/api/health
   ```
2. Ensure the Vite frontend is running:
   ```bash
   cd frontend && npm run dev
   # Confirms: Ready on http://localhost:3000
   ```
3. Open `http://localhost:3000` in Google Chrome or Edge.

---

## Step-by-Step 5-Minute Demonstration

### Minute 1: The Overview Dashboard (`/`)
- **Action**: Open the browser to the Overview page.
- **What to say**:
  > "Professor, this is our Smart Water Quality and Scarcity Prediction platform. In the top header, you can see live telemetry confirming that our backend is connected to the BigQuery Sandbox data warehouse. We are monitoring **1,747 official Central Water Commission monitoring stations** across India and tracking **5,738 continuous daily reservoir observations**."
- **Point out**:
  - The 4 KPI cards: 1,747 Stations, National Average WQI, Active Reservoir Storage (%), and Municipal Supply Runway.
  - The Water Quality Index distribution pie chart showing potable vs non-potable stations.
  - The 4 individual Chennai reservoir volume gauges (Poondi, Cholavaram, Redhills, Chembarambakkam) showing active storage vs 11,057 mcft full capacity.

---

### Minute 2: Water Quality Monitoring & Data Explorer (`/water-quality`)
- **Action**: Click **Water Quality Monitoring** in the left sidebar.
- **What to say**:
  > "Here, we display real physicochemical measurements collected under the CPCB National Water Quality Monitoring Programme. Our pipeline computes the Weighted Arithmetic Water Quality Index (WQI) based on Brown et al. standards across pH, dissolved oxygen, biological oxygen demand, and coliform count."
- **Interact**:
  - Filter by State (e.g., select **GOA** or **TAMIL NADU**): observe the table dynamically filter to state-specific monitoring sites.
  - Filter by WQI Tier (e.g., select **Good** or **Unsuitable for Drinking**).
  - Search for a specific station name like *"DAMANGANGA"*.
  - Click **Export Filtered CSV** to demonstrate client-side data export.

---

### Minute 3: Reservoir Trends & Historical Dynamics (`/reservoir-trends`)
- **Action**: Click **Reservoir Trends** in the left sidebar.
- **What to say**:
  > "This module visualizes 15 continuous years of daily hydrological storage and catchment rainfall logs from 2004 to 2019. The blue line tracks combined storage in million cubic feet (mcft) against the 11,057 mcft Full Reservoir Level, while the red dashed line marks the 10% Critical Day Zero threshold."
- **Interact**:
  - Switch Resolution dropdown from **Weekly** to **Monthly** or **Daily** to demonstrate dynamic client-side re-sampling.
  - Point out the 2015 massive flood surge and the devastating 2019 Day Zero crash where storage dropped below 100 mcft.

---

### Minute 4: Live ML Scarcity Risk Prediction (`/prediction`)
- **Action**: Click **Scarcity Prediction** in the left sidebar.
- **What to say**:
  > "This is our real-time machine learning prediction engine. Using 24 non-leaking hydrological features with time lags and rolling storage velocity, it predicts reservoir capacity 7 days into the future and classifies the operational risk tier."
- **Interact**:
  - Click the **🚨 2019 Day Zero Drought** preset button:
    * Notice parameters populate: Storage 4.8%, Runway 18 Days, Rain 0 mm, Drawdown -195 mcft, Month: June.
  - Click **Execute ML Scarcity Forecast**:
    * Watch the live API call return in < 50ms.
    * Show the **Critical Risk (Level 3)** badge, the forecasted storage, the confidence breakdown, and the municipal emergency protocol recommendation.
  - Click the **✅ Northeast Monsoon Abundance** preset button and execute:
    * Observe the risk instantly transition to **Low Risk (Level 0)** with positive storage trajectory.

---

### Minute 5: ML Benchmarks & Pipeline Architecture (`/ml-evaluation` & `/pipeline-status`)
- **Action**: Click **ML Evaluation & Benchmarks**, then **Pipeline & Data Quality**.
- **What to say**:
  > "Crucially, as required by the academic rubric, our models were evaluated using a strict chronological split (2004–2016 Train vs. 2017–2019 Test during the Day Zero drought). As you can see in the benchmark table, our BigQuery ML and Random Forest models achieve over **94% accuracy** on out-of-sample data, while the naive baseline scored 0% because it failed to account for drought non-stationarity."
- **Wrap up**:
  - Show the BigQuery Sandbox specifications in the Pipeline Status page, confirming zero cloud billing activation.
  - Conclude:
  > "All tests, datasets, SQL transformations, Docker containerization, and GitHub Actions CI/CD workflows are fully verified. I would be glad to take any questions."
