-- ============================================================================
-- 03_etl_reservoir_scarcity.sql
-- ELT transformation: Aggregates daily reservoir storage, computes rolling averages,
-- depletion dynamics, and classifies scarcity risk levels using BigQuery Window Functions.
-- ============================================================================

INSERT INTO `smart-water-analytics-512816.smart_water_analytics.fact_reservoir_scarcity`
WITH merged_raw AS (
  SELECT
    PARSE_DATE('%d-%m-%Y', l.date_str) AS date,
    l.poondi AS poondi_storage_mcft,
    l.cholavaram AS cholavaram_storage_mcft,
    l.redhills AS redhills_storage_mcft,
    l.chembarambakkam AS chembarambakkam_storage_mcft,
    (l.poondi + l.cholavaram + l.redhills + l.chembarambakkam) AS total_storage_mcft,
    11057.0 AS total_capacity_mcft,
    ROUND(((l.poondi + l.cholavaram + l.redhills + l.chembarambakkam) / 11057.0) * 100.0, 2) AS storage_percentage,
    ((r.poondi + r.cholavaram + r.redhills + r.chembarambakkam) / 4.0) AS daily_rainfall_mm,
    28.5 AS estimated_daily_drawdown_mcft
  FROM `smart-water-analytics-512816.smart_water_analytics.raw_reservoir_levels` l
  INNER JOIN `smart-water-analytics-512816.smart_water_analytics.raw_reservoir_rainfall` r
    ON l.date_str = r.date_str
),
rolling_metrics AS (
  SELECT
    date,
    poondi_storage_mcft,
    cholavaram_storage_mcft,
    redhills_storage_mcft,
    chembarambakkam_storage_mcft,
    total_storage_mcft,
    storage_percentage,
    total_capacity_mcft,
    daily_rainfall_mm,
    ROUND(AVG(daily_rainfall_mm) OVER(ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS rainfall_7d_avg_mm,
    ROUND(AVG(daily_rainfall_mm) OVER(ORDER BY date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW), 2) AS rainfall_30d_avg_mm,
    ROUND(total_storage_mcft - LAG(total_storage_mcft, 7) OVER(ORDER BY date), 2) AS storage_7d_delta_mcft,
    estimated_daily_drawdown_mcft,
    ROUND(total_storage_mcft / estimated_daily_drawdown_mcft, 1) AS days_of_supply_remaining,
    CASE
      WHEN EXTRACT(MONTH FROM date) IN (6, 7, 8, 9) THEN 'Southwest Monsoon'
      WHEN EXTRACT(MONTH FROM date) IN (10, 11, 12) THEN 'Northeast Monsoon'
      ELSE 'Dry Season'
    END AS monsoon_season
  FROM merged_raw
)
SELECT
  date,
  poondi_storage_mcft,
  cholavaram_storage_mcft,
  redhills_storage_mcft,
  chembarambakkam_storage_mcft,
  total_storage_mcft,
  storage_percentage,
  total_capacity_mcft,
  daily_rainfall_mm,
  rainfall_7d_avg_mm,
  rainfall_30d_avg_mm,
  COALESCE(storage_7d_delta_mcft, 0.0) AS storage_7d_delta_mcft,
  estimated_daily_drawdown_mcft,
  days_of_supply_remaining,
  CASE
    WHEN storage_percentage < 10.0 OR days_of_supply_remaining < 40.0 THEN 'Critical'
    WHEN storage_percentage < 25.0 OR days_of_supply_remaining < 90.0 THEN 'Severe'
    WHEN storage_percentage < 50.0 OR days_of_supply_remaining < 180.0 THEN 'Moderate'
    ELSE 'Low'
  END AS scarcity_risk_level,
  CASE
    WHEN storage_percentage < 10.0 OR days_of_supply_remaining < 40.0 THEN 3
    WHEN storage_percentage < 25.0 OR days_of_supply_remaining < 90.0 THEN 2
    WHEN storage_percentage < 50.0 OR days_of_supply_remaining < 180.0 THEN 1
    ELSE 0
  END AS scarcity_risk_score,
  monsoon_season
FROM rolling_metrics;
