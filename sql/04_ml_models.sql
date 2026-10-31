-- ============================================================================
-- 04_ml_models.sql
-- Managed Cloud Machine Learning via BigQuery ML (BQML)
-- Project: smart-water-analytics-512816
-- ============================================================================

-- 1. Create ML Training Dataset View with Chronological Split
-- Training Set: Observations prior to 2017-01-01
-- Test Set: Observations from 2017-01-01 to 2019-09-16 (Evaluates during historic drought)
CREATE OR REPLACE VIEW `smart-water-analytics-512816.smart_water_analytics.v_ml_scarcity_features` AS
WITH base AS (
  SELECT
    date,
    storage_percentage AS current_storage_pct,
    total_storage_mcft AS current_storage_mcft,
    days_of_supply_remaining AS days_of_water_left,
    LAG(storage_percentage, 1) OVER(ORDER BY date) AS storage_pct_lag_1d,
    LAG(storage_percentage, 7) OVER(ORDER BY date) AS storage_pct_lag_7d,
    LAG(storage_percentage, 30) OVER(ORDER BY date) AS storage_pct_lag_30d,
    AVG(storage_percentage) OVER(ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS storage_rolling_mean_7d,
    AVG(storage_percentage) OVER(ORDER BY date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) AS storage_rolling_mean_30d,
    storage_7d_delta_mcft,
    daily_rainfall_mm,
    SUM(daily_rainfall_mm) OVER(ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rain_7d_sum_mm,
    SUM(daily_rainfall_mm) OVER(ORDER BY date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) AS rain_30d_sum_mm,
    EXTRACT(MONTH FROM date) AS month,
    EXTRACT(DAYOFYEAR FROM date) AS day_of_year,
    IF(monsoon_season = 'Northeast Monsoon', 1, 0) AS is_northeast_monsoon,
    IF(monsoon_season = 'Southwest Monsoon', 1, 0) AS is_southwest_monsoon,
    -- Future Target 7 Days Ahead
    LEAD(storage_percentage, 7) OVER(ORDER BY date) AS target_future_storage_pct_7d,
    LEAD(scarcity_risk_level, 7) OVER(ORDER BY date) AS target_scarcity_risk_class_7d
  FROM `smart-water-analytics-512816.smart_water_analytics.fact_reservoir_scarcity`
)
SELECT * FROM base
WHERE storage_pct_lag_30d IS NOT NULL
  AND target_future_storage_pct_7d IS NOT NULL;

-- 2. Train Multi-Class Scarcity Risk Classifier Model (BigQuery ML)
CREATE OR REPLACE MODEL `smart-water-analytics-512816.smart_water_analytics.scarcity_risk_classifier`
OPTIONS (
  model_type = 'LOGISTIC_REG',
  auto_class_weights = TRUE,
  input_label_cols = ['target_scarcity_risk_class_7d'],
  max_iterations = 30,
  data_split_method = 'CUSTOM',
  data_split_col = 'is_eval'
) AS
SELECT
  current_storage_pct,
  current_storage_mcft,
  days_of_water_left,
  storage_pct_lag_1d,
  storage_pct_lag_7d,
  storage_pct_lag_30d,
  storage_rolling_mean_7d,
  storage_rolling_mean_30d,
  storage_7d_delta_mcft,
  daily_rainfall_mm,
  rain_7d_sum_mm,
  rain_30d_sum_mm,
  month,
  day_of_year,
  is_northeast_monsoon,
  is_southwest_monsoon,
  target_scarcity_risk_class_7d,
  IF(date >= '2017-01-01', TRUE, FALSE) AS is_eval
FROM `smart-water-analytics-512816.smart_water_analytics.v_ml_scarcity_features`;

-- 3. Evaluate Classifier Model Metrics (Precision, Recall, F1, Accuracy, Log Loss)
SELECT
  *
FROM
  ML.EVALUATE(
    MODEL `smart-water-analytics-512816.smart_water_analytics.scarcity_risk_classifier`
  );

-- 4. Train Continuous Reservoir Storage Prediction Regressor Model (BigQuery ML)
CREATE OR REPLACE MODEL `smart-water-analytics-512816.smart_water_analytics.storage_depletion_regressor`
OPTIONS (
  model_type = 'LINEAR_REG',
  input_label_cols = ['target_future_storage_pct_7d'],
  max_iterations = 30,
  data_split_method = 'CUSTOM',
  data_split_col = 'is_eval'
) AS
SELECT
  current_storage_pct,
  current_storage_mcft,
  days_of_water_left,
  storage_pct_lag_1d,
  storage_pct_lag_7d,
  storage_pct_lag_30d,
  storage_rolling_mean_7d,
  storage_rolling_mean_30d,
  storage_7d_delta_mcft,
  daily_rainfall_mm,
  rain_7d_sum_mm,
  rain_30d_sum_mm,
  month,
  day_of_year,
  is_northeast_monsoon,
  is_southwest_monsoon,
  target_future_storage_pct_7d,
  IF(date >= '2017-01-01', TRUE, FALSE) AS is_eval
FROM `smart-water-analytics-512816.smart_water_analytics.v_ml_scarcity_features`;

-- 5. Evaluate Regressor Metrics (MAE, MSE, RMSE, R-squared)
SELECT
  *
FROM
  ML.EVALUATE(
    MODEL `smart-water-analytics-512816.smart_water_analytics.storage_depletion_regressor`
  );
