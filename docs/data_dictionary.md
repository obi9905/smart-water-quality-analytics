# Hydrological Data Dictionary & Schema Specification
## Smart Water Quality and Scarcity Prediction System

---

## 1. Raw Datasets Overview

The system ingests four authentic datasets from Indian governmental and hydrological authorities:

| Dataset Identifier | Primary Source Authority | Period | Records | Key Measurement Focus |
| :--- | :--- | :--- | :--- | :--- |
| `cpcb_water_quality.csv` | Central Pollution Control Board (CPCB) NWMP | 2003 – 2014 | 1,991 | Multi-parameter physicochemical water quality across Indian rivers, lakes, and reservoirs |
| `cwc_monitoring_stations.csv`| Central Water Commission (CWC), Ministry of Jal Shakti | Current | 1,747 | Geospatial coordinates, dam thresholds, FRL, MWL, and warning levels |
| `chennai_reservoir_levels.csv`| Chennai Metro Water Supply & Sewerage Board (CMWSSB) | 2004 – 2019 | 5,738 | Daily water storage levels (mcft) across Poondi, Cholavaram, Redhills, Chembarambakkam |
| `chennai_reservoir_rainfall.csv`| CMWSSB / Regional Meteorological Centre (RMC) | 2004 – 2019 | 5,738 | Daily catchment rainfall (mm) recorded at each reservoir site |

---

## 2. Raw Schema Definitions

### 2.1 CPCB Water Quality Monitoring (`cpcb_water_quality.csv`)

| Column Name | Data Type (Raw) | Target Type | Valid Range / Units | Description & Health Significance |
| :--- | :--- | :--- | :--- | :--- |
| `STATION CODE` | String (Object) | `VARCHAR(32)` | Alphanumeric (e.g., '1393') | Unique monitoring station identification code assigned by CPCB. |
| `LOCATIONS` | String (Object) | `VARCHAR(255)`| Text name | Geographical description and water body site name. |
| `STATE` | String (Object) | `VARCHAR(64)` | Indian State/UT | State jurisdiction administering the monitoring station. |
| `Temp` | String (Object) | `FLOAT64` | 0.0 – 50.0 °C | Ambient water temperature at sample collection time. |
| `D.O. (mg/l)` | String (Object) | `FLOAT64` | 0.0 – 15.0 mg/L | Dissolved Oxygen. Vital for aquatic life; levels < 4.0 mg/L indicate severe biological stress. |
| `PH` | String (Object) | `FLOAT64` | 0.0 – 14.0 (Ideal 6.5–8.5)| Standard measure of acidity/alkalinity. Values < 6.5 or > 8.5 breach BIS 10500 drinking standards. |
| `CONDUCTIVITY` | String (Object) | `FLOAT64` | 0 – 50,000 µmhos/cm | Electrical conductivity; proxy for dissolved ionic minerals and salinity. |
| `B.O.D. (mg/l)` | String (Object) | `FLOAT64` | 0.0 – 100.0 mg/L | Biochemical Oxygen Demand (5-day at 20°C). > 3.0 mg/L indicates organic pollution. |
| `NITRATE_NITRITE` | String (Object) | `FLOAT64` | 0.0 – 100.0 mg/L | Dissolved nitrate + nitrite nitrogen. High values trigger eutrophication and methemoglobinemia. |
| `FECAL COLIFORM` | String (Object) | `FLOAT64` | MPN / 100 mL | Fecal coliform bacterial density. Direct indicator of untreated sewage contamination. |
| `TOTAL COLIFORM` | String (Object) | `FLOAT64` | MPN / 100 mL | Total coliform count encompassing environmental and intestinal bacteria. |
| `year` | Integer | `INT64` | 2003 – 2014 | Year of measurement collection. |

### 2.2 CWC Monitoring Stations (`cwc_monitoring_stations.csv`)

| Column Name | Data Type | Units | Description |
| :--- | :--- | :--- | :--- |
| `station_code` | `VARCHAR(32)` | — | Unique CWC alphanumeric gauge/reservoir code. |
| `name` | `VARCHAR(128)` | — | Official name of river gauge, barrage, or dam. |
| `lat` | `FLOAT64` | Decimal Degrees | Latitude (8.0° N to 37.0° N). |
| `lon` | `FLOAT64` | Decimal Degrees | Longitude (68.0° E to 97.0° E). |
| `type` | `VARCHAR(16)` | Category | Site category: `Inflow` (Dam/Reservoir), `Base` (River gauge), `Level`. |
| `nearest_town` | `VARCHAR(64)` | Text | Closest municipal urban center. |
| `warning_level` | `FLOAT64` | Meters (MSL) | Water height triggering official flood alert. |
| `danger_level` | `FLOAT64` | Meters (MSL) | Critical threshold where bank overtopping occurs. |
| `frl` | `FLOAT64` | Meters (MSL) | Full Reservoir Level; maximum conservation storage level. |
| `mwl` | `FLOAT64` | Meters (MSL) | Maximum Water Level allowable during flood routing. |
| `highest_flow_level`| `FLOAT64` | Meters (MSL) | Historical peak water level recorded. |

### 2.3 Reservoir Daily Levels & Storage (`chennai_reservoir_levels.csv`)

| Column Name | Target Type | Units | Full Capacity (mcft) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `Date` | `DATE` | DD-MM-YYYY | — | Calendar observation date. |
| `POONDI` | `FLOAT64` | mcft | 3,231 mcft | Active storage in Satyamurthy Sagar (Poondi) reservoir. |
| `CHOLAVARAM` | `FLOAT64` | mcft | 881 mcft | Active storage in Cholavaram reservoir. |
| `REDHILLS` | `FLOAT64` | mcft | 3,300 mcft | Active storage in Puzhal (Redhills) reservoir. |
| `CHEMBARAMBAKKAM`| `FLOAT64` | mcft | 3,645 mcft | Active storage in Chembarambakkam lake reservoir. |

*Note: 1 mcft (million cubic feet) = 28.317 million liters = 0.02832 MCM (million cubic meters).*  
*Combined conservation storage capacity across the 4 major reservoirs = 11,057 mcft.*

---

## 3. Processed Analytical Schemas

### 3.1 `fact_water_quality_daily`

```sql
CREATE OR REPLACE TABLE `smart-water-analytics-512816.smart_water_analytics.fact_water_quality` (
    record_id STRING,
    station_code STRING,
    location STRING,
    state STRING,
    year INT64,
    temperature_c FLOAT64,
    dissolved_oxygen_mg_l FLOAT64,
    ph FLOAT64,
    conductivity_umhos_cm FLOAT64,
    bod_mg_l FLOAT64,
    nitrate_nitrite_mg_l FLOAT64,
    fecal_coliform_mpn_100ml FLOAT64,
    total_coliform_mpn_100ml FLOAT64,
    water_quality_index FLOAT64,
    wqi_category STRING,  -- 'Excellent', 'Good', 'Poor', 'Very Poor', 'Unsuitable'
    is_potable BOOLEAN,
    created_at TIMESTAMP
);
```

### 3.2 `fact_reservoir_scarcity_daily`

```sql
CREATE OR REPLACE TABLE `smart-water-analytics-512816.smart_water_analytics.fact_reservoir_scarcity` (
    date DATE,
    poondi_storage_mcft FLOAT64,
    cholavaram_storage_mcft FLOAT64,
    redhills_storage_mcft FLOAT64,
    chembarambakkam_storage_mcft FLOAT64,
    total_storage_mcft FLOAT64,
    storage_percentage FLOAT64,
    total_capacity_mcft FLOAT64, -- Constant 11,057 mcft
    daily_rainfall_mm FLOAT64,
    rainfall_7d_avg_mm FLOAT64,
    rainfall_30d_avg_mm FLOAT64,
    storage_7d_delta_mcft FLOAT64,
    estimated_daily_drawdown_mcft FLOAT64,
    days_of_supply_remaining FLOAT64,
    scarcity_risk_level STRING,  -- 'Low', 'Moderate', 'Severe', 'Critical'
    scarcity_risk_score INT64,   -- 0: Low, 1: Moderate, 2: Severe, 3: Critical
    monsoon_season STRING,       -- 'Southwest', 'Northeast', 'Non-monsoon'
    created_at TIMESTAMP
);
```

### 3.3 `ml_scarcity_features` (Model Training & Inference Store)

| Feature Name | Data Type | Formula / Origin | Modeling Role |
| :--- | :--- | :--- | :--- |
| `current_storage_pct` | `FLOAT64` | `total_storage_mcft / 11057.0 * 100` | Primary state feature |
| `storage_7d_rolling_avg`| `FLOAT64` | Moving average over 7 days | Short-term trend |
| `storage_30d_rolling_avg`|`FLOAT64` | Moving average over 30 days | Medium-term trend |
| `net_inflow_7d_mcft` | `FLOAT64` | `Storage(t) - Storage(t-7) + 7 * Demand` | Hydrological recharge rate |
| `rain_7d_sum_mm` | `FLOAT64` | 7-day cumulative rainfall | Precipitation impulse |
| `rain_30d_sum_mm` | `FLOAT64` | 30-day cumulative rainfall | Seasonal precipitation buffer |
| `days_of_water_left` | `FLOAT64` | `total_storage_mcft / 28.5` | Operational resilience metric |
| `day_of_year` | `INT64` | 1 – 366 | Seasonality cyclic indicator |
| `month` | `INT64` | 1 – 12 | Annual cyclic feature |
| `target_scarcity_risk_class`| `INT64` | 0: Low, 1: Moderate, 2: Severe, 3: Critical | Classification Target (Multi-class) |
| `target_future_storage_pct_7d`| `FLOAT64` | `Storage_pct(t+7)` | Regression Target (Continuous) |
