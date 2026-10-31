-- ============================================================================
-- 01_create_tables.sql
-- DDL for Smart Water Analytics in Google BigQuery (Project: smart-water-analytics-512816)
-- Conforms to BigQuery Sandbox Free Tier (10 GB active storage, 1 TB queries/mo)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS `smart-water-analytics-512816.smart_water_analytics`
OPTIONS (
  location = 'US',
  description = 'Smart Water Quality and Scarcity Prediction System Warehouse'
);

-- 1. Raw Ingestion Staging Tables
CREATE OR REPLACE TABLE `smart-water-analytics-512816.smart_water_analytics.raw_water_quality` (
    station_code STRING,
    location STRING,
    state STRING,
    temp STRING,
    dissolved_oxygen STRING,
    ph STRING,
    conductivity STRING,
    bod STRING,
    nitrate STRING,
    fecal_coliform STRING,
    total_coliform STRING,
    year INT64,
    ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE OR REPLACE TABLE `smart-water-analytics-512816.smart_water_analytics.raw_reservoir_levels` (
    date_str STRING,
    poondi FLOAT64,
    cholavaram FLOAT64,
    redhills FLOAT64,
    chembarambakkam FLOAT64,
    ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE OR REPLACE TABLE `smart-water-analytics-512816.smart_water_analytics.raw_reservoir_rainfall` (
    date_str STRING,
    poondi FLOAT64,
    cholavaram FLOAT64,
    redhills FLOAT64,
    chembarambakkam FLOAT64,
    ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- 2. Dimension Tables
CREATE OR REPLACE TABLE `smart-water-analytics-512816.smart_water_analytics.dim_monitoring_stations` (
    station_code STRING NOT NULL,
    station_name STRING,
    latitude FLOAT64,
    longitude FLOAT64,
    station_type STRING,
    nearest_town STRING,
    warning_level_m FLOAT64,
    danger_level_m FLOAT64,
    full_reservoir_level_m FLOAT64,
    maximum_water_level_m FLOAT64
);

-- 3. Curated Analytical Fact Tables
CREATE OR REPLACE TABLE `smart-water-analytics-512816.smart_water_analytics.fact_water_quality`
PARTITION BY RANGE_BUCKET(year, GENERATE_ARRAY(2000, 2030, 1))
CLUSTER BY state, wqi_category
AS SELECT
    CAST(NULL AS STRING) AS record_id,
    CAST(NULL AS STRING) AS station_code,
    CAST(NULL AS STRING) AS location,
    CAST(NULL AS STRING) AS state,
    CAST(NULL AS INT64) AS year,
    CAST(NULL AS FLOAT64) AS temperature_c,
    CAST(NULL AS FLOAT64) AS dissolved_oxygen_mg_l,
    CAST(NULL AS FLOAT64) AS ph,
    CAST(NULL AS FLOAT64) AS conductivity_umhos_cm,
    CAST(NULL AS FLOAT64) AS bod_mg_l,
    CAST(NULL AS FLOAT64) AS nitrate_nitrite_mg_l,
    CAST(NULL AS FLOAT64) AS fecal_coliform_mpn_100ml,
    CAST(NULL AS FLOAT64) AS total_coliform_mpn_100ml,
    CAST(NULL AS FLOAT64) AS water_quality_index,
    CAST(NULL AS STRING) AS wqi_category,
    CAST(NULL AS BOOLEAN) AS is_potable
LIMIT 0;

CREATE OR REPLACE TABLE `smart-water-analytics-512816.smart_water_analytics.fact_reservoir_scarcity`
PARTITION BY date
CLUSTER BY scarcity_risk_level, monsoon_season
AS SELECT
    CAST(NULL AS DATE) AS date,
    CAST(NULL AS FLOAT64) AS poondi_storage_mcft,
    CAST(NULL AS FLOAT64) AS cholavaram_storage_mcft,
    CAST(NULL AS FLOAT64) AS redhills_storage_mcft,
    CAST(NULL AS FLOAT64) AS chembarambakkam_storage_mcft,
    CAST(NULL AS FLOAT64) AS total_storage_mcft,
    CAST(NULL AS FLOAT64) AS storage_percentage,
    CAST(NULL AS FLOAT64) AS total_capacity_mcft,
    CAST(NULL AS FLOAT64) AS daily_rainfall_mm,
    CAST(NULL AS FLOAT64) AS rainfall_7d_avg_mm,
    CAST(NULL AS FLOAT64) AS rainfall_30d_avg_mm,
    CAST(NULL AS FLOAT64) AS storage_7d_delta_mcft,
    CAST(NULL AS FLOAT64) AS estimated_daily_drawdown_mcft,
    CAST(NULL AS FLOAT64) AS days_of_supply_remaining,
    CAST(NULL AS STRING) AS scarcity_risk_level,
    CAST(NULL AS INT64) AS scarcity_risk_score,
    CAST(NULL AS STRING) AS monsoon_season
LIMIT 0;
