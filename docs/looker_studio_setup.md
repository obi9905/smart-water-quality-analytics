# Looker Studio Cloud Visualization Setup Guide
## Smart Water Analytics Dashboard (100% Free / Zero-Cost)

**Project ID**: `smart-water-analytics-512816`  
**Dataset**: `smart_water_analytics`

---

## 1. Overview

Looker Studio (formerly Google Data Studio) provides completely free, interactive cloud business intelligence dashboards. It connects directly to **Google BigQuery Sandbox** or CSV uploads without requiring a billing account.

---

## 2. Option A: Connecting Directly to Google BigQuery Sandbox (Recommended)

1. Navigate to [Looker Studio](https://lookerstudio.google.com/) and log in with your Google account.
2. Click **Create** > **Data Source**.
3. Select the **BigQuery** connector from the Google Connectors list.
4. Authorize the connection to your GCP account.
5. In the navigation pane:
   - **Project**: Select `smart-water-analytics-512816`.
   - **Dataset**: Select `smart_water_analytics`.
   - **Table**: Select `fact_reservoir_scarcity` (or `fact_water_quality`).
6. Click **Connect** in the top right corner.
7. Click **Create Report** to start designing charts.

---

## 3. Option B: Connecting via File Upload (Instant Zero-Credential Fallback)

If your Google account has restricted BigQuery API access, use the direct CSV upload connector:
1. In Looker Studio, click **Create** > **Data Source**.
2. Select **File Upload**.
3. Upload `data/processed/fact_reservoir_scarcity.csv` or `data/processed/fact_water_quality.csv`.
4. Click **Connect** and **Create Report**.

---

## 4. Recommended Looker Studio Report Visualizations

### Page 1: Reservoir Scarcity & Storage Dynamics
- **Time Series Line Chart**:
  - Dimension: `date`
  - Metric: `total_storage_mcft` (Sum/Avg)
  - Secondary Metric: `storage_percentage`
  - Reference Line: Constant value `1105.7` (10% Critical Day Zero threshold).
- **Stacked Area Chart**:
  - Dimension: `date`
  - Metrics: `poondi_storage_mcft`, `cholavaram_storage_mcft`, `redhills_storage_mcft`, `chembarambakkam_storage_mcft`.
- **Scorecards**:
  - Current Storage Percentage
  - Municipal Days Remaining
  - Active Scarcity Tier

### Page 2: National Water Quality Monitoring
- **Geo Map / Choropleth**:
  - Location Dimension: `state`
  - Color Metric: `water_quality_index` (Average)
- **Bar Chart**:
  - Dimension: `state`
  - Metric: `avg_bod`, `avg_do`, `avg_ph`
- **Filter Controls**:
  - Dropdown filter on `state`
  - Dropdown filter on `wqi_category`
