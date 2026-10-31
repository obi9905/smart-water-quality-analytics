-- ============================================================================
-- 02_etl_water_quality.sql
-- ELT transformation: Cleans raw CPCB data and computes WQI inside BigQuery
-- ============================================================================

INSERT INTO `smart-water-analytics-512816.smart_water_analytics.fact_water_quality`
WITH parsed_raw AS (
  SELECT
    CONCAT('WQ_', CAST(year AS STRING), '_', CAST(ROW_NUMBER() OVER() AS STRING)) AS record_id,
    COALESCE(NULLIF(TRIM(station_code), 'NAN'), 'UNKNOWN') AS station_code,
    COALESCE(NULLIF(TRIM(location), 'NAN'), 'Unknown Monitoring Site') AS location,
    UPPER(COALESCE(NULLIF(TRIM(state), 'NAN'), 'UNKNOWN STATE')) AS state,
    year,
    SAFE_CAST(NULLIF(TRIM(temp), 'NAN') AS FLOAT64) AS temperature_c,
    SAFE_CAST(NULLIF(TRIM(dissolved_oxygen), 'NAN') AS FLOAT64) AS dissolved_oxygen_mg_l,
    SAFE_CAST(NULLIF(TRIM(ph), 'NAN') AS FLOAT64) AS ph,
    SAFE_CAST(NULLIF(TRIM(conductivity), 'NAN') AS FLOAT64) AS conductivity_umhos_cm,
    SAFE_CAST(NULLIF(TRIM(bod), 'NAN') AS FLOAT64) AS bod_mg_l,
    SAFE_CAST(NULLIF(TRIM(nitrate), 'NAN') AS FLOAT64) AS nitrate_nitrite_mg_l,
    SAFE_CAST(NULLIF(TRIM(fecal_coliform), 'NAN') AS FLOAT64) AS fecal_coliform_mpn_100ml,
    SAFE_CAST(NULLIF(TRIM(total_coliform), 'NAN') AS FLOAT64) AS total_coliform_mpn_100ml
  FROM `smart-water-analytics-512816.smart_water_analytics.raw_water_quality`
),
bounded_values AS (
  SELECT
    record_id,
    station_code,
    location,
    CASE 
      WHEN state = 'TAMILNADU' THEN 'TAMIL NADU'
      WHEN state = 'ORISSA' THEN 'ODISHA'
      ELSE state
    END AS state,
    year,
    IF(temperature_c BETWEEN 0 AND 55, temperature_c, NULL) AS temperature_c,
    IF(dissolved_oxygen_mg_l >= 0, dissolved_oxygen_mg_l, NULL) AS dissolved_oxygen_mg_l,
    IF(ph BETWEEN 0 AND 14, ph, NULL) AS ph,
    IF(conductivity_umhos_cm >= 0, conductivity_umhos_cm, NULL) AS conductivity_umhos_cm,
    IF(bod_mg_l >= 0, bod_mg_l, NULL) AS bod_mg_l,
    IF(nitrate_nitrite_mg_l >= 0, nitrate_nitrite_mg_l, NULL) AS nitrate_nitrite_mg_l,
    IF(fecal_coliform_mpn_100ml >= 0, fecal_coliform_mpn_100ml, NULL) AS fecal_coliform_mpn_100ml,
    IF(total_coliform_mpn_100ml >= 0, total_coliform_mpn_100ml, NULL) AS total_coliform_mpn_100ml
  FROM parsed_raw
),
imputed AS (
  SELECT
    record_id,
    station_code,
    location,
    state,
    year,
    COALESCE(temperature_c, 26.5) AS temperature_c,
    COALESCE(dissolved_oxygen_mg_l, 6.5) AS dissolved_oxygen_mg_l,
    COALESCE(ph, 7.3) AS ph,
    COALESCE(conductivity_umhos_cm, 350.0) AS conductivity_umhos_cm,
    COALESCE(bod_mg_l, 2.5) AS bod_mg_l,
    COALESCE(nitrate_nitrite_mg_l, 1.2) AS nitrate_nitrite_mg_l,
    COALESCE(fecal_coliform_mpn_100ml, 50.0) AS fecal_coliform_mpn_100ml,
    COALESCE(total_coliform_mpn_100ml, 120.0) AS total_coliform_mpn_100ml
  FROM bounded_values
),
wqi_calc AS (
  SELECT
    *,
    -- Quality ratings
    (100.0 * ABS(ph - 7.0) / 1.5) AS q_ph,
    (100.0 * ABS(dissolved_oxygen_mg_l - 14.6) / 9.6) AS q_do,
    (100.0 * ABS(bod_mg_l) / 5.0) AS q_bod,
    (100.0 * ABS(conductivity_umhos_cm) / 300.0) AS q_cond,
    (100.0 * ABS(nitrate_nitrite_mg_l) / 45.0) AS q_nitrate,
    (100.0 * ABS(total_coliform_mpn_100ml) / 50.0) AS q_coliform
  FROM imputed
),
final_wqi AS (
  SELECT
    record_id,
    station_code,
    location,
    state,
    year,
    temperature_c,
    dissolved_oxygen_mg_l,
    ph,
    conductivity_umhos_cm,
    bod_mg_l,
    nitrate_nitrite_mg_l,
    fecal_coliform_mpn_100ml,
    total_coliform_mpn_100ml,
    ROUND(
      (q_ph * 0.1176 + q_do * 0.2000 + q_bod * 0.2000 + q_cond * 0.0033 + q_nitrate * 0.0222 + q_coliform * 0.0200) /
      (0.1176 + 0.2000 + 0.2000 + 0.0033 + 0.0222 + 0.0200),
      2
    ) AS water_quality_index
  FROM wqi_calc
)
SELECT
  record_id,
  station_code,
  location,
  state,
  year,
  temperature_c,
  dissolved_oxygen_mg_l,
  ph,
  conductivity_umhos_cm,
  bod_mg_l,
  nitrate_nitrite_mg_l,
  fecal_coliform_mpn_100ml,
  total_coliform_mpn_100ml,
  water_quality_index,
  CASE
    WHEN water_quality_index <= 25.0 THEN 'Excellent'
    WHEN water_quality_index <= 50.0 THEN 'Good'
    WHEN water_quality_index <= 75.0 THEN 'Poor'
    WHEN water_quality_index <= 100.0 THEN 'Very Poor'
    ELSE 'Unsuitable for Drinking'
  END AS wqi_category,
  (water_quality_index <= 50.0 AND ph BETWEEN 6.5 AND 8.5 AND bod_mg_l <= 3.0) AS is_potable
FROM final_wqi;
